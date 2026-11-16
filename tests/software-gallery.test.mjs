import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { loadTypescript } from "./load-typescript.mjs";

const ribbon = loadTypescript("../src/lib/film-ribbon.ts");
const layout = loadTypescript("../src/lib/gallery-layout.ts");
const software = loadTypescript("../src/lib/software-gallery.ts", { "./film-ribbon": ribbon, "./gallery-layout": layout });

test("Software projection matches the original perspective camera at wide and narrow sizes", () => {
  for (const [width, height] of [[2560, 1024], [1274, 720], [320, 568], [390, 844], [768, 1024], [844, 390]]) {
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0, 11); camera.updateMatrixWorld();
    for (const point of [[-11.8, -4.1, -6.4], [5.35, -1.05, -0.4], [1.15, 0.25, 3.55], [0, -0.08, 0]]) {
      const expected = new THREE.Vector3(...point).project(camera);
      const actual = software.projectGalleryPoint(...point, width, height);
      assert.ok(Math.abs(actual.x - (expected.x + 1) * width / 2) < 0.000001);
      assert.ok(Math.abs(actual.y - (1 - expected.y) * height / 2) < 0.000001);
    }
    const headline = software.galleryHeadlineBounds(width, height);
    assert.ok(Math.abs(headline.x + headline.width / 2 - width / 2) < 0.000001);
    assert.ok(Math.abs(headline.width / headline.height - 12.6 / 3.99) < 0.000001);
    assert.ok(headline.x >= width * 0.04 - 0.000001, "The centered headline must fit inside phone gutters");
    assert.ok(headline.x + headline.width <= width * 0.96 + 0.000001);
    const plane = layout.galleryHeadlineSize(width, height);
    const left = new THREE.Vector3(-plane.width / 2, -0.08 + plane.height / 2, 0).project(camera);
    assert.ok(Math.abs(headline.x - (left.x + 1) * width / 2) < 0.000001, "Both renderers must use the same responsive headline size");
  }
});

test("Software ribbon retains curvature, depth ordering, and complete entry/exit", () => {
  const geometry = software.createSoftwareGalleryGeometry();
  assert.equal(software.projectGalleryRibbon(0, 6, 2560, 1024, geometry).length, 0);
  assert.equal(software.projectGalleryRibbon(1, 6, 2560, 1024, geometry).length, 0);
  let rear = false, front = false;
  for (const progress of [0.25, 0.5, 0.75]) {
    const triangles = software.projectGalleryRibbon(progress, 6, 2560, 1024, geometry);
    assert.ok(triangles.length > 0);
    for (let index = 0; index < triangles.length; index++) {
      const triangle = triangles[index];
      if (index) assert.ok(triangles[index - 1].depth <= triangle.depth);
      rear ||= triangle.depth < 0;
      front ||= triangle.depth > 0;
      const center = { x: triangle.points.reduce((sum, p) => sum + p.x, 0) / 3, y: triangle.points.reduce((sum, p) => sum + p.y, 0) / 3 };
      assert.equal(software.containsGalleryPoint(center, triangle), true);
      assert.equal(software.containsGalleryPoint({ x: -100000, y: -100000 }, triangle), false);
    }
  }
  assert.ok(rear && front, "Photos must move both behind and in front of the headline");
});

test("Phone ribbons turn within the screen and use smaller cards; desktop geometry stays original", () => {
  for (const [width, height] of [[320, 568], [390, 844], [600, 1184], [767, 1024], [700, 390]]) {
    const phone = ribbon.createFilmRibbonLayout(width, height);
    assert.ok(phone.width < ribbon.FILM_WIDTH);
    const positions = new Float32Array((ribbon.FILM_SEGMENTS + 1) * 2 * 3);
    const scratch = ribbon.createRibbonScratch();
    let furthestRight = 0;
    for (let sample = 0; sample <= 120; sample++) {
      ribbon.deformFilmRibbon(positions, phone.length * sample / 120, scratch, phone);
      for (let index = 0; index < positions.length; index += 3) {
        const point = software.projectGalleryPoint(positions[index], positions[index + 1], positions[index + 2], width, height);
        furthestRight = Math.max(furthestRight, point.x);
      }
    }
    assert.ok(furthestRight < width * 0.9, "The entire bend must return to the front before reaching the right screen edge");
    const front = Math.max(...phone.curve.points.map(point => point.z));
    const top = software.projectGalleryPoint(0, phone.height / 2, front, width, height);
    const bottom = software.projectGalleryPoint(0, -phone.height / 2, front, width, height);
    assert.ok(bottom.y - top.y < height * 0.3, "A front card must stay below 30% of the phone height");
  }
  for (const [width, height] of [[768, 1024], [1440, 900], [2560, 1280]]) {
    assert.equal(ribbon.createFilmRibbonLayout(width, height), ribbon.DESKTOP_FILM_LAYOUT);
  }
});

test("Every mobile photo passes visibly through the front, including after a resize", () => {
  const geometry = software.createSoftwareGalleryGeometry();
  for (const [width, height] of [[390, 844], [1440, 900], [320, 568]]) {
    const seen = new Set();
    for (let sample = 1; sample < 100; sample++) {
      for (const triangle of software.projectGalleryRibbon(sample / 100, 9, width, height, geometry)) {
        const centerX = triangle.points.reduce((sum, point) => sum + point.x, 0) / 3;
        if (triangle.depth > 0 && centerX > 0 && centerX < width) seen.add(triangle.photo);
      }
    }
    assert.equal(seen.size, 9, "Every photo must reach the visible front of the gallery");
    assert.equal(software.projectGalleryRibbon(0, 9, width, height, geometry).length, 0);
    assert.equal(software.projectGalleryRibbon(1, 9, width, height, geometry).length, 0);
  }
});

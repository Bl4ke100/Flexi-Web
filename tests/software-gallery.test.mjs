import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { loadTypescript } from "./load-typescript.mjs";

const ribbon = loadTypescript("../src/lib/film-ribbon.ts");
const software = loadTypescript("../src/lib/software-gallery.ts", { "./film-ribbon": ribbon });

test("Software projection matches the original perspective camera at wide and narrow sizes", () => {
  for (const [width, height] of [[2560, 1024], [1274, 720], [390, 844]]) {
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

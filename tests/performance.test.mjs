import { test } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { loadTypescript } from "./load-typescript.mjs";

const ribbon = loadTypescript("../src/lib/film-ribbon.ts");
const images = loadTypescript("../src/lib/responsive-image.ts", {}, {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
});

test("Optimized ribbon vertices exactly preserve the original curve and bending", () => {
  const plane = new THREE.PlaneGeometry(1, 1, 48, 1);
  const positions = new Float32Array(plane.attributes.position.array.length);
  const expected = new Float32Array(positions.length);
  const scratch = ribbon.createRibbonScratch();
  const position = new THREE.Vector3();
  const up = new THREE.Vector3();
  // Include clamped ends and the cylinder bend, not just a straight section.
  for (let sample = -2; sample <= 102; sample++) {
    const center = sample / 100 * ribbon.FILM_CURVE_LENGTH;
    for (let i = 0; i < plane.attributes.uv.count; i++) {
      const u = plane.attributes.uv.getX(i) - 0.5;
      const v = plane.attributes.uv.getY(i) - 0.5;
      const arc = Math.max(0, Math.min(1, (center - u * 2.08) / ribbon.FILM_CURVE_LENGTH));
      ribbon.FILM_CURVE.getPointAt(arc, position);
      const tangent = ribbon.FILM_CURVE.getTangentAt(arc);
      up.set(-(tangent.y * tangent.x) / (tangent.x * tangent.x + 0.55), 1, 0).normalize();
      expected[i * 3] = position.x + v * 2.66 * up.x;
      expected[i * 3 + 1] = position.y + v * 2.66 * up.y;
      expected[i * 3 + 2] = position.z;
    }
    ribbon.deformFilmRibbon(positions, center, scratch);
    assert.deepEqual(positions, expected, `Geometry changed at sample ${sample}`);
  }
  plane.dispose();
});

test("Responsive delivery optimizes supported images while preserving external image support", () => {
  const local = images.responsiveImage("/posts/honda-vezel.png", "50vw");
  assert.match(local.src, /^\/_next\/image\?/);
  assert.ok(local.srcSet);
  assert.equal(local.sizes, "50vw");
  const stored = "https://example.supabase.co/storage/v1/object/public/site-media/fleet/car.png";
  assert.match(images.canvasImage(stored), /w=640/);
  const external = "https://another-provider.example/car.jpg";
  assert.deepEqual(images.responsiveImage(external), { src: external });
  assert.equal(images.canvasImage(external), external);
});

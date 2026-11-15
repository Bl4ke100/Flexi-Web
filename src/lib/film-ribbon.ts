import * as THREE from "three";

export const FILM_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-11.8, -4.1, -6.4),
  new THREE.Vector3(-7.2, -3.35, -6.2),
  new THREE.Vector3(-3.0, -2.7, -6.0),
  new THREE.Vector3(0.8, -2.1, -5.6),
  new THREE.Vector3(3.8, -1.58, -4.1),
  new THREE.Vector3(5.35, -1.05, -0.4),
  new THREE.Vector3(4.15, -0.5, 2.85),
  new THREE.Vector3(1.15, 0.25, 3.55),
  new THREE.Vector3(-2.1, 1.08, 3.45),
  new THREE.Vector3(-5.5, 1.98, 2.95),
  new THREE.Vector3(-8.4, 2.85, 2.4),
], false, "centripetal", 0.5);
export const FILM_CURVE_LENGTH = FILM_CURVE.getLength();
export const FILM_SEGMENTS = 48;
export const FILM_WIDTH = 2.08;
export const FILM_HEIGHT = 2.66;
export const FILM_STEP = FILM_WIDTH + 0.13;

export function createRibbonScratch() {
  return { position: new THREE.Vector3(), before: new THREE.Vector3(), after: new THREE.Vector3(), tangent: new THREE.Vector3(), up: new THREE.Vector3() };
}

// Use the exact original curve and finite-difference tangent, but share the
// arc-length lookup and scratch vectors between both vertices in each column.
export function deformFilmRibbon(positions: Float32Array, center: number, scratch: ReturnType<typeof createRibbonScratch>) {
  const { position, before, after, tangent, up } = scratch;
  const rowSize = FILM_SEGMENTS + 1;
  for (let column = 0; column < rowSize; column++) {
    // Match PlaneGeometry's Float32 UVs, including their original rounding.
    const u = Math.fround(column / FILM_SEGMENTS) - 0.5;
    const s = center - u * FILM_WIDTH;
    const t = FILM_CURVE.getUtoTmapping(Math.max(0, Math.min(1, s / FILM_CURVE_LENGTH)), 0);
    FILM_CURVE.getPoint(t, position);
    FILM_CURVE.getPoint(Math.max(0, t - 0.0001), before);
    FILM_CURVE.getPoint(Math.min(1, t + 0.0001), after);
    tangent.subVectors(after, before).normalize();
    up.set(-(tangent.y * tangent.x) / (tangent.x * tangent.x + 0.55), 1, 0).normalize();
    const top = column * 3;
    const bottom = (column + rowSize) * 3;
    const halfHeight = FILM_HEIGHT * 0.5;
    positions[top] = position.x + halfHeight * up.x;
    positions[top + 1] = position.y + halfHeight * up.y;
    positions[top + 2] = position.z;
    positions[bottom] = position.x - halfHeight * up.x;
    positions[bottom + 1] = position.y - halfHeight * up.y;
    positions[bottom + 2] = position.z;
  }
}

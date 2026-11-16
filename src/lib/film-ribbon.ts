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

export type FilmRibbonLayout = { curve: THREE.CatmullRomCurve3; length: number; width: number; height: number; step: number };
export const DESKTOP_FILM_LAYOUT: FilmRibbonLayout = { curve: FILM_CURVE, length: FILM_CURVE_LENGTH, width: FILM_WIDTH, height: FILM_HEIGHT, step: FILM_STEP };

export function createFilmRibbonLayout(viewportWidth: number, viewportHeight: number): FilmRibbonLayout {
  if (viewportWidth >= 768) return DESKTOP_FILM_LAYOUT;
  const cameraHeight = 2 * Math.tan(38 * Math.PI / 360) * 11;
  const cameraWidth = cameraHeight * viewportWidth / Math.max(1, viewportHeight);
  const width = Math.min(cameraWidth * 0.32, cameraHeight * 0.2);
  const height = width * FILM_HEIGHT / FILM_WIDTH;
  const depth = Math.min(1.8, cameraWidth * 0.4);
  // Turn back toward the viewer inside the phone's visible camera width.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.74 * cameraWidth, -0.85 * height, -depth),
    new THREE.Vector3(-0.42 * cameraWidth, -0.72 * height, -depth),
    new THREE.Vector3(-0.12 * cameraWidth, -0.55 * height, -depth),
    new THREE.Vector3(0.16 * cameraWidth, -0.35 * height, -0.85 * depth),
    new THREE.Vector3(0.29 * cameraWidth, -0.05 * height, -0.4 * depth),
    new THREE.Vector3(0.28 * cameraWidth, 0.25 * height, 0.1 * depth),
    new THREE.Vector3(0.12 * cameraWidth, 0.5 * height, 0.5 * depth),
    new THREE.Vector3(-0.16 * cameraWidth, 0.72 * height, 0.55 * depth),
    new THREE.Vector3(-0.44 * cameraWidth, 0.9 * height, 0.5 * depth),
    new THREE.Vector3(-0.74 * cameraWidth, 1.04 * height, 0.45 * depth),
  ], false, "centripetal", 0.5);
  // Center and fit the complete path, including its entry and exit, inside the
  // phone gutters. Keep the two passes clear of the corner controls.
  for (const point of curve.points) {
    point.x = (point.x + cameraWidth * 0.225) * 0.64;
    point.y = point.y * 0.65 - height * 0.08;
  }
  return { curve, length: curve.getLength(), width, height, step: width * (FILM_STEP / FILM_WIDTH) };
}

export function createRibbonScratch() {
  return { position: new THREE.Vector3(), before: new THREE.Vector3(), after: new THREE.Vector3(), tangent: new THREE.Vector3(), up: new THREE.Vector3() };
}

// Share the selected curve's arc-length lookup and finite-difference tangent
// between both vertices in each column; the default preserves desktop geometry.
export function deformFilmRibbon(positions: Float32Array, center: number, scratch: ReturnType<typeof createRibbonScratch>, layout = DESKTOP_FILM_LAYOUT) {
  const { position, before, after, tangent, up } = scratch;
  const rowSize = FILM_SEGMENTS + 1;
  for (let column = 0; column < rowSize; column++) {
    // Match PlaneGeometry's Float32 UVs, including their original rounding.
    const u = Math.fround(column / FILM_SEGMENTS) - 0.5;
    const s = center - u * layout.width;
    const t = layout.curve.getUtoTmapping(Math.max(0, Math.min(1, s / layout.length)), 0);
    layout.curve.getPoint(t, position);
    layout.curve.getPoint(Math.max(0, t - 0.0001), before);
    layout.curve.getPoint(Math.min(1, t + 0.0001), after);
    tangent.subVectors(after, before).normalize();
    up.set(-(tangent.y * tangent.x) / (tangent.x * tangent.x + 0.55), 1, 0).normalize();
    const top = column * 3;
    const bottom = (column + rowSize) * 3;
    const halfHeight = layout.height * 0.5;
    positions[top] = position.x + halfHeight * up.x;
    positions[top + 1] = position.y + halfHeight * up.y;
    positions[top + 2] = position.z;
    positions[bottom] = position.x - halfHeight * up.x;
    positions[bottom + 1] = position.y - halfHeight * up.y;
    positions[bottom + 2] = position.z;
  }
}

// CPU microbenchmark of the original and optimized moving-ribbon calculation.
// This is not a browser FPS measurement; rendering is checked separately.
import { performance } from "node:perf_hooks";
import * as THREE from "three";
import { loadTypescript } from "../tests/load-typescript.mjs";

const ribbon = loadTypescript("../src/lib/film-ribbon.ts");
const count = 7;
const geometries = Array.from({ length: count }, () => new THREE.PlaneGeometry(1, 1, 48, 1));
const scratches = Array.from({ length: count }, ribbon.createRibbonScratch);
const position = new THREE.Vector3();
const up = new THREE.Vector3();
const normal = new THREE.Vector3();
function run(original, frames) {
  const start = performance.now();
  for (let frame = 0; frame < frames; frame++) {
    const progress = frame / (frames - 1);
    const lead = -1.04 + progress * (ribbon.FILM_CURVE_LENGTH + 2.08 + (count - 1) * 2.21);
    for (let card = 0; card < count; card++) {
      const center = lead - card * 2.21;
      if (center + 1.04 <= 0.05 || center - 1.04 >= ribbon.FILM_CURVE_LENGTH - 0.05) continue;
      const geometry = geometries[card];
      if (original) {
        const uv = geometry.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
          const u = uv.getX(i) - 0.5;
          const v = uv.getY(i) - 0.5;
          const arc = Math.max(0, Math.min(1, (center - u * 2.08) / ribbon.FILM_CURVE_LENGTH));
          ribbon.FILM_CURVE.getPointAt(arc, position);
          const tangent = ribbon.FILM_CURVE.getTangentAt(arc);
          up.set(-(tangent.y * tangent.x) / (tangent.x * tangent.x + 0.55), 1, 0).normalize();
          normal.crossVectors(tangent, up).normalize();
          geometry.attributes.position.setXYZ(i, position.x + v * 2.66 * up.x, position.y + v * 2.66 * up.y, position.z);
        }
        geometry.computeVertexNormals();
      } else ribbon.deformFilmRibbon(geometry.attributes.position.array, center, scratches[card]);
    }
  }
  return performance.now() - start;
}
run(true, 80); run(false, 80);
const original = [], optimized = [];
for (let pass = 0; pass < 5; pass++) { original.push(run(true, 300)); optimized.push(run(false, 300)); }
const median = values => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
const before = median(original), after = median(optimized);
console.log(JSON.stringify({ frames: 300, cards: count, originalCpuMs: Math.round(before), optimizedCpuMs: Math.round(after), speedup: Number((before / after).toFixed(2)), cpuReductionPercent: Math.round((1 - after / before) * 100) }, null, 2));
geometries.forEach(geometry => geometry.dispose());

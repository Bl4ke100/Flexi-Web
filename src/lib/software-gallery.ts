import { DESKTOP_FILM_LAYOUT, FILM_SEGMENTS, createFilmRibbonLayout, createRibbonScratch, deformFilmRibbon } from "./film-ribbon";
import { galleryHeadlineSize } from "./gallery-layout";

export type ScreenPoint = { x: number; y: number };
export type GalleryTriangle = { points: [ScreenPoint, ScreenPoint, ScreenPoint]; uv: [ScreenPoint, ScreenPoint, ScreenPoint]; depth: number; shade: number; photo: number; half: number };

export function projectGalleryPoint(x: number, y: number, z: number, width: number, height: number): ScreenPoint {
  const scale = height / (2 * Math.tan(38 * Math.PI / 360) * (11 - z));
  return { x: width / 2 + x * scale, y: height / 2 - y * scale };
}

export function galleryHeadlineBounds(width: number, height: number) {
  const headline = galleryHeadlineSize(width, height);
  const topLeft = projectGalleryPoint(-headline.width / 2, -0.08 + headline.height / 2, 0, width, height);
  const bottomRight = projectGalleryPoint(headline.width / 2, -0.08 - headline.height / 2, 0, width, height);
  return { x: topLeft.x, y: topLeft.y, width: bottomRight.x - topLeft.x, height: bottomRight.y - topLeft.y };
}

function area(a: ScreenPoint, b: ScreenPoint, c: ScreenPoint) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function containsGalleryPoint(point: ScreenPoint, triangle: GalleryTriangle) {
  const [a, b, c] = triangle.points;
  const ab = area(a, b, point), bc = area(b, c, point), ca = area(c, a, point);
  return !((ab < 0 || bc < 0 || ca < 0) && (ab > 0 || bc > 0 || ca > 0));
}

export function createSoftwareGalleryGeometry() {
  return { positions: new Float32Array((FILM_SEGMENTS + 1) * 2 * 3), scratch: createRibbonScratch(), layout: DESKTOP_FILM_LAYOUT, width: 0, height: 0 };
}

// Project the same 48-column ribbon mesh through the original camera. Painter's
// ordering puts rear photos behind the headline and front photos in front.
export function projectGalleryRibbon(progress: number, count: number, width: number, height: number, geometry = createSoftwareGalleryGeometry()) {
  const triangles: GalleryTriangle[] = [];
  if (geometry.width !== width || geometry.height !== height) {
    geometry.layout = createFilmRibbonLayout(width, height);
    geometry.width = width;
    geometry.height = height;
  }
  const layout = geometry.layout;
  const row = FILM_SEGMENTS + 1;
  const half = layout.width / 2;
  const start = -half;
  const end = layout.length + half + (count - 1) * layout.step;
  for (let photo = 0; photo < count; photo++) {
    const center = start + Math.max(0, Math.min(1, progress)) * (end - start) - photo * layout.step;
    if (center + half <= 0.05 || center - half >= layout.length - 0.05) continue;
    deformFilmRibbon(geometry.positions, center, geometry.scratch, layout);
    const points = Array.from({ length: row * 2 }, (_, i) => projectGalleryPoint(geometry.positions[i * 3], geometry.positions[i * 3 + 1], geometry.positions[i * 3 + 2], width, height));
    for (let column = 0; column < FILM_SEGMENTS; column++) {
      for (const [half, indices] of [[column, column + row, column + 1], [column + row, column + row + 1, column + 1]].entries()) {
        const projected = indices.map(index => points[index]) as GalleryTriangle["points"];
        const winding = area(...projected);
        if (Math.abs(winding) < 0.00001) continue;
        if (projected.every(point => point.x < -1) || projected.every(point => point.x > width + 1) || projected.every(point => point.y < -1) || projected.every(point => point.y > height + 1)) continue;
        const depth = indices.reduce((sum, index) => sum + geometry.positions[index * 3 + 2], 0) / 3;
        const uv = indices.map(index => {
          const u = (index % row) / FILM_SEGMENTS;
          return { x: winding < 0 ? u : 1 - u, y: index < row ? 0 : 1 };
        }) as GalleryTriangle["uv"];
        triangles.push({ points: projected, uv, depth, shade: Math.max(0.92, Math.min(1, 1 + Math.min(depth, 0) * 0.012)), photo, half });
      }
    }
  }
  return triangles.sort((a, b) => a.depth - b.depth);
}

// Each narrow column is painted once as an affine image strip. Using clipped
// triangles here creates visible antialiasing seams in Canvas 2D; the 48-column
// geometry retains the original curve while continuous strips avoid that grid.
export function drawGalleryStrip(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, strip: GalleryTriangle) {
  const [topLeft, bottomLeft, topRight] = strip.points;
  const x0 = strip.uv[0].x * image.width, x1 = strip.uv[2].x * image.width;
  const span = x1 - x0;
  if (Math.abs(span) < 0.00001) return;
  const a = (topRight.x - topLeft.x) / span;
  const b = (topRight.y - topLeft.y) / span;
  const c = (bottomLeft.x - topLeft.x) / image.height;
  const d = (bottomLeft.y - topLeft.y) / image.height;
  const padding = 0.65 / Math.max(0.01, Math.hypot(a, b));
  const sourceX = Math.max(0, Math.min(x0, x1) - padding);
  const sourceEnd = Math.min(image.width, Math.max(x0, x1) + padding);
  ctx.save();
  ctx.transform(a, b, c, d, topLeft.x - a * x0, topLeft.y - b * x0);
  ctx.drawImage(image, sourceX, 0, sourceEnd - sourceX, image.height, sourceX, 0, sourceEnd - sourceX, image.height);
  ctx.restore();
}

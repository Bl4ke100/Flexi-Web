import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { motionValue } from "framer-motion";
import { loadTypescript } from "./load-typescript.mjs";

const { supportsWebGL2 } = loadTypescript("../src/lib/webgl.ts");
const { createGaugeTicks, svgCoordinate } = loadTypescript("../src/lib/gauge.ts");

test("Disabled, lost, or blocked WebGL selects the non-WebGL path without throwing", () => {
  assert.equal(supportsWebGL2(() => ({ getContext: () => null })), false);
  assert.equal(supportsWebGL2(() => ({ getContext() { throw new Error("Blocked by browser"); } })), false);
  assert.equal(supportsWebGL2(() => ({ getContext: () => ({ isContextLost: () => true, getExtension: () => null }) })), false);
  assert.equal(supportsWebGL2(() => ({ getContext: () => ({ isContextLost: () => false, getExtension() { throw new Error("Context disappeared"); } }) })), true);
});

test("WebGL capability detection releases its temporary context", () => {
  let released = 0;
  const canvas = { getContext(type) {
    assert.equal(type, "webgl2");
    return { isContextLost: () => false, getExtension: name => {
      assert.equal(name, "WEBGL_lose_context");
      return { loseContext() { released++; } };
    } };
  } };
  assert.equal(supportsWebGL2(() => canvas), true);
  assert.equal(released, 1);
});

test("Software fallback exposes photo selection controls without initializing WebGL", () => {
  const fallback = loadTypescript("../src/components/CustomerGalleryFallback.tsx", {
    "@/lib/responsive-image": {},
    "@/lib/gallery-artwork": {},
    "@/lib/software-gallery": {},
  }).default;
  const photos = [
    { id: "one", customerName: "First customer", vehicleName: "Honda Vezel", location: "Sri Lanka", image: "/one.jpg" },
    { id: "two", customerName: "Second customer", vehicleName: "Toyota Prius", location: "Sri Lanka", image: "/two.jpg" },
  ];
  const html = renderToStaticMarkup(createElement(fallback, { photos, progress: motionValue(0.5), onSelect() {} }));
  assert.match(html, /data-gallery-renderer="fallback"/);
  assert.match(html, /aria-label="View photo: First customer"/);
  assert.match(html, /aria-label="View photo: Second customer"/);
  assert.match(html, /Honda Vezel/);
  assert.match(html, /Toyota Prius/);
  assert.match(html, /data-gallery-engine="canvas2d"/);
  assert.match(html, /aria-label="Curved customer photo gallery"/);
  assert.doesNotMatch(html, /w-max|text-right|top-\[45%\]/);
});

test("Gauge coordinates serialize identically for the reported server/browser differences", () => {
  for (const pair of [[41.940564470142895, 41.94056447014289], [30.03093666914657, 30.030936669146556], [162.77204932613733, 162.77204932613736]]) {
    assert.equal(svgCoordinate(pair[0]), svgCoordinate(pair[1]));
  }
  const ticks = createGaugeTicks();
  assert.equal(ticks.length, 30);
  ticks.forEach((tick, index) => {
    Object.values(tick).forEach(value => assert.match(value, /^\d+\.\d{4}$/));
    const angle = (135 + index / 29 * 270) * Math.PI / 180;
    assert.ok(Math.abs(Number(tick.x1) - (100 + Math.cos(angle) * 78)) <= 0.00005);
  });
});

// Stable SVG attributes across server/browser math implementations. Four
// decimal places are well below a visible pixel at the gauge's display size.
export function svgCoordinate(value: number) {
  return Number(value.toFixed(4)).toFixed(4);
}

export function createGaugeTicks() {
  return Array.from({ length: 30 }, (_, index) => {
    const angle = (135 + index / 29 * 270) * Math.PI / 180;
    return {
      x1: svgCoordinate(100 + Math.cos(angle) * 78),
      y1: svgCoordinate(100 + Math.sin(angle) * 78),
      x2: svgCoordinate(100 + Math.cos(angle) * 94),
      y2: svgCoordinate(100 + Math.sin(angle) * 94),
    };
  });
}

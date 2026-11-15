// Fit the headline to the camera's visible width without changing ribbon geometry.
export function galleryHeadlineSize(width: number, height: number) {
  const cameraWidth = 2 * Math.tan(38 * Math.PI / 360) * 11 * width / Math.max(1, height);
  const headlineWidth = Math.min(12.6, cameraWidth * 0.92);
  return { width: headlineWidth, height: headlineWidth * 3.99 / 12.6 };
}

// Probe before mounting Three.js so a browser with WebGL disabled never enters
// its renderer initialization/retry path. Release this temporary context.
export function supportsWebGL2(createCanvas = () => document.createElement("canvas")) {
  let context: WebGL2RenderingContext | null = null;
  try {
    context = createCanvas().getContext("webgl2", { alpha: true, antialias: true });
    return Boolean(context && !context.isContextLost());
  } catch {
    return false;
  } finally {
    try { context?.getExtension("WEBGL_lose_context")?.loseContext(); } catch { /* Already unavailable. */ }
  }
}

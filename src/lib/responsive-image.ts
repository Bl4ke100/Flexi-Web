import { getImageProps } from "next/image";

function canOptimize(src: string) {
  if (["/posts/", "/services/", "/routes/", "/about/"].some(prefix => src.startsWith(prefix))) return true;
  try {
    const url = new URL(src);
    const project = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url.protocol === "https:" && (url.hostname === "images.unsplash.com" ||
      (project && url.origin === new URL(project).origin && url.pathname.startsWith("/storage/v1/object/public/site-media/")));
  } catch { return false; }
}

// Keep native image layout/styles, including motion.img, while letting Next
// deliver a cached, correctly sized WebP. Other admin-supplied hosts still work.
export function responsiveImage(src: string, sizes = "100vw") {
  if (!canOptimize(src)) return { src };
  const pixels = /^(\d+)px$/.exec(sizes);
  const sizing = pixels ? { width: Number(pixels[1]), height: Number(pixels[1]) } : { fill: true, sizes };
  const { props } = getImageProps({ src, alt: "", ...sizing, quality: 85 });
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes };
}

export function canvasImage(src: string) {
  return canOptimize(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=640&q=85` : src;
}

"use client";

import { memo, useEffect, useRef } from "react";
import type { MotionValue } from "framer-motion";
import type { CustomerPhoto } from "@/data/fleetData";
import { canvasImage } from "@/lib/responsive-image";
import { createGalleryHeadline, paintGalleryPoster } from "@/lib/gallery-artwork";
import { containsGalleryPoint, createSoftwareGalleryGeometry, drawGalleryStrip, galleryHeadlineBounds, projectGalleryRibbon, type GalleryTriangle } from "@/lib/software-gallery";

function CustomerGalleryFallback({ photos, progress, onSelect }: {
  photos: CustomerPhoto[]; progress: MotionValue<number>; onSelect: (photo: CustomerPhoto) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trianglesRef = useRef<GalleryTriangle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const geometry = createSoftwareGalleryGeometry();
    const headline = createGalleryHeadline();
    const posters = photos.map(photo => {
      const poster = document.createElement("canvas");
      poster.width = 560; poster.height = 720;
      paintGalleryPoster(poster, photo);
      return poster;
    });
    const shadedPosters = posters.map(poster => {
      const shaded = document.createElement("canvas");
      shaded.width = poster.width; shaded.height = poster.height;
      return shaded;
    });
    const previousShade = photos.map(() => NaN);
    let frame = 0;
    let disposed = false;
    const draw = () => {
      frame = 0;
      if (disposed) return;
      const box = canvas.getBoundingClientRect();
      const width = box.width, height = box.height;
      if (!width || !height) return;
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) { canvas.width = pixelWidth; canvas.height = pixelHeight; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const triangles = projectGalleryRibbon(progress.get(), photos.length, width, height, geometry);
      trianglesRef.current = triangles;
      // Shade each opaque poster once, before splitting it into triangles.
      // Shading overlapping triangle edges individually produces dark seams.
      const shades = photos.map(() => ({ sum: 0, count: 0 }));
      triangles.forEach(triangle => { shades[triangle.photo].sum += triangle.shade; shades[triangle.photo].count++; });
      shades.forEach((shade, index) => {
        if (!shade.count) return;
        const brightness = Math.round(shade.sum / shade.count * 128) / 128;
        if (brightness === previousShade[index]) return;
        const shaded = shadedPosters[index], paint = shaded.getContext("2d");
        if (!paint) return;
        paint.globalCompositeOperation = "source-over";
        paint.drawImage(posters[index], 0, 0);
        paint.globalCompositeOperation = "multiply";
        const value = Math.round(brightness * 255);
        paint.fillStyle = `rgb(${value},${value},${value})`;
        paint.fillRect(0, 0, shaded.width, shaded.height);
        paint.globalCompositeOperation = "source-over";
        previousShade[index] = brightness;
      });
      const bounds = galleryHeadlineBounds(width, height);
      let paintedHeadline = false;
      for (const triangle of triangles) {
        if (triangle.half !== 0) continue;
        if (!paintedHeadline && triangle.depth >= 0) {
          ctx.drawImage(headline, bounds.x, bounds.y, bounds.width, bounds.height);
          paintedHeadline = true;
        }
        drawGalleryStrip(ctx, shadedPosters[triangle.photo], triangle);
      }
      if (!paintedHeadline) ctx.drawImage(headline, bounds.x, bounds.y, bounds.width, bounds.height);
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(draw); };
    const images = photos.map((photo, index) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => { if (!disposed) { paintGalleryPoster(posters[index], photo, image); previousShade[index] = NaN; schedule(); } };
      image.src = canvasImage(photo.image);
      return image;
    });
    const unsubscribe = progress.on("change", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      unsubscribe(); resize.disconnect();
      images.forEach(image => { image.onload = null; });
      trianglesRef.current = [];
    };
  }, [photos, progress]);

  function photoAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    const point = { x: clientX - box.left, y: clientY - box.top };
    for (let index = trianglesRef.current.length - 1; index >= 0; index--) {
      const triangle = trianglesRef.current[index];
      if (containsGalleryPoint(point, triangle)) return photos[triangle.photo];
    }
  }

  return <div data-gallery-renderer="fallback" data-gallery-engine="canvas2d" className="absolute inset-0 overflow-hidden">
    <canvas ref={canvasRef} role="img" aria-label="Curved customer photo gallery" className="absolute inset-0 h-full w-full" onClick={event => { const photo = photoAt(event.clientX, event.clientY); if (photo) onSelect(photo); }} onPointerMove={event => { event.currentTarget.style.cursor = photoAt(event.clientX, event.clientY) ? "pointer" : "auto"; }} />
    <div className="sr-only">
      <p>The drives we made memories</p>
      {photos.map(photo => <button key={photo.id} type="button" onClick={() => onSelect(photo)} aria-label={`View photo: ${photo.customerName}`}>{photo.customerName} - {photo.vehicleName} - {photo.location}</button>)}
    </div>
  </div>;
}

export default memo(CustomerGalleryFallback);

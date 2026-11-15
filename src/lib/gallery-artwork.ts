import type { CustomerPhoto } from "@/data/fleetData";

// Both renderers use identical poster artwork and headline typography.
export function paintGalleryPoster(canvas: HTMLCanvasElement, photo: CustomerPhoto, img?: HTMLImageElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      // Base dark fill
      ctx.fillStyle = "#0B0B0B";
      ctx.fillRect(0, 0, W, H);

      // Draw customer + car image with object-fit: cover
      if (img && img.width > 0 && img.height > 0) {
        const imgAspect = img.width / img.height;
        const canvasAspect = W / H;
        let drawW = W;
        let drawH = H;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > canvasAspect) {
          drawH = H;
          drawW = H * imgAspect;
          offsetX = -(drawW - W) * 0.5;
        } else {
          drawW = W;
          drawH = W / imgAspect;
          offsetY = -(drawH - H) * 0.5;
        }
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      }

      // Top & bottom dark editorial gradients
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0.55)");
      grad.addColorStop(0.35, "rgba(0,0,0,0.08)");
      grad.addColorStop(0.65, "rgba(0,0,0,0.35)");
      grad.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Subtle Orange Light-Leak Corners (Like LFG Posters)
      const topGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 190);
      topGlow.addColorStop(0, "rgba(255, 85, 0, 0.42)");
      topGlow.addColorStop(1, "rgba(255, 85, 0, 0)");
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, W, H);

      const botGlow = ctx.createRadialGradient(W, H, 10, W, H, 210);
      botGlow.addColorStop(0, "rgba(255, 85, 0, 0.38)");
      botGlow.addColorStop(1, "rgba(255, 85, 0, 0)");
      ctx.fillStyle = botGlow;
      ctx.fillRect(0, 0, W, H);

      // Top Center Emblem: FLEXI RENTAL
      ctx.textAlign = "center";
      ctx.font = "900 22px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("FLEXI", W * 0.5 - 38, 46);
      ctx.fillStyle = "#FF5500";
      ctx.fillText("RENTAL", W * 0.5 + 36, 46);

      ctx.font = "600 11px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.fillText("SRI LANKA", W * 0.5, 64);

      // Bottom Orange Vehicle Pill
      const vehicleLabel = photo.vehicleName.toUpperCase();
      ctx.font = "700 14px monospace";
      const pillW = Math.min(W - 60, ctx.measureText(vehicleLabel).width + 28);
      ctx.fillStyle = "#FF5500";
      ctx.fillRect((W - pillW) * 0.5, H - 148, pillW, 26);

      ctx.fillStyle = "#050505";
      ctx.fillText(vehicleLabel, W * 0.5, H - 130);

      // Customer Name (Bold Poster Headline)
      ctx.font = "900 40px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(photo.customerName.toUpperCase(), W * 0.5, H - 78, W - 48);

      // Location Subtitle
      ctx.font = "700 15px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(photo.location.toUpperCase(), W * 0.5, H - 44, W - 48);

      // Subtle Film Frame Border
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, W - 3, H - 3);


}

export function createGalleryHeadline() {
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 760;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Top Line: "THE DRIVES WE" (Right-shifted like "THE NIGHTS WE" in LFG screenshot)
      ctx.font = "900 225px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "right";
      ctx.fillText("THE DRIVES WE", 2320, 255);

      // Middle Tracked Subtitle Line
      ctx.font = "700 26px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.textAlign = "center";
      ctx.letterSpacing = "8px";
      ctx.fillText(
        "COLOMBO  •  KATUNAYAKE BIA  •  KANDY  •  ELLA  •  GALLE",
        1200,
        365
      );

      // Bottom Line: "MADE MEMORIES" (Left-shifted like "MADE HISTORY" in LFG screenshot)
      ctx.font = "900 225px sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("MADE ", 70, 620);

      const madeWidth = ctx.measureText("MADE ").width;
      ctx.fillStyle = "#FF5500";
      ctx.fillText("MEMORIES", 70 + madeWidth, 620);
    }


  return canvas;
}

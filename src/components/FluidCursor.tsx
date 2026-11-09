"use client";

import React, { useEffect, useRef, useState } from "react";

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const COLORS = [
  "255, 85, 0",   // Vibrant Orange #FF5500
  "255, 119, 51", // Warm Amber Orange #FF7733
  "204, 61, 0",   // Deep Burnt Orange #CC3D00
  "255, 255, 255" // Crisp White accent
];

export default function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string>("");
  const [isPointer, setIsPointer] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: FluidParticle[] = [];
    let mouseX = -200;
    let mouseY = -200;
    let prevX = -200;
    let prevY = -200;
    let ringX = -200;
    let ringY = -200;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (prevX < 0) {
        prevX = mouseX;
        prevY = mouseY;
        ringX = mouseX;
        ringY = mouseY;
      }

      const dx = mouseX - prevX;
      const dy = mouseY - prevY;
      const speed = Math.min(Math.hypot(dx, dy), 45);

      // Spawn fluid smoke trail splats directly under the cursor
      const count = Math.max(1, Math.floor(speed / 6));
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const px = prevX + dx * t;
        const py = prevY + dy * t;
        const color =
          Math.random() > 0.18
            ? COLORS[Math.floor(Math.random() * 3)]
            : COLORS[3];

        particles.push({
          x: px + (Math.random() - 0.5) * 6,
          y: py + (Math.random() - 0.5) * 6,
          vx: dx * 0.12 + (Math.random() - 0.5) * 1.2,
          vy: dy * 0.12 + (Math.random() - 0.5) * 1.2,
          radius: 8 + speed * 0.35,
          maxRadius: 48 + speed * 1.1,
          alpha: Math.min(0.32, 0.12 + speed * 0.006),
          color,
        });
      }

      prevX = mouseX;
      prevY = mouseY;

      // Update precision dot immediately (zero lag, exact cursor position)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // Check hover target
      const target = e.target as HTMLElement | null;
      if (target) {
        const custom = target
          .closest("[data-cursor]")
          ?.getAttribute("data-cursor");
        if (custom) {
          setHoverLabel(custom);
          setIsPointer(true);
        } else if (
          target.closest("a, button, input, select, [role='button']")
        ) {
          setHoverLabel("");
          setIsPointer(true);
        } else {
          setHoverLabel("");
          setIsPointer(false);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.radius += (p.maxRadius - p.radius) * 0.06;
        p.alpha *= 0.935;

        if (p.alpha <= 0.004) {
          particles.splice(i, 1);
          continue;
        }

        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius
        );
        grad.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
        grad.addColorStop(0.5, `rgba(${p.color}, ${p.alpha * 0.45})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Smoothly interpolate outer ring to exact mouseX, mouseY
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9990] hidden lg:block overflow-hidden">
      {/* Full-Viewport Fluid Smoke Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />

      {/* Smooth Following Ring — Fixed at top-0 left-0 so coordinates are 100% exact */}
      <div
        ref={ringRef}
        style={{ transform: "translate3d(-200px, -200px, 0)" }}
        className={`fixed top-0 left-0 rounded-full border transition-[width,height,background-color,border-color] duration-200 flex items-center justify-center ${
          hoverLabel
            ? "w-20 h-20 bg-[#FF5500] border-[#FF5500] text-black shadow-[0_0_30px_rgba(255,85,0,0.6)]"
            : isPointer
            ? "w-12 h-12 bg-[#FF5500]/15 border-[#FF5500]"
            : "w-8 h-8 bg-transparent border-white/35"
        }`}
      >
        {hoverLabel && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-black">
            {hoverLabel}
          </span>
        )}
      </div>

      {/* Exact Center Dot — Fixed at top-0 left-0 */}
      <div
        ref={dotRef}
        style={{ transform: "translate3d(-200px, -200px, 0)" }}
        className={`fixed top-0 left-0 rounded-full transition-[width,height,background-color,opacity] duration-150 ${
          hoverLabel
            ? "w-0 h-0 opacity-0"
            : isPointer
            ? "w-2 h-2 bg-[#FF5500]"
            : "w-1.5 h-1.5 bg-white"
        }`}
      />
    </div>
  );
}

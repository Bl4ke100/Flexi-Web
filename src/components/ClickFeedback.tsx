"use client";

import { useEffect } from "react";

export default function ClickFeedback() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const circles = new Set<HTMLElement>();
    const onPointerDown = (event: PointerEvent) => {
      if (reducedMotion.matches || event.button !== 0 || event.pointerType === "touch") return;
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("a,button,[role='button']")) return;
      const circle = document.createElement("span");
      circle.className = "click-feedback";
      circle.setAttribute("aria-hidden", "true");
      circle.style.left = `${event.clientX}px`;
      circle.style.top = `${event.clientY}px`;
      circles.add(circle);
      circle.addEventListener("animationend", () => { circles.delete(circle); circle.remove(); }, { once: true });
      document.body.appendChild(circle);
    };
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => { document.removeEventListener("pointerdown", onPointerDown); circles.forEach(circle => circle.remove()); };
  }, []);
  return null;
}

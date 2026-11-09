"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverState, setHoverState] = useState<"default" | "pointer" | "3d">(
    "default"
  );
  const [cursorText, setCursorText] = useState<string>("");

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Fast inner dot
  const dotX = useSpring(mouseX, { stiffness: 800, damping: 38, mass: 0.2 });
  const dotY = useSpring(mouseY, { stiffness: 800, damping: 38, mass: 0.2 });

  // Smooth trailing outer ring
  const ringX = useSpring(mouseX, { stiffness: 180, damping: 24, mass: 0.6 });
  const ringY = useSpring(mouseY, { stiffness: 180, damping: 24, mass: 0.6 });

  // Soft ambient spotlight
  const glowX = useSpring(mouseX, { stiffness: 80, damping: 30, mass: 1 });
  const glowY = useSpring(mouseY, { stiffness: 80, damping: 30, mass: 1 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const customLabel = target
        .closest("[data-cursor]")
        ?.getAttribute("data-cursor");
      if (customLabel) {
        setHoverState("3d");
        setCursorText(customLabel);
        return;
      }

      const isInteractive = target.closest(
        "a, button, input, select, [role='button']"
      );
      if (isInteractive) {
        setHoverState("pointer");
        setCursorText("");
      } else {
        setHoverState("default");
        setCursorText("");
      }
    };

    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden lg:block overflow-hidden">
      {/* Subtle Ambient Orange Spotlight */}
      <motion.div
        style={{
          x: glowX,
          y: glowY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="w-[420px] h-[420px] rounded-full bg-[#FF5500]/[0.055] blur-[90px]"
      />

      {/* Trailing Outer Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: hoverState === "3d" ? 88 : hoverState === "pointer" ? 56 : 36,
          height: hoverState === "3d" ? 88 : hoverState === "pointer" ? 56 : 36,
          backgroundColor:
            hoverState === "3d"
              ? "rgba(255, 85, 0, 0.92)"
              : hoverState === "pointer"
              ? "rgba(255, 85, 0, 0.14)"
              : "rgba(255, 255, 255, 0.02)",
          borderColor:
            hoverState === "3d"
              ? "rgba(255, 85, 0, 1)"
              : hoverState === "pointer"
              ? "rgba(255, 85, 0, 0.75)"
              : "rgba(255, 255, 255, 0.25)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="rounded-full border flex items-center justify-center backdrop-blur-[2px]"
      >
        {cursorText && (
          <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-black font-sans">
            {cursorText}
          </span>
        )}
      </motion.div>

      {/* Precision Center Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: hoverState === "3d" ? 0 : hoverState === "pointer" ? 1.5 : 1,
          backgroundColor: hoverState === "pointer" ? "#FF5500" : "#FFFFFF",
        }}
        className="w-2 h-2 rounded-full"
      />
    </div>
  );
}

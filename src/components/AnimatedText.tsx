"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✦";

export function ScrambleText({
  text,
  className = "",
  triggerKey,
}: {
  text: string;
  className?: string;
  triggerKey?: string | number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    if (!isInView) return;
    let iteration = 0;
    const totalLength = text.length;

    const interval = setInterval(() => {
      setDisplayed(
        text
          .split("")
          .map((char, idx) => {
            if (char === " ") return " ";
            if (idx < iteration) return text[idx];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      iteration += Math.max(0.45, totalLength / 18);
      if (iteration >= totalLength) {
        setDisplayed(text);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [text, isInView, triggerKey]);

  return (
    <span ref={ref} className={className}>
      {displayed}
    </span>
  );
}

export function RollingHeading({
  text,
  highlightWords = [],
  className = "",
}: {
  text: string;
  highlightWords?: string[];
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const words = text.split(" ");

  return (
    <h2 ref={ref} className={`flex flex-wrap gap-x-[0.28em] gap-y-1 ${className}`}>
      {words.map((word, idx) => {
        const clean = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const isHighlight = highlightWords.some(
          (w) => w.toLowerCase() === clean
        );
        return (
          <span key={idx} className="inline-block overflow-hidden py-1">
            <motion.span
              initial={{ y: "110%", rotateZ: 4 }}
              animate={
                isInView
                  ? { y: "0%", rotateZ: 0 }
                  : { y: "110%", rotateZ: 4 }
              }
              transition={{
                duration: 0.65,
                delay: idx * 0.055,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`inline-block ${
                isHighlight ? "text-[#FF5500]" : "text-white"
              }`}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </h2>
  );
}

export function RollText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`group/roll relative inline-block overflow-hidden leading-[1.2] ${className}`}
    >
      <span className="block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/roll:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-full block text-[#FF5500] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/roll:-translate-y-full"
      >
        {children}
      </span>
    </span>
  );
}

export function FourPointStar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M50 0 L56 40 L100 50 L56 60 L50 100 L44 60 L0 50 L44 40 Z" />
    </svg>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PreloaderCurtain({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"counting" | "curtain" | "done">(
    "counting"
  );

  useEffect(() => {
    let start: number | null = null;
    const duration = 1550;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          setPhase("curtain");
          setTimeout(() => {
            setPhase("done");
            onComplete?.();
          }, 950);
        }, 200);
      }
    };

    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [onComplete]);

  if (phase === "done") return null;

  const digits = String(progress).padStart(3, "0").split("");
  const stripes = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-[9995] pointer-events-none overflow-hidden">
      {/* Split Stripe Curtain (Left & Right Halves) */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 flex h-full">
          {stripes.map((i) => (
            <motion.div
              key={`l-${i}`}
              initial={{ scaleY: 1 }}
              animate={{
                scaleY: phase === "curtain" ? 0 : 1,
              }}
              transition={{
                duration: 0.72,
                delay: phase === "curtain" ? (11 - i) * 0.032 : 0,
                ease: [0.76, 0, 0.24, 1],
              }}
              style={{ transformOrigin: i % 2 === 0 ? "top" : "bottom" }}
              className="flex-1 h-full bg-[#050505] border-r border-white/[0.03]"
            />
          ))}
        </div>

        <motion.div
          initial={{ scaleY: 0, opacity: 1 }}
          animate={{
            scaleY: phase === "counting" ? progress / 100 : 1,
            opacity: phase === "curtain" ? 0 : 1,
          }}
          transition={{ duration: 0.4 }}
          className="w-[2px] h-full bg-[#FF5500] shadow-[0_0_25px_#FF5500]"
        />

        <div className="flex-1 flex h-full">
          {stripes.map((i) => (
            <motion.div
              key={`r-${i}`}
              initial={{ scaleY: 1 }}
              animate={{
                scaleY: phase === "curtain" ? 0 : 1,
              }}
              transition={{
                duration: 0.72,
                delay: phase === "curtain" ? i * 0.032 : 0,
                ease: [0.76, 0, 0.24, 1],
              }}
              style={{ transformOrigin: i % 2 === 0 ? "bottom" : "top" }}
              className="flex-1 h-full bg-[#050505] border-r border-white/[0.03]"
            />
          ))}
        </div>
      </div>

      {/* Foreground Slot-Reel Counter Overlay */}
      <AnimatePresence>
        {phase === "counting" && (
          <motion.div
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-12 text-white"
          >
            {/* Top Metadata Row */}
            <div className="flex items-start justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
              <p>
                Flexi Rental
                <br />— Island-Wide Car Rental
              </p>
              <p className="hidden md:block text-center">
                Self-Drive <span className="text-[#FF5500]">✦</span> Airport Pickup
                <br />
                Hybrids <span className="text-[#FF5500]">✦</span> SUVs &amp; Vans
              </p>
              <p className="text-right">
                Colombo • Kandy • Galle
                <br />&amp; All Across Sri Lanka
              </p>
            </div>

            {/* Bottom Giant Reel Counter & Progress Line */}
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div className="flex items-center font-display font-black text-7xl sm:text-9xl tracking-tighter leading-none tabular-nums">
                  {digits.map((d, idx) => (
                    <span
                      key={idx}
                      className="inline-block overflow-hidden text-white"
                    >
                      {d}
                    </span>
                  ))}
                  <span className="text-[#FF5500] text-4xl sm:text-6xl ml-2">
                    %
                  </span>
                </div>

                <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] pb-3">
                  SRI LANKA ✦ &apos;26
                </div>
              </div>

              <div className="relative h-[2px] w-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-[#FF5500] transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

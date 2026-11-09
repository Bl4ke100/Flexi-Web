"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RollText, FourPointStar } from "./AnimatedText";

interface NavbarProps {
  compareCount: number;
  onOpenCompare: () => void;
  onOpenBooking: () => void;
}

export default function Navbar({
  compareCount,
  onOpenCompare,
  onOpenBooking,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Routes", href: "#island-routes" },
    { label: "About", href: "#about" },
    { label: "Our Cars", href: "#fleet-showroom" },
    { label: "Customers", href: "#customer-moments" },
    { label: "Locations", href: "#global-hubs" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none mix-blend-difference">
        <div className="relative w-full px-6 md:px-10 h-20 flex items-center justify-between text-white">
          {/* Left Brand Mark */}
          <a
            href="#hero"
            className="pointer-events-auto flex items-center gap-2.5 group"
          >
            <FourPointStar className="w-4 h-4 text-[#FF5500] group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-display font-extrabold text-lg tracking-tight uppercase">
              FLEXI <span className="text-[#FF5500]">RENTAL</span>
            </span>
          </a>

          {/* Center Rolling Links */}
          <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-9 pointer-events-auto font-mono text-xs uppercase tracking-[0.18em]">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="py-1">
                <RollText>{link.label}</RollText>
              </a>
            ))}
          </nav>

          {/* Right Actions & Menu Button */}
          <div className="flex items-center gap-6 pointer-events-auto font-mono text-xs uppercase tracking-[0.18em]">
            {compareCount > 0 && (
              <button
                onClick={onOpenCompare}
                className="hidden sm:inline-block text-[#FF5500]"
              >
                <RollText>Compare ({compareCount})</RollText>
              </button>
            )}

            <button
              onClick={onOpenBooking}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 border border-[#FF5500] bg-[#FF5500] text-black font-bold hover:bg-white hover:border-white transition-colors"
            >
              <span>Book A Car</span>
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 p-2 focus:outline-none"
              aria-label="Toggle Menu"
            >
              <span className="hidden sm:inline-block">
                <RollText>{menuOpen ? "Close" : "Menu"}</RollText>
              </span>
              <span className="flex flex-col gap-1.5 w-6">
                <span
                  className={`block h-[1.5px] bg-white transition-transform duration-300 ${
                    menuOpen ? "translate-y-[7px] rotate-45 bg-[#FF5500]" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] bg-white transition-opacity duration-300 ${
                    menuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] bg-white transition-transform duration-300 ${
                    menuOpen ? "-translate-y-[7px] -rotate-45 bg-[#FF5500]" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Animated Curtain Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 bg-[#050505] text-white flex flex-col justify-between p-8 sm:p-16 pt-28"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 my-auto max-w-7xl w-full mx-auto">
              <div className="lg:col-span-8 flex flex-col gap-3">
                {navLinks.map((item, idx) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.06, duration: 0.5 }}
                    className="group flex items-baseline gap-6 font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight hover:text-[#FF5500] transition-colors"
                  >
                    <span className="font-mono text-xs text-[#FF5500]">
                      0{idx + 1}
                    </span>
                    <span>{item.label}</span>
                  </motion.a>
                ))}
              </div>

              <div className="lg:col-span-4 flex flex-col justify-end space-y-8 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF5500] mb-3">
                    (Island-Wide Service)
                  </div>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    24/7 Katunayake Airport pickup, Colombo doorstep delivery,
                    and self-drive or with-driver options across Sri Lanka.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full py-4 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                >
                  [ Book A Vehicle ]
                </button>
              </div>
            </div>

            <div className="max-w-7xl w-full mx-auto flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500 border-t border-white/10 pt-6">
              <span>Flexi Rental Sri Lanka &apos;26</span>
              <span>Colombo • BIA Airport • Kandy • Galle • Negombo • Ella</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

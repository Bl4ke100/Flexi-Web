"use client";

import React from "react";
import { motion } from "framer-motion";
import { FourPointStar, RollText, ScrambleText } from "./AnimatedText";

export default function Footer({
  onOpenBooking,
}: {
  onOpenBooking: () => void;
}) {
  return (
    <div className="bg-[#050505] text-white overflow-hidden">
      {/* ===================================================================
          LFG-STYLE "WE ARE READY WHEN YOU ARE" GIANT MARQUEE & CARDS
      =================================================================== */}
      <section className="py-28 sm:py-36 border-t border-white/10">
        {/* Giant Infinite Marquee */}
        <div className="overflow-hidden py-6 mb-20 border-y border-white/10 select-none">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-12 whitespace-nowrap w-max font-display font-black text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tight"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-12">
                <span>We are ready when you are</span>
                <FourPointStar className="w-10 h-10 text-[#FF5500]" />
              </span>
            ))}
          </motion.div>
        </div>

        {/* 3-Column Ready Grid */}
        <div className="max-w-[1360px] mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-4 flex flex-col justify-between py-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-4">
                <ScrambleText text="(Hit the road)" />
              </p>
              <p className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
                Daily drives, airport transfers, or family tours: let&apos;s get
                you moving across Sri Lanka.
              </p>
            </div>
            <div className="h-[2px] w-20 bg-[#FF5500] mt-8" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 p-8 sm:p-10 bg-[#0C0C0C] border border-white/10 flex flex-col justify-between gap-8"
          >
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500] block mb-2">
                01 // SELF-DRIVE OR WITH DRIVER
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
                Book Your Vehicle
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Pick up at Katunayake BIA Airport or get doorstep delivery in
                Colombo, Kandy, Galle, Negombo, and Ella.
              </p>
            </div>
            <button
              onClick={onOpenBooking}
              className="self-start px-6 py-3.5 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
            >
              <RollText>[ Book Now ]</RollText>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-4 p-8 sm:p-10 bg-[#0C0C0C] border border-white/10 flex flex-col justify-between gap-8"
          >
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500] block mb-2">
                02 // LONG-TERM &amp; CORPORATE
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
                Monthly Packages
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Save up to 20% on weekly and monthly rentals with full
                maintenance, insurance, and 24/7 roadside backup included.
              </p>
            </div>
            <button
              onClick={onOpenBooking}
              className="self-start px-6 py-3.5 border border-white/25 hover:border-[#FF5500] text-white hover:text-[#FF5500] font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
            >
              <RollText>[ Get Monthly Rate ]</RollText>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===================================================================
          MONUMENTAL LFG-STYLE FOOTER WITH 24VW WATERMARK
      =================================================================== */}
      <footer className="relative pt-20 pb-12 border-t border-white/10 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute bottom-0 left-1/2 -translate-x-1/2 -mb-12 opacity-[0.04]"
        >
          <p className="font-display font-black text-[24vw] leading-none tracking-tighter text-white">
            FLEXI
          </p>
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <a href="#hero" className="flex items-center gap-2.5 mb-4">
                <FourPointStar className="w-5 h-5 text-[#FF5500]" />
                <span className="font-display font-black text-2xl tracking-tight">
                  FLEXI <span className="text-[#FF5500]">RENTAL</span>
                </span>
              </a>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
                Sri Lanka&apos;s trusted everyday car, SUV, and van rental
                service. Clean vehicles, honest LKR rates, and 24/7 island-wide
                support.
              </p>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                Navigation
              </h4>
              <ul className="flex flex-col gap-2.5 font-mono text-xs uppercase tracking-wider">
                <li>
                  <a href="#hero" className="hover:text-[#FF5500] transition-colors">
                    <RollText>Home</RollText>
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-[#FF5500] transition-colors">
                    <RollText>Who We Are</RollText>
                  </a>
                </li>
                <li>
                  <a href="#disciplines" className="hover:text-[#FF5500] transition-colors">
                    <RollText>Our Services</RollText>
                  </a>
                </li>
                <li>
                  <a href="#fleet-showroom" className="hover:text-[#FF5500] transition-colors">
                    <RollText>Our Cars</RollText>
                  </a>
                </li>
                <li>
                  <a href="#pricing-lab" className="hover:text-[#FF5500] transition-colors">
                    <RollText>Rate Calculator</RollText>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                Sri Lanka Branches
              </h4>
              <ul className="flex flex-col gap-2.5 font-mono text-xs uppercase tracking-wider text-neutral-300">
                <li>Colombo // Rajagiriya &amp; City</li>
                <li>Katunayake // BIA Airport 24/7</li>
                <li>Kandy // Peradeniya Road</li>
                <li>Galle // Fort &amp; Unawatuna</li>
                <li>Negombo // Beach Road</li>
                <li>Ella // Hill Country Hub</li>
              </ul>
            </div>

            <div className="lg:text-right">
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                24/7 Booking Desk
              </h4>
              <p className="font-mono text-xs text-neutral-400 mb-4">
                Hotline: +94 11 234 5678
                <br />
                WhatsApp: +94 77 123 4567
              </p>
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 bg-[#FF5500] text-black font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors"
              >
                <RollText>[ Book A Vehicle ]</RollText>
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            <span>
              © {new Date().getFullYear()} FLEXI RENTAL (PVT) LTD — COLOMBO, SRI
              LANKA. ALL RIGHTS RESERVED.
            </span>
            <span className="text-[#FF5500]">
              SELF-DRIVE ✦ AIRPORT PICKUP ✦ WITH DRIVER
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { FourPointStar, RollText, ScrambleText } from "./AnimatedText";
import WhatsAppLink from "./WhatsAppLink";
import { useSiteContent } from "./SiteContentProvider";

export default function Footer() {
  const { settings } = useSiteContent();
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
                01 // SHORT &amp; LONG STAYS
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
                Book on WhatsApp
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Send us your preferred vehicle, dates, and pickup location on
                WhatsApp. Our team will confirm availability and your quote.
              </p>
            </div>
            <WhatsAppLink
              className="self-start px-6 py-3.5 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
            >
              <RollText>[ Chat on WhatsApp ]</RollText>
            </WhatsAppLink>
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
                02 // LONG-TERM RENTALS
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
                Monthly Packages
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Planning a longer stay? Message our team for long-term rates,
                vehicle options, and rental terms.
              </p>
            </div>
            <WhatsAppLink
              inquiry="I'm interested in weekly or monthly rental packages."
              className="self-start max-w-full px-4 sm:px-6 py-3.5 border border-white/25 hover:border-[#FF5500] text-white hover:text-[#FF5500] font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-colors"
            >
              <RollText>[ Ask for Monthly Rates ]</RollText>
            </WhatsAppLink>
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
                  {settings.companyName.split(" ")[0]} <span className="text-[#FF5500]">{settings.companyName.split(" ").slice(1).join(" ")}</span>
                </span>
              </a>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
                Cars, hybrids, SUVs, vans, and luxury wedding rentals in Sri Lanka.
                Airport pickup and return, with 24/7 customer support.
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
                  <WhatsAppLink className="hover:text-[#FF5500] transition-colors">
                    <RollText>Book on WhatsApp</RollText>
                  </WhatsAppLink>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                Your Rental, Made Easy
              </h4>
              <ul className="flex flex-col gap-2.5 font-mono text-xs uppercase tracking-wider text-neutral-300">
                <li>Airport vehicle delivery</li>
                <li>Return your vehicle at the airport</li>
                <li>24/7 customer support</li>
                <li>Clean, well-maintained vehicles</li>
                <li>Short- and long-term rentals</li>
                <li>Luxury wedding cars</li>
                <li>Rental insurance: ask for details</li>
                <li><a href="#deals" className="hover:text-[#FF5500] transition-colors">Explore deals &amp; offers</a></li>
              </ul>
            </div>

            <div className="lg:text-right">
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4">
                WhatsApp Booking Desk
              </h4>
              <p className="font-mono text-xs text-neutral-400 mb-4">
                <WhatsAppLink className="hover:text-[#FF5500] transition-colors">
                  +{settings.whatsappNumber}
                </WhatsAppLink>
              </p>
              <div className="text-xs text-neutral-400 space-y-3 mb-5 break-words">
                {settings.australiaPhone && <p>Australia: <a href={`tel:+61${settings.australiaPhone.replace(/^0/, "")}`} className="hover:text-[#FF5500]">{settings.australiaPhone}</a></p>}
                {settings.contactEmail && <p><a href={`mailto:${settings.contactEmail}`} className="hover:text-[#FF5500]">{settings.contactEmail}</a></p>}
                {settings.socialName && <p>Facebook / TikTok: {settings.socialName}</p>}
              </div>
              <WhatsAppLink
                className="inline-block px-6 py-3 bg-[#FF5500] text-black font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors"
              >
                <RollText>[ Book on WhatsApp ]</RollText>
              </WhatsAppLink>
            </div>
          </div>

          <a href="/admin" className="inline-block mb-6 text-xs text-neutral-500 hover:text-[#FF5500] transition-colors">Admin sign in</a>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            <span>
              © {new Date().getFullYear()} {settings.companyName}. ALL RIGHTS RESERVED.
            </span>
            <span className="text-[#FF5500]">
              AIRPORT DELIVERY &amp; RETURN ✦ 24/7 SUPPORT
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

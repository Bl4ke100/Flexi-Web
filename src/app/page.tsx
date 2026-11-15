"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Navbar from "@/components/Navbar";
import ClickFeedback from "@/components/ClickFeedback";
import PreloaderCurtain from "@/components/PreloaderCurtain";
import { ScrambleText, RollText, FourPointStar } from "@/components/AnimatedText";
import ScrollytellingSection from "@/components/ScrollytellingSection";
import HorizontalScrollSection from "@/components/HorizontalScrollSection";
import CustomerWormGallery from "@/components/CustomerWormGallery";
import LFGShowcaseExtras from "@/components/LFGShowcaseExtras";
import FleetShowroom from "@/components/FleetShowroom";
import AirportServiceSection from "@/components/AirportServiceSection";
import CompareModal from "@/components/CompareModal";
import WhatsAppLink from "@/components/WhatsAppLink";
import Footer from "@/components/Footer";
import DealsSection from "@/components/DealsSection";
import { useSiteContent } from "@/components/SiteContentProvider";
import type { Vehicle } from "@/data/fleetData";

export default function HomePage() {
  const { settings } = useSiteContent();
  const [compareList, setCompareList] = useState<Vehicle[]>([]);
  const [compareOpen, setCompareOpen] = useState<boolean>(false);
  const companyWords = settings.companyName.trim().split(/\s+/);

  const { scrollYProgress: pageProgress } = useScroll();
  const scaleX = useSpring(pageProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroContentY = useTransform(heroScroll, [0, 1], [0, 120]);

  const handleToggleCompare = (vehicle: Vehicle) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === vehicle.id);
      if (exists) return prev.filter((item) => item.id !== vehicle.id);
      if (prev.length >= 3) return [...prev.slice(1), vehicle];
      return [...prev, vehicle];
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF5500] selection:text-black">
      <PreloaderCurtain />
      <ClickFeedback />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[2px] bg-[#FF5500] origin-left z-[60]" />
      <Navbar compareCount={compareList.length} onOpenCompare={() => setCompareOpen(true)} />

      {/* Brand introduction */}
      <section id="hero" ref={heroRef} className="relative min-h-screen w-full overflow-hidden flex flex-col justify-end pb-10 sm:pb-14 pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_25%,rgba(255,85,0,0.12),transparent_60%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[-0.06em] top-[12%] font-display font-black text-[30vw] leading-none tracking-tighter text-white/[0.025] select-none">FLEXI</div>

        <motion.div style={{ y: heroContentY }} className="relative z-10 max-w-[1400px] w-full mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.2em]">
              <span className="px-3 py-1 bg-[#FF5500] text-black font-bold">Welcome to Flexi Rental</span>
              <span className="text-neutral-300">Vehicle rentals · Sri Lanka</span>
            </div>
            <h1 aria-label={settings.companyName} className="font-display font-black text-6xl sm:text-8xl xl:text-[7.5rem] uppercase tracking-tight leading-[0.9] text-white">
              <span className="block"><ScrambleText text={companyWords[0]} /></span>
              {companyWords.length > 1 && <span className="block text-[#FF5500]"><ScrambleText text={companyWords.slice(1).join(" ")} /></span>}
            </h1>
            <p className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-white">{settings.tagline}</p>
            <p className="text-neutral-300 text-base sm:text-lg max-w-xl leading-relaxed font-light">{settings.heroIntro}</p>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-end space-y-8">
            <div className="flex items-center gap-4">
              <span className="font-display font-black text-5xl sm:text-6xl text-white leading-none">24/7</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 leading-relaxed">Customer<br />support</span>
            </div>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {["Short- & long-term rentals", "Airport pickup & return", "Luxury wedding cars"].map((service, index) => (
                <li key={service} className="flex items-center gap-4 py-3.5">
                  <span className="font-mono text-[10px] text-[#FF5500]">0{index + 1}</span>
                  <span className="font-display font-semibold text-lg text-neutral-200">{service}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <WhatsAppLink className="px-6 py-4 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.16em] transition-colors">
                <RollText>[ Plan Your Rental ]</RollText>
              </WhatsAppLink>
              <a href="#fleet-showroom" className="px-6 py-4 border border-white/30 hover:border-[#FF5500] text-white font-mono text-xs font-bold uppercase tracking-[0.16em] transition-colors">
                <RollText>[ Explore Our Fleet ]</RollText>
              </a>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">Share your dates and pickup location on WhatsApp. Our team will help you choose a rental and confirm availability.</p>
          </div>
        </motion.div>

        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 sm:px-12 mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
          <a href="#about" className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors">Discover Flexi Rental ↓</a>
          <span className="flex items-center gap-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-400"><FourPointStar className="w-3 h-3 text-[#FF5500]" />Your journey starts here</span>
        </div>
      </section>

      {/* Star-separated marquee ticker */}
      <div className="py-5 bg-[#FF5500] text-black overflow-hidden select-none border-y border-white/10">
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="flex items-center gap-10 whitespace-nowrap w-max font-display font-black text-xl sm:text-2xl uppercase tracking-wider">
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-10">
                <span>Flexi Rental Sri Lanka</span>
                <FourPointStar className="w-4 h-4 text-black" />
                <span className="bg-black text-white px-3 py-0.5">Airport Delivery &amp; Return</span>
                <FourPointStar className="w-4 h-4 text-black" />
                <span>Short &amp; Long-Term Rentals</span>
                <FourPointStar className="w-4 h-4 text-black" />
                <span>Wedding Cars • Rental Insurance • 24/7 Support</span>
                <FourPointStar className="w-4 h-4 text-black" />
              </span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      <DealsSection />
      <HorizontalScrollSection />
      <ScrollytellingSection />
      <FleetShowroom compareList={compareList} onToggleCompare={handleToggleCompare} />
      <CustomerWormGallery />
      <LFGShowcaseExtras />
      <AirportServiceSection />
      <CompareModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} vehicles={compareList} onRemoveVehicle={(id) => setCompareList((prev) => prev.filter((c) => c.id !== id))} />
      <Footer />
    </div>
  );
}

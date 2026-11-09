"use client";

import React, { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import Navbar from "@/components/Navbar";
import FluidCursor from "@/components/FluidCursor";
import PreloaderCurtain from "@/components/PreloaderCurtain";
import {
  ScrambleText,
  RollText,
  FourPointStar,
} from "@/components/AnimatedText";
import ScrollytellingSection from "@/components/ScrollytellingSection";
import HorizontalScrollSection from "@/components/HorizontalScrollSection";
import CustomerWormGallery from "@/components/CustomerWormGallery";
import LFGShowcaseExtras from "@/components/LFGShowcaseExtras";
import FleetShowroom from "@/components/FleetShowroom";
import PricingCalculator from "@/components/PricingCalculator";
import GlobalHubsSection from "@/components/GlobalHubsSection";
import CompareModal from "@/components/CompareModal";
import BookingModal from "@/components/BookingModal";
import Footer from "@/components/Footer";
import { FLEET_VEHICLES, Vehicle } from "@/data/fleetData";

const HERO_SLIDES = [
  {
    vehicle: FLEET_VEHICLES[1], // Toyota Axio WxB Hybrid
    pill: "Most Popular in Sri Lanka",
    location: "Colombo • Katunayake Airport • Kandy",
    headTitle: "Toyota Axio",
    tailTitle: "Hybrid",
    year: "'26",
    descLead: "comfort, fuel savings and reliability become one.",
    descRest:
      "Whether you are landing at Katunayake BIA Airport, heading to a wedding in Colombo, or taking a family trip down south, drive with complete peace of mind.",
    stat1: "8,500",
    stat1Sup: "LKR+",
    stat2: "20",
    stat2Sup: "km/L",
    statMonth: "Self-Drive or With Driver",
    clock: [
      { val: "20", label: "KM / LITER" },
      { val: "05", label: "PASSENGERS" },
      { val: "15", label: "MIN BIA PICKUP" },
      { val: "24", label: "HR SUPPORT" },
    ],
  },
  {
    vehicle: FLEET_VEHICLES[0], // Suzuki Wagon R Hybrid
    pill: "Best Daily Value",
    location: "Colombo • Negombo • Galle",
    headTitle: "Suzuki Wagon R",
    tailTitle: "Stingray",
    year: "'26",
    descLead: "effortless city driving and unbeatable fuel economy.",
    descRest:
      "Sri Lanka's favorite everyday hybrid hatchback. Easy to park on busy Colombo streets, ice-cold A/C, and Rs. 8,500/day with no hidden fees.",
    stat1: "8,500",
    stat1Sup: "LKR",
    stat2: "22",
    stat2Sup: "km/L",
    statMonth: "Automatic Hybrid",
    clock: [
      { val: "22", label: "KM / LITER" },
      { val: "04", label: "PASSENGERS" },
      { val: "30", label: "MIN DELIVERY" },
      { val: "24", label: "HR SUPPORT" },
    ],
  },
  {
    vehicle: FLEET_VEHICLES[2], // Toyota Raize Turbo SUV
    pill: "Hill Country Ready",
    location: "Kandy • Nuwara Eliya • Ella",
    headTitle: "Toyota Raize",
    tailTitle: "Turbo SUV",
    year: "'26",
    descLead: "high ground clearance built for island road trips.",
    descRest:
      "Take on winding hill-country roads in Kandy and Ella or cruise the Southern Expressway to Mirissa with Apple CarPlay and plenty of luggage room.",
    stat1: "15,500",
    stat1Sup: "LKR",
    stat2: "17",
    stat2Sup: "km/L",
    statMonth: "1.0L Turbo SUV",
    clock: [
      { val: "17", label: "KM / LITER" },
      { val: "05", label: "PASSENGERS" },
      { val: "04", label: "LARGE BAGS" },
      { val: "24", label: "HR SUPPORT" },
    ],
  },
];

export default function HomePage() {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [compareList, setCompareList] = useState<Vehicle[]>([]);
  const [compareOpen, setCompareOpen] = useState<boolean>(false);
  const [bookingOpen, setBookingOpen] = useState<boolean>(false);
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(
    FLEET_VEHICLES[1]
  );
  const [bookingHub, setBookingHub] = useState<string>("Colombo");
  const [bookingDays, setBookingDays] = useState<number>(3);

  const currentSlide = HERO_SLIDES[activeSlideIdx];
  const nextSlideIdx = (activeSlideIdx + 1) % HERO_SLIDES.length;
  const nextSlide = HERO_SLIDES[nextSlideIdx];

  // Global Page Scroll Progress Bar
  const { scrollYProgress: pageProgress } = useScroll();
  const scaleX = useSpring(pageProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Hero Scroll Parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgScale = useTransform(heroScroll, [0, 1], [1, 1.18]);
  const heroContentY = useTransform(heroScroll, [0, 1], [0, 120]);
  const heroDimOpacity = useTransform(heroScroll, [0, 0.85], [0.25, 0.85]);

  const handleToggleCompare = (vehicle: Vehicle) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === vehicle.id);
      if (exists) return prev.filter((item) => item.id !== vehicle.id);
      if (prev.length >= 3) return [...prev.slice(1), vehicle];
      return [...prev, vehicle];
    });
  };

  const handleOpenBookingForVehicle = (
    vehicle: Vehicle,
    hubCity?: string,
    daysCount?: number
  ) => {
    setBookingVehicle(vehicle);
    if (hubCity) setBookingHub(hubCity);
    if (daysCount) setBookingDays(daysCount);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF5500] selection:text-black">
      {/* LFG-Style Slot-Reel Preloader & 24-Stripe Curtain Reveal */}
      <PreloaderCurtain />

      {/* Full-Viewport Canvas 2D Fluid Smoke Cursor (100% Exact Coordinates) */}
      <FluidCursor />

      {/* Subtle Film Grain Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Scroll Progress Line */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#FF5500] origin-left z-[60]"
      />

      {/* Mix-Blend-Difference Rolling Navbar */}
      <Navbar
        compareCount={compareList.length}
        onOpenCompare={() => setCompareOpen(true)}
        onOpenBooking={() =>
          handleOpenBookingForVehicle(currentSlide.vehicle, "Colombo", 3)
        }
      />

      {/* =====================================================================
          FULL-BLEED HERO STAGE WITH SCRAMBLE TITLE & UP-NEXT POSTER
      ===================================================================== */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen w-full overflow-hidden flex flex-col justify-end pb-14 pt-32"
      >
        {/* Background Full-Bleed Artwork with Crossfade & Scroll Zoom */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.vehicle.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
            style={{ scale: heroImgScale }}
            className="absolute inset-0 z-0"
          >
            <img
              src={currentSlide.vehicle.image}
              alt={currentSlide.vehicle.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-[#050505]/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/85 via-transparent to-[#050505]/70" />
          </motion.div>
        </AnimatePresence>

        {/* Scroll-Reactive Dim Layer */}
        <motion.div
          style={{ opacity: heroDimOpacity }}
          className="pointer-events-none absolute inset-0 bg-black z-[1]"
        />

        {/* Hero Foreground Grid */}
        <motion.div
          style={{ y: heroContentY }}
          className="relative z-10 max-w-[1400px] w-full mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end"
        >
          {/* Left 7 Columns: Scramble Display Title & Editorial Specs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Meta Pill Row */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.2em]">
              <span className="px-3 py-1 bg-[#FF5500] text-black font-bold">
                {currentSlide.pill}
              </span>
              <span className="text-neutral-300">{currentSlide.location}</span>
            </div>

            {/* Giant Scramble Headline */}
            <h1 className="font-display font-black text-5xl sm:text-7xl xl:text-[5.5rem] uppercase tracking-tight leading-[0.94] text-white">
              <span className="block">
                <ScrambleText
                  text={currentSlide.headTitle}
                  triggerKey={`head-${activeSlideIdx}`}
                />
              </span>
              <span className="block">
                <ScrambleText
                  text={currentSlide.tailTitle}
                  triggerKey={`tail-${activeSlideIdx}`}
                />{" "}
                <span className="text-[#FF5500]">
                  <ScrambleText
                    text={currentSlide.year}
                    triggerKey={`year-${activeSlideIdx}`}
                  />
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-neutral-300 text-base sm:text-lg max-w-xl leading-relaxed font-light">
              Experience a ride where{" "}
              <strong className="text-white font-semibold">
                {currentSlide.descLead}
              </strong>{" "}
              {currentSlide.descRest}
            </p>

            {/* Stylized Spec Callout */}
            <div className="flex flex-wrap items-baseline gap-4 pt-2">
              <span className="font-display font-black text-3xl sm:text-5xl text-white tabular-nums">
                Rs. {currentSlide.stat1}
                <sup className="text-sm text-[#FF5500] ml-1">
                  /day
                </sup>
              </span>
              <span className="font-display text-2xl text-[#FF5500]">&amp;</span>
              <span className="font-display font-black text-3xl sm:text-5xl text-white tabular-nums">
                {currentSlide.stat2}
                <sup className="text-sm text-[#FF5500] ml-1">
                  {currentSlide.stat2Sup}
                </sup>
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-neutral-400 ml-2">
                {currentSlide.statMonth}
              </span>
            </div>
          </div>

          {/* Right 5 Columns: Rolling Counter & Bracket CTAs */}
          <div className="lg:col-span-5 flex flex-col lg:items-end justify-end space-y-8">
            {/* Rolling Digit Counter */}
            <div className="flex items-start gap-6 sm:gap-8">
              {currentSlide.clock.map((unit, uIdx) => (
                <div key={uIdx} className="flex flex-col items-center">
                  <div className="overflow-hidden h-14 sm:h-16 flex items-center">
                    <motion.span
                      key={`${activeSlideIdx}-${unit.val}`}
                      initial={{ y: "85%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{
                        duration: 0.55,
                        delay: uIdx * 0.06,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="font-display font-black text-4xl sm:text-6xl text-white tabular-nums leading-none"
                    >
                      {unit.val}
                    </motion.span>
                  </div>
                  <span className="mt-2 font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-neutral-400">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Bracket CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() =>
                  handleOpenBookingForVehicle(
                    currentSlide.vehicle,
                    "Colombo",
                    3
                  )
                }
                className="px-7 py-4 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <RollText>[ Book This Vehicle ]</RollText>
              </button>

              <a
                href="#fleet-showroom"
                className="px-7 py-4 border border-white/30 hover:border-[#FF5500] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <RollText>[ Browse All Cars ]</RollText>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar: Scroll Indicator + Side Slide Bullets + "Up Next" Poster Button */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 sm:px-12 mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
            Scroll ↓
          </span>

          {/* Slide Selector Bullets */}
          <div className="flex items-center gap-6">
            {HERO_SLIDES.map((s, idx) => {
              const active = idx === activeSlideIdx;
              return (
                <button
                  key={s.vehicle.id}
                  onClick={() => setActiveSlideIdx(idx)}
                  className="group flex items-center gap-2.5 text-left focus:outline-none"
                >
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? "text-white font-bold"
                        : "text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  >
                    {s.headTitle}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      active
                        ? "bg-[#FF5500] scale-125"
                        : "bg-white/25 group-hover:bg-white/60"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* "Up Next" Thumbnail Card Button */}
          <button
            onClick={() => setActiveSlideIdx(nextSlideIdx)}
            data-cursor="NEXT"
            className="group flex items-center gap-4 p-2 pr-4 bg-white/[0.04] hover:bg-white/[0.1] border border-white/15 transition-all"
          >
            <div className="relative w-16 h-11 overflow-hidden bg-black">
              <img
                src={nextSlide.vehicle.image}
                alt={nextSlide.headTitle}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="text-left">
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#FF5500]">
                Up next
              </span>
              <span className="block font-display font-bold text-xs text-white">
                {nextSlide.headTitle} {nextSlide.tailTitle}
              </span>
            </div>
            <span className="font-mono text-sm text-[#FF5500] group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </section>

      {/* =====================================================================
          STAR-SEPARATED MARQUEE TICKER
      ===================================================================== */}
      <div className="py-5 bg-[#FF5500] text-black overflow-hidden select-none border-y border-white/10">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-10 whitespace-nowrap w-max font-display font-black text-xl sm:text-2xl uppercase tracking-wider"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-10">
                <span>Flexi Rental Sri Lanka</span>
                <FourPointStar className="w-4 h-4 text-black" />
                <span className="bg-black text-white px-3 py-0.5">
                  24/7 Katunayake Airport Pickup
                </span>
                <FourPointStar className="w-4 h-4 text-black" />
                <span>Self-Drive &amp; With-Driver Options</span>
                <FourPointStar className="w-4 h-4 text-black" />
                <span>Colombo • Kandy • Galle • Negombo • Ella</span>
                <FourPointStar className="w-4 h-4 text-black" />
              </span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* =====================================================================
          SUDDEN STICKY HORIZONTAL SCROLL REEL (ISLAND ROUTES & CARS)
      ===================================================================== */}
      <HorizontalScrollSection
        onSelectVehicleForBooking={(vehicle, hubCity) =>
          handleOpenBookingForVehicle(vehicle, hubCity, 3)
        }
      />

      {/* =====================================================================
          SCROLLYTELLING SECTIONS
      ===================================================================== */}
      <ScrollytellingSection
        onOpenBooking={() =>
          handleOpenBookingForVehicle(currentSlide.vehicle, "Colombo", 3)
        }
      />

      {/* =====================================================================
          (OUR FLEET) — EVERYDAY CARS, HYBRIDS, SUVS & VANS
      ===================================================================== */}
      <FleetShowroom
        compareList={compareList}
        onToggleCompare={handleToggleCompare}
        onSelectForBooking={(car) =>
          handleOpenBookingForVehicle(car, "Colombo", 3)
        }
      />

      {/* =====================================================================
          CURVED "WORM" CUSTOMER + CAR HANDOVER GALLERY (ENTERS BOTTOM, LOOPS & RISES UP)
      ===================================================================== */}
      <CustomerWormGallery />

      {/* =====================================================================
          LFG-STYLE VELOCITY MARQUEE, WORD-BY-WORD MANIFESTO, HOVER PREVIEW & FAQ
      ===================================================================== */}
      <LFGShowcaseExtras
        onSelectVehicleForBooking={(vehicle, hubCity) =>
          handleOpenBookingForVehicle(vehicle, hubCity, 3)
        }
      />

      {/* =====================================================================
          LKR RATE CALCULATOR
      ===================================================================== */}
      <PricingCalculator
        onReserveWithConfig={(vehicle, days) => {
          handleOpenBookingForVehicle(vehicle, "Colombo", days);
        }}
      />

      {/* =====================================================================
          SRI LANKA BRANCH LOCATIONS
      ===================================================================== */}
      <GlobalHubsSection
        onSelectVehicleForBooking={(vehicle, hubCity) =>
          handleOpenBookingForVehicle(vehicle, hubCity, 3)
        }
      />

      {/* =====================================================================
          MODALS & FOOTER
      ===================================================================== */}
      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        vehicles={compareList}
        onRemoveVehicle={(id) =>
          setCompareList((prev) => prev.filter((c) => c.id !== id))
        }
        onSelectForBooking={(car) =>
          handleOpenBookingForVehicle(car, "Colombo", 3)
        }
      />

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialVehicle={bookingVehicle}
        initialHub={bookingHub}
        initialDays={bookingDays}
      />

      <Footer
        onOpenBooking={() =>
          handleOpenBookingForVehicle(currentSlide.vehicle, "Colombo", 3)
        }
      />
    </div>
  );
}

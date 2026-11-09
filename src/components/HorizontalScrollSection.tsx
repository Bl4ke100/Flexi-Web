"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FLEET_VEHICLES, Vehicle } from "@/data/fleetData";
import { ScrambleText, RollText, FourPointStar } from "./AnimatedText";

interface HorizontalScrollSectionProps {
  onSelectVehicleForBooking: (vehicle: Vehicle, hubCity: string) => void;
}

const HORIZONTAL_CARDS = [
  {
    num: "01",
    route: "KATUNAYAKE BIA → COLOMBO",
    distanceKm: "35 KM EXPRESSWAY",
    tag: "24/7 AIRPORT PICKUP",
    title: "Step Off the Plane Into Your Waiting Car",
    subtitle:
      "No taxi queues or surge pricing. Our team meets you at Katunayake Arrivals with your sanitized hybrid ready to drive.",
    vehicle: FLEET_VEHICLES[1], // Toyota Axio Hybrid WxB
    hub: "Katunayake Airport",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "02",
    route: "COLOMBO CITY & SUBURBS",
    distanceKm: "22 KM/L HYBRID ECONOMY",
    tag: "DAILY CITY FAVORITE",
    title: "Beat Colombo Traffic & Save on Fuel",
    subtitle:
      "Compact dimensions for easy parking on Galle Road and Union Place, paired with ice-cold dual A/C and automatic hybrid comfort.",
    vehicle: FLEET_VEHICLES[0], // Suzuki Wagon R Hybrid
    hub: "Colombo",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "03",
    route: "KANDY → NUWARA ELIYA → ELLA",
    distanceKm: "210 KM HILL COUNTRY",
    tag: "HIGHLAND TURBO SUV",
    title: "Built for Winding Tea Country Roads",
    subtitle:
      "High ground clearance, responsive 1.0L turbo torque for steep hairpin bends, and Apple CarPlay for effortless navigation.",
    vehicle: FLEET_VEHICLES[2], // Toyota Raize Z Turbo
    hub: "Kandy",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "04",
    route: "SOUTHERN EXPRESSWAY → GALLE & MIRISSA",
    distanceKm: "130 KM COASTAL CRUISE",
    tag: "HIGHWAY COMFORT",
    title: "Smooth Coastal Runs Down South",
    subtitle:
      "Cruise control, Honda Sensing safety suite, and generous boot space for beach bags, surfboards, or family luggage.",
    vehicle: FLEET_VEHICLES[3], // Honda Vezel RS
    hub: "Galle",
    image:
      "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "05",
    route: "ISLAND-WIDE FAMILY & GROUP TOURS",
    distanceKm: "9 TO 12 PASSENGERS",
    tag: "SELF-DRIVE OR CHAUFFEUR",
    title: "Bring the Whole Family Together",
    subtitle:
      "High-roof cabin with individual rear A/C vents, reclining plush seats, and optional experienced English-speaking local driver.",
    vehicle: FLEET_VEHICLES[5], // Toyota KDH Van
    hub: "Colombo",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=85",
  },
];

export default function HorizontalScrollSection({
  onSelectVehicleForBooking,
}: HorizontalScrollSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [odometerKm, setOdometerKm] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring progress for the horizontal translation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.0005,
  });

  // Translate the horizontal track from 0% to -78% as user scrolls vertically
  const xTranslate = useTransform(smoothProgress, [0, 1], ["0%", "-78%"]);

  // Counter-moving giant background watermark text
  const bgTextX = useTransform(smoothProgress, [0, 1], ["5%", "-45%"]);

  // Internal image parallax inside each card
  const imgObjectPos = useTransform(
    smoothProgress,
    [0, 1],
    ["15% 50%", "85% 50%"]
  );

  // Velocity-reactive skew effect on cards when scrolling fast
  const scrollVelocity = useVelocity(scrollYProgress);
  const rawSkew = useTransform(scrollVelocity, [-0.8, 0, 0.8], [5, 0, -5]);
  const skewX = useSpring(rawSkew, { stiffness: 220, damping: 28 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const clamped = Math.max(0, Math.min(1, v));
    setProgressPct(Math.round(clamped * 100));
    setOdometerKm(Math.round(clamped * 485));
  });

  return (
    <section
      id="island-routes"
      ref={sectionRef}
      className="relative h-[440vh] bg-[#050505] border-t border-white/10"
    >
      {/* Sticky Full-Screen Viewport that Hijacks Vertical Scroll into Horizontal Motion */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-10 sm:py-14">
        {/* Background Giant Kinetic Typography Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden select-none z-0">
          <motion.div
            style={{ x: bgTextX }}
            className="whitespace-nowrap font-display font-black text-[18vw] leading-none uppercase tracking-tighter text-white/[0.03]"
          >
            COLOMBO ✦ KATUNAYAKE BIA ✦ KANDY ✦ ELLA ✦ GALLE FORT ✦ MIRISSA ✦ SIGIRIYA
          </motion.div>
        </div>

        {/* Top Telemetry Bar Inside Sticky Viewport */}
        <div className="relative z-20 max-w-[1440px] w-full mx-auto px-6 sm:px-12 flex flex-wrap items-center justify-between gap-4 pt-10 sm:pt-12">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5500] text-black font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
              <FourPointStar className="w-3 h-3 text-black" />
              Horizontal Route Reel
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 hidden sm:inline">
              <ScrambleText text="(Keep scrolling down to glide sideways →)" />
            </span>
          </div>

          {/* Live Odometer & Percentage Telemetry */}
          <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">DISTANCE:</span>
              <span className="text-white font-bold tabular-nums">
                {String(odometerKm).padStart(3, "0")} KM
              </span>
            </div>
            <div className="h-3 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">REEL:</span>
              <span className="text-[#FF5500] font-bold tabular-nums">
                {String(progressPct).padStart(3, "0")}%
              </span>
            </div>
          </div>
        </div>

        {/* Main Horizontal Sliding Track */}
        <div className="relative z-10 flex items-center flex-1 overflow-visible my-4">
          <motion.div
            style={{ x: xTranslate, skewX }}
            className="flex items-stretch gap-8 sm:gap-12 pl-6 sm:pl-16 pr-24 w-max"
          >
            {/* ===============================================================
                INTRO TITLE PANEL (PANEL 00)
            =============================================================== */}
            <div className="w-[85vw] sm:w-[520px] lg:w-[580px] shrink-0 flex flex-col justify-between p-8 sm:p-12 bg-[#0A0A0A] border border-white/15 relative overflow-hidden">
              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] block">
                  (00 // Island-Wide Journeys)
                </span>
                <h2 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight leading-[0.95] text-white">
                  Every Sri Lankan Route,{" "}
                  <span className="text-[#FF5500]">One Fleet.</span>
                </h2>
              </div>

              <p className="text-neutral-400 text-base sm:text-lg font-light leading-relaxed my-6">
                Scroll vertically to glide across our most popular Sri Lankan
                driving routes—matched with the exact everyday car, hybrid, SUV,
                or van built for that journey.
              </p>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-ping" />
                  <span>Scroll to Explore Sideways</span>
                </div>
                <span className="font-display font-black text-3xl text-[#FF5500]">
                  →
                </span>
              </div>
            </div>

            {/* ===============================================================
                ROUTE & VEHICLE HORIZONTAL CARDS (PANELS 01 - 05)
            =============================================================== */}
            {HORIZONTAL_CARDS.map((card) => (
              <div
                key={card.num}
                onClick={() =>
                  onSelectVehicleForBooking(card.vehicle, card.hub)
                }
                data-cursor="BOOK"
                className="group cursor-pointer w-[88vw] sm:w-[600px] lg:w-[680px] shrink-0 bg-[#0B0B0B] border border-white/15 hover:border-[#FF5500] transition-colors duration-300 grid grid-cols-1 md:grid-cols-12 overflow-hidden"
              >
                {/* Left Image Column with Internal Horizontal Pan Parallax */}
                <div className="md:col-span-6 relative min-h-[240px] md:min-h-[420px] overflow-hidden bg-black">
                  <motion.img
                    src={card.image}
                    alt={card.title}
                    style={{ objectPosition: imgObjectPos }}
                    className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#FF5500] text-black font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                      {card.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-300 block">
                        RECOMMENDED CAR
                      </span>
                      <span className="font-display font-bold text-lg text-white">
                        {card.vehicle.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#FF5500] bg-black/80 px-2.5 py-1 border border-[#FF5500]/40">
                      Rs. {card.vehicle.pricePerDay.toLocaleString()}/d
                    </span>
                  </div>
                </div>

                {/* Right Editorial Specs Column */}
                <div className="md:col-span-6 p-7 sm:p-9 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs text-neutral-400 mb-4 pb-3 border-b border-white/10">
                      <span className="text-[#FF5500] font-bold">
                        ROUTE // {card.num}
                      </span>
                      <span>{card.distanceKm}</span>
                    </div>

                    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-300 mb-2">
                      {card.route}
                    </div>

                    <h3 className="font-display font-black text-2xl sm:text-3xl text-white group-hover:text-[#FF5500] transition-colors leading-tight mb-4">
                      {card.title}
                    </h3>

                    <p className="text-neutral-400 text-sm leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Practical Vehicle Specs Pill Strip */}
                  <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white/[0.03] border border-white/10">
                        <span className="block font-mono text-[9px] text-neutral-500 uppercase">
                          ECONOMY
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {card.vehicle.fuelEconomy}
                        </span>
                      </div>
                      <div className="p-2 bg-white/[0.03] border border-white/10">
                        <span className="block font-mono text-[9px] text-neutral-500 uppercase">
                          SEATS
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {card.vehicle.seats}
                        </span>
                      </div>
                      <div className="p-2 bg-white/[0.03] border border-white/10">
                        <span className="block font-mono text-[9px] text-neutral-500 uppercase">
                          PICKUP
                        </span>
                        <span className="font-mono text-xs font-bold text-[#FF5500] truncate">
                          {card.hub}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-white group-hover:text-[#FF5500] transition-colors pt-1">
                      <span>[ Reserve For This Route ]</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* ===============================================================
                OUTRO ORANGE HIGH-IMPACT CTA CARD (PANEL 06)
            =============================================================== */}
            <div
              onClick={() =>
                onSelectVehicleForBooking(FLEET_VEHICLES[1], "Colombo")
              }
              data-cursor="RESERVE"
              className="w-[85vw] sm:w-[480px] shrink-0 bg-[#FF5500] text-black p-8 sm:p-12 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-[0.2em]">
                <span>(06 // Custom Trip?)</span>
                <FourPointStar className="w-5 h-5 text-black group-hover:rotate-90 transition-transform duration-500" />
              </div>

              <div className="my-8">
                <h3 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight leading-[0.95] mb-4">
                  Need Delivery Anywhere Else in Sri Lanka?
                </h3>
                <p className="text-black/80 text-base font-medium leading-relaxed">
                  We deliver vehicles to hotels, homes, and train stations
                  across Colombo, Negombo, Kandy, Galle, and Ella—with or
                  without a driver.
                </p>
              </div>

              <div className="pt-6 border-t border-black/20 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-[0.2em]">
                <span className="px-5 py-3 bg-black text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <RollText>[ Start Custom Booking ]</RollText>
                </span>
                <span className="text-2xl">↗</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Progress Rail Inside Sticky Stage */}
        <div className="relative z-20 max-w-[1440px] w-full mx-auto px-6 sm:px-12">
          <div className="w-full h-[2px] bg-white/15 relative overflow-hidden">
            <motion.div
              style={{ scaleX: smoothProgress }}
              className="absolute inset-0 bg-[#FF5500] origin-left"
            />
          </div>
          <div className="flex items-center justify-between mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
            <span>01 // BIA AIRPORT</span>
            <span className="hidden sm:inline">02 // COLOMBO CITY</span>
            <span className="hidden md:inline">03 // KANDY &amp; ELLA</span>
            <span className="hidden sm:inline">04 // GALLE COAST</span>
            <span>05 // GROUP VANS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

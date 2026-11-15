"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useMotionValue,
} from "framer-motion";
import { PINNED_SCROLL_QUERY, useMediaQuery } from "@/lib/use-media-query";
import { responsiveImage } from "@/lib/responsive-image";
import { ArrowUpRight } from "lucide-react";
import { formatDailyRate } from "@/data/fleetData";
import { ScrambleText, RollText, FourPointStar } from "./AnimatedText";
import WhatsAppLink from "./WhatsAppLink";
import { useSiteContent } from "./SiteContentProvider";

const HORIZONTAL_CARDS = [
  {
    "num": "01",
    "route": "AIRPORT ARRIVAL & DEPARTURE",
    "distanceKm": "PICKUP & RETURN",
    "tag": "AIRPORT RENTALS",
    "title": "Start and finish your trip at the airport.",
    "vehicleId": "toyota-axio",
    "image": "/routes/airport-arrival.webp",
    "imageAlt": "Rental car handover outside an airport in Sri Lanka",
    "hub": "Airport"
  },
  {
    "num": "02",
    "route": "EVERYDAY CITY JOURNEYS",
    "distanceKm": "COMPACT RENTALS",
    "tag": "CITY OPTIONS",
    "title": "Find a compact car for your stay.",
    "vehicleId": "suzuki-wagon-r",
    "image": "/routes/colombo-city.webp",
    "imageAlt": "A compact city car on a leafy Colombo street",
    "hub": "By arrangement"
  },
  {
    "num": "03",
    "route": "SRI LANKAN GETAWAYS",
    "distanceKm": "SUV & CROSSOVER",
    "tag": "YOUR NEXT GETAWAY",
    "title": "Explore your options with a Vezel.",
    "vehicleId": "honda-vezel",
    "image": "/routes/hill-country.webp",
    "imageAlt": "A crossover beside misty tea plantations in Sri Lanka's hill country",
    "hub": "By arrangement"
  },
  {
    "num": "04",
    "route": "SHORT & LONG STAYS",
    "distanceKm": "FLEXIBLE RENTALS",
    "tag": "RENTAL OPTIONS",
    "title": "Choose a rental for your travel dates.",
    "vehicleId": "toyota-prius",
    "image": "/routes/coastal-stay.webp",
    "imageAlt": "A hybrid rental car beside a tropical coastal holiday stay",
    "hub": "By arrangement"
  },
  {
    "num": "05",
    "route": "FAMILY & GROUP JOURNEYS",
    "distanceKm": "VAN RENTALS",
    "tag": "NISSAN NV200",
    "title": "Ask about a van for your journey.",
    "vehicleId": "nissan-nv200",
    "image": "/routes/family-journey.webp",
    "imageAlt": "A family beside a passenger van at a scenic Sri Lankan stop",
    "hub": "By arrangement"
  }
];

export default function HorizontalScrollSection() {
  const { fleet } = useSiteContent();
  const cards = HORIZONTAL_CARDS.map(card => ({ ...card,
    vehicle: fleet.find(vehicle => vehicle.id === card.vehicleId) ?? fleet[0],
  }));
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const pinned = useMediaQuery(PINNED_SCROLL_QUERY);
  const swipeProgress = useMotionValue(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
      setTravel(distance);
      swipeProgress.set(distance ? viewport.scrollLeft / distance : 0);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    measure();
    return () => observer.disconnect();
  }, [swipeProgress]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const reelProgress = useTransform<number, number>([scrollYProgress, swipeProgress], ([vertical, swipe]) => pinned ? vertical : swipe);
  // Desktop scrolling and touch swiping share the same progress indicators.
  const smoothProgress = useSpring(reelProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.0005,
  });

  // Stop with the final card at the right gutter, then release the sticky stage.
  // Direct progress keeps the track from trailing behind the vertical handoff.
  const xTranslate = useTransform(scrollYProgress, [0, 1], [0, -travel]);

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

  const progressPct = useTransform(reelProgress, value => `${String(Math.round(Math.max(0, Math.min(1, value)) * 100)).padStart(3, "0")}%`);
  const odometerKm = useTransform(reelProgress, value => `${String(Math.round(Math.max(0, Math.min(1, value)) * 485)).padStart(3, "0")} KM`);

  return (
    <section
      id="island-routes"
      ref={sectionRef}
      style={{ height: pinned ? `calc(100svh + ${travel}px)` : "auto" }}
      className="relative bg-[#050505] border-t border-white/10"
    >
      {/* Sticky Full-Screen Viewport that Hijacks Vertical Scroll into Horizontal Motion */}
      <div className={`${pinned ? "sticky top-0 h-[100svh]" : "relative"} w-full overflow-hidden flex flex-col justify-between py-10 sm:py-14`}>
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
              <motion.span className="text-white font-bold tabular-nums">{odometerKm}</motion.span>
            </div>
            <div className="h-3 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">REEL:</span>
              <motion.span className="text-[#FF5500] font-bold tabular-nums">{progressPct}</motion.span>
            </div>
          </div>
          {!pinned && <p className="w-full text-xs text-neutral-400">Swipe or scroll sideways to explore →</p>}
        </div>

        {/* Main Horizontal Sliding Track */}
        <div ref={viewportRef} tabIndex={pinned ? undefined : 0} role="region" aria-label="Sri Lanka rental routes" onScroll={event => {
          if (!pinned) swipeProgress.set(travel ? event.currentTarget.scrollLeft / travel : 0);
        }} className={`relative z-10 flex items-center flex-1 my-6 ${pinned ? "overflow-visible" : "overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-px-6 pb-4"}`}>
          <motion.div
            ref={trackRef}
            style={{ x: pinned ? xTranslate : 0, skewX: pinned ? skewX : 0 }}
            className="flex items-stretch gap-5 sm:gap-12 px-6 sm:px-16 w-max [&>*]:snap-start"
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
                {pinned ? "Scroll vertically to glide" : "Swipe sideways to browse"} across our most popular Sri Lankan
                driving routes—matched with the exact everyday car, hybrid, SUV,
                or van built for that journey.
              </p>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-ping" />
                  <span>{pinned ? "Scroll to Explore Sideways" : "Swipe to Explore"}</span>
                </div>
                <span className="font-display font-black text-3xl text-[#FF5500]">
                  →
                </span>
              </div>
            </div>

            {/* ===============================================================
                ROUTE & VEHICLE HORIZONTAL CARDS (PANELS 01 - 05)
            =============================================================== */}
            {cards.map((card) => (
              <WhatsAppLink
                key={card.num}
                vehicle={card.vehicle}
                hub={card.hub}
                inquiry={`Trip: ${card.route}`}
                aria-label={`Plan ${card.route} with ${card.vehicle.name} on WhatsApp`}
                data-cursor="CHAT"
                className="group cursor-pointer w-[calc(100vw-3rem)] sm:w-[600px] lg:w-[680px] shrink-0 bg-[#0B0B0B] border border-white/15 hover:border-[#FF5500] transition-colors duration-300 grid grid-cols-1 sm:grid-cols-12 overflow-hidden"
              >
                {/* Left Image Column with Internal Horizontal Pan Parallax */}
                <div className="sm:col-span-6 relative h-56 sm:h-auto sm:min-h-[420px] overflow-hidden bg-black">
                  <motion.img
                    {...responsiveImage(card.image, "(min-width: 640px) 340px, 88vw")}
                    loading="lazy" decoding="async"
                    alt={card.imageAlt}
                    style={{ objectPosition: imgObjectPos }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#FF5500] text-black font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                      {card.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 items-end justify-between">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-300 block">
                        RECOMMENDED CAR
                      </span>
                      <span className="font-display font-bold text-lg text-white">
                        {card.vehicle.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#FF5500] bg-black/80 px-2.5 py-1 border border-[#FF5500]/40">
                      {formatDailyRate(card.vehicle.pricePerDay)}
                    </span>
                  </div>
                </div>

                {/* Right Editorial Specs Column */}
                <div className="sm:col-span-6 min-w-0 p-5 sm:p-9 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 items-center justify-between font-mono text-[10px] sm:text-xs text-neutral-400 mb-4 pb-3 border-b border-white/10">
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
                      {card.vehicle.tagline}
                    </p>
                  </div>

                  {/* Practical Vehicle Specs Pill Strip */}
                  <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)] gap-2 text-center">
                      <div className="min-w-0 p-2 bg-white/[0.03] border border-white/10">
                        <span className="block font-mono text-[9px] text-neutral-500 uppercase">
                          ECONOMY
                        </span>
                        <span className="block font-mono text-xs font-bold text-white [overflow-wrap:anywhere]">
                          {card.vehicle.fuelEconomy}
                        </span>
                      </div>
                      <div className="min-w-0 p-2 bg-white/[0.03] border border-white/10">
                        <span className="block font-mono text-[9px] text-neutral-500 uppercase">
                          SEATS
                        </span>
                        <span className="block font-mono text-xs font-bold text-white [overflow-wrap:anywhere]">
                          {card.vehicle.seats ?? "Ask us"}
                        </span>
                      </div>
                      <div className="min-w-0 p-2 bg-white/[0.03] border border-white/10">
                        <span className="block font-mono text-[9px] text-neutral-500 uppercase">
                          PICKUP
                        </span>
                        <span className="block font-mono text-[11px] font-bold text-[#FF5500] [overflow-wrap:anywhere]">
                          {card.hub}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-white group-hover:text-[#FF5500] transition-colors pt-1">
                      <span>[ Plan on WhatsApp ]</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </WhatsAppLink>
            ))}

            {/* ===============================================================
                OUTRO ORANGE HIGH-IMPACT CTA CARD (PANEL 06)
            =============================================================== */}
            <WhatsAppLink
              inquiry="I'd like help planning a custom trip and vehicle delivery."
              data-cursor="CHAT"
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
                  Tell us your travel plans and preferred handover point.
                  Our team will help you arrange the right vehicle, delivery,
                  and return for your journey.
                </p>
              </div>

              <div className="pt-6 border-t border-black/20 flex items-center justify-between gap-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-[0.2em]">
                <span className="px-3 sm:px-5 py-3 bg-black text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <RollText>[ Chat on WhatsApp ]</RollText>
                </span>
                <span className="text-2xl">↗</span>
              </div>
            </WhatsAppLink>
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

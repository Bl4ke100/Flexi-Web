"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { FLEET_VEHICLES, Vehicle } from "@/data/fleetData";
import {
  ScrambleText,
  RollingHeading,
  RollText,
  FourPointStar,
} from "./AnimatedText";

interface LFGShowcaseExtrasProps {
  onSelectVehicleForBooking: (vehicle: Vehicle, hubCity: string) => void;
}

const MANIFESTO_TOKENS: Array<{
  text: string;
  highlight?: boolean;
  badge?: string;
}> = [
  { text: "Renting" },
  { text: "a" },
  { text: "car" },
  { text: "in" },
  { text: "Sri", highlight: true },
  { text: "Lanka", highlight: true, badge: "ISLAND-WIDE" },
  { text: "should" },
  { text: "never" },
  { text: "feel" },
  { text: "complicated." },
  { text: "No" },
  { text: "surprise" },
  { text: "broker" },
  { text: "fees," },
  { text: "no" },
  { text: "worn-out" },
  { text: "tires," },
  { text: "and" },
  { text: "no" },
  { text: "waiting" },
  { text: "hours" },
  { text: "at" },
  { text: "the" },
  { text: "airport.", badge: "15M BIA PICKUP" },
  { text: "Just" },
  { text: "clean," },
  { text: "fuel-saving", highlight: true },
  { text: "hybrids,", highlight: true },
  { text: "reliable" },
  { text: "SUVs," },
  { text: "and" },
  { text: "spacious" },
  { text: "vans" },
  { text: "backed" },
  { text: "by" },
  { text: "honest", highlight: true },
  { text: "LKR", highlight: true },
  { text: "rates", highlight: true, badge: "FROM RS. 8,500/D" },
  { text: "and" },
  { text: "24/7" },
  { text: "support." },
];

const TRIP_PAIRINGS = [
  {
    index: "01",
    tripName: "Airport Arrival & Colombo Stay",
    carName: "Toyota Axio Hybrid WxB",
    rate: "Rs. 13,500 / day",
    specs: "20 km/L • 5 Seats • 3 Large Bags",
    hub: "Katunayake Airport",
    vehicle: FLEET_VEHICLES[1],
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1000&q=85",
  },
  {
    index: "02",
    tripName: "Colombo Daily Commute & Errands",
    carName: "Suzuki Wagon R FX Hybrid",
    rate: "Rs. 8,500 / day",
    specs: "22 km/L • 4 Seats • Easy City Parking",
    hub: "Colombo",
    vehicle: FLEET_VEHICLES[0],
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=85",
  },
  {
    index: "03",
    tripName: "Kandy, Nuwara Eliya & Ella Hill Tour",
    carName: "Toyota Raize Z Turbo SUV",
    rate: "Rs. 15,500 / day",
    specs: "16 km/L • Turbo • High Clearance",
    hub: "Kandy",
    vehicle: FLEET_VEHICLES[2],
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=85",
  },
  {
    index: "04",
    tripName: "Galle Fort, Unawatuna & Mirissa Coast",
    carName: "Honda Vezel RS Sensing",
    rate: "Rs. 16,500 / day",
    specs: "18 km/L • Cruise Control • 5 Seats",
    hub: "Galle",
    vehicle: FLEET_VEHICLES[3],
    image:
      "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1000&q=85",
  },
  {
    index: "05",
    tripName: "Extended Family & Group Island Tour",
    carName: "Toyota KDH High-Roof Van",
    rate: "Rs. 22,000 / day",
    specs: "9–12 Seats • Dual A/C • With/Without Driver",
    hub: "Colombo",
    vehicle: FLEET_VEHICLES[5],
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=85",
  },
];

const FAQ_ITEMS = [
  {
    num: "01",
    q: "What documents do I need to rent a self-drive car in Sri Lanka?",
    a: "For Sri Lankan residents: a valid Sri Lankan Driving License, NIC or Passport, and a recent utility bill. For international visitors: your passport, home country driving license, and an International Driving Permit (IDP). We can also arrange your temporary Sri Lankan AAC driving endorsement ahead of arrival so you can drive legally from the moment you land.",
  },
  {
    num: "02",
    q: "How does 24/7 Katunayake Airport (BIA) pickup and drop-off work?",
    a: "Simply share your flight number when booking. Our staff tracks your flight in real time and waits at the Katunayake Arrivals exit with your vehicle inspected, cooled, and fueled. Handover takes less than 10 minutes, even for late-night or early-morning flights.",
  },
  {
    num: "03",
    q: "Can I rent a car or KDH van with an experienced local driver?",
    a: "Yes! Every vehicle in our fleet is available for either self-drive or chauffeur-driven rental. Our English-speaking drivers know all routes across Colombo, Sigiriya, Kandy, Ella, Yala, and the Southern Coast.",
  },
  {
    num: "04",
    q: "Are there any hidden charges, and how does the refundable deposit work?",
    a: "Never any hidden fees. Your daily rate, mileage allowance (100 km/day, 200 km/day, or Unlimited), and any selected extras are shown upfront in LKR. The refundable security deposit is returned in full upon vehicle return.",
  },
  {
    num: "05",
    q: "What happens if I have a flat tire or need assistance outstation?",
    a: "Every rental includes 24/7 island-wide roadside assistance. Whether you are in Colombo, Kandy, Nuwara Eliya, Ella, or Galle, our support team and partner garages can assist you immediately or provide a replacement vehicle if needed.",
  },
];

function ManifestoWord({
  token,
  index,
  total,
  scrollYProgress,
}: {
  token: { text: string; highlight?: boolean; badge?: string };
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  const start = index / total;
  const end = Math.min(1, start + 1.8 / total);
  const opacity = useTransform(scrollYProgress, [start, end], [0.16, 1]);
  const y = useTransform(scrollYProgress, [start, end], [8, 0]);

  return (
    <span className="inline-flex items-center mr-[0.28em] mb-2">
      <motion.span
        style={{ opacity, y }}
        className={`inline-block transition-colors ${
          token.highlight ? "text-[#FF5500]" : "text-white"
        }`}
      >
        {token.text}
      </motion.span>
      {token.badge && (
        <motion.span
          style={{ opacity }}
          className="ml-2 px-2.5 py-1 bg-[#FF5500] text-black font-mono text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] align-middle -translate-y-1"
        >
          {token.badge}
        </motion.span>
      )}
    </span>
  );
}

function VelocityDualMarquee() {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 350,
  });

  const skewRow1 = useTransform(smoothVelocity, [-1500, 0, 1500], [-10, 0, 10]);
  const skewRow2 = useTransform(smoothVelocity, [-1500, 0, 1500], [10, 0, -10]);

  const baseX1 = useMotionValue(0);
  const baseX2 = useMotionValue(-50);
  const directionFactor = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    const vel = smoothVelocity.get();
    if (vel < -50) directionFactor.current = -1;
    else if (vel > 50) directionFactor.current = 1;

    const speedMultiplier = 1 + Math.min(4, Math.abs(vel) / 350);
    const moveBy =
      directionFactor.current * 0.0045 * delta * speedMultiplier;

    let next1 = baseX1.get() - moveBy;
    if (next1 <= -50) next1 += 50;
    if (next1 > 0) next1 -= 50;
    baseX1.set(next1);

    let next2 = baseX2.get() + moveBy;
    if (next2 >= 0) next2 -= 50;
    if (next2 < -50) next2 += 50;
    baseX2.set(next2);
  });

  const x1 = useTransform(baseX1, (v) => `${v}%`);
  const x2 = useTransform(baseX2, (v) => `${v}%`);

  return (
    <div className="py-10 bg-[#050505] border-y border-white/10 overflow-hidden select-none space-y-4">
      {/* Row 1: Solid White & Orange Kinetic Strip */}
      <motion.div
        style={{ x: x1, skewX: skewRow1 }}
        className="flex items-center gap-10 whitespace-nowrap w-max font-display font-black text-4xl sm:text-6xl uppercase tracking-tight"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="text-white">SUZUKI WAGON R HYBRID</span>
            <FourPointStar className="w-6 h-6 text-[#FF5500]" />
            <span className="text-[#FF5500]">TOYOTA AXIO WXB</span>
            <FourPointStar className="w-6 h-6 text-white" />
            <span className="text-white">TOYOTA RAIZE TURBO</span>
            <FourPointStar className="w-6 h-6 text-[#FF5500]" />
          </span>
        ))}
      </motion.div>

      {/* Row 2: Counter-Direction Outlined Strip */}
      <motion.div
        style={{ x: x2, skewX: skewRow2 }}
        className="flex items-center gap-10 whitespace-nowrap w-max font-display font-black text-4xl sm:text-6xl uppercase tracking-tight"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="flex items-center gap-10">
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.45)" }}
            >
              HONDA VEZEL RS HYBRID
            </span>
            <FourPointStar className="w-6 h-6 text-[#FF5500]" />
            <span className="text-white">TOYOTA PRIUS TOURING</span>
            <FourPointStar className="w-6 h-6 text-[#FF5500]" />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px #FF5500" }}
            >
              TOYOTA KDH HIGH-ROOF VAN
            </span>
            <FourPointStar className="w-6 h-6 text-white" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function LFGShowcaseExtras({
  onSelectVehicleForBooking,
}: LFGShowcaseExtrasProps) {
  // 1. Word-by-word illumination scroll ref
  const manifestoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: manifestoProgress } = useScroll({
    target: manifestoRef,
    offset: ["start 0.82", "end 0.35"],
  });

  // 2. Interactive Hover-Following Preview State
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredTripIdx, setHoveredTripIdx] = useState<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 24 });

  const handleListMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!listContainerRef.current) return;
    const rect = listContainerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // 3. FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <div className="bg-[#050505] text-white">
      {/* ===================================================================
          1. SCROLL-VELOCITY DUAL-DIRECTION KINETIC MARQUEE
      =================================================================== */}
      <VelocityDualMarquee />

      {/* ===================================================================
          2. SCROLL-SCRUBBED WORD-BY-WORD ILLUMINATION MANIFESTO
      =================================================================== */}
      <section className="relative py-32 sm:py-44 border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
          <div className="flex items-center justify-between mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500]">
              <ScrambleText text="(The Flexi Standard)" />
            </p>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              SCROLL TO ILLUMINATE ↓
            </span>
          </div>

          <div
            ref={manifestoRef}
            className="font-display font-black text-3xl sm:text-5xl lg:text-6xl leading-[1.16] tracking-tight"
          >
            {MANIFESTO_TOKENS.map((tok, idx) => (
              <ManifestoWord
                key={idx}
                token={tok}
                index={idx}
                total={MANIFESTO_TOKENS.length}
                scrollYProgress={manifestoProgress}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. LFG-STYLE HOVER-FOLLOWING FLOATING IMAGE PREVIEW INDEX
      =================================================================== */}
      <section className="relative py-32 sm:py-44 border-b border-white/10 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3">
                <ScrambleText text="(Match your trip)" />
              </p>
              <RollingHeading
                text="Popular Sri Lankan trip pairings."
                highlightWords={["Sri", "Lankan", "pairings."]}
                className="font-display font-black text-4xl sm:text-6xl tracking-tight"
              />
            </div>
            <p className="text-neutral-400 text-base max-w-md font-light">
              Hover over any trip below to preview the recommended car, fuel
              economy, and daily LKR rate—click to book immediately.
            </p>
          </div>

          {/* Interactive Rows + Cursor-Following Floating Image Box */}
          <div
            ref={listContainerRef}
            onMouseMove={handleListMouseMove}
            onMouseLeave={() => setHoveredTripIdx(null)}
            className="relative divide-y divide-white/15 border-y border-white/15"
          >
            {TRIP_PAIRINGS.map((item, idx) => {
              const isHovered = hoveredTripIdx === idx;
              return (
                <div
                  key={item.index}
                  onMouseEnter={() => setHoveredTripIdx(idx)}
                  onClick={() =>
                    onSelectVehicleForBooking(item.vehicle, item.hub)
                  }
                  data-cursor="BOOK"
                  className="group relative cursor-pointer py-7 sm:py-9 px-4 sm:px-8 transition-colors duration-300 overflow-hidden"
                >
                  {/* Animated Orange Curtain Fill on Hover */}
                  <motion.div
                    initial={false}
                    animate={{
                      y: isHovered ? "0%" : "102%",
                    }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-none absolute inset-0 bg-[#FF5500] z-0"
                  />

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-1 font-mono text-xs font-bold tracking-[0.2em]">
                      <span
                        className={
                          isHovered ? "text-black" : "text-[#FF5500]"
                        }
                      >
                        /{item.index}
                      </span>
                    </div>

                    <div className="lg:col-span-5">
                      <h3
                        className={`font-display font-black text-2xl sm:text-3xl tracking-tight transition-transform duration-300 ${
                          isHovered
                            ? "text-black translate-x-2"
                            : "text-white"
                        }`}
                      >
                        {item.tripName}
                      </h3>
                    </div>

                    <div className="lg:col-span-3">
                      <span
                        className={`font-display font-bold text-lg block ${
                          isHovered ? "text-black" : "text-white"
                        }`}
                      >
                        {item.carName}
                      </span>
                      <span
                        className={`font-mono text-[11px] uppercase tracking-wider ${
                          isHovered ? "text-black/75" : "text-neutral-400"
                        }`}
                      >
                        {item.specs}
                      </span>
                    </div>

                    <div className="lg:col-span-3 flex items-center lg:justify-end gap-4">
                      <span
                        className={`font-mono text-sm font-bold px-3 py-1.5 border ${
                          isHovered
                            ? "bg-black text-white border-black"
                            : "bg-white/[0.04] text-[#FF5500] border-white/15"
                        }`}
                      >
                        {item.rate}
                      </span>
                      <ArrowUpRight
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isHovered
                            ? "text-black translate-x-1 -translate-y-1"
                            : "text-neutral-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Floating Spring-Physics Preview Window Following Cursor */}
            <AnimatePresence>
              {hoveredTripIdx !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    left: smoothX,
                    top: smoothY,
                  }}
                  className="pointer-events-none hidden lg:block absolute z-30 w-80 aspect-[16/10] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-black border-2 border-white shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
                >
                  <img
                    src={TRIP_PAIRINGS[hoveredTripIdx].image}
                    alt={TRIP_PAIRINGS[hoveredTripIdx].carName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white font-bold">
                      {TRIP_PAIRINGS[hoveredTripIdx].carName}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#FF5500]">
                      {TRIP_PAIRINGS[hoveredTripIdx].hub}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. LFG-STYLE INTERACTIVE FAQ ACCORDION FOR SRI LANKAN RENTALS
      =================================================================== */}
      <section className="relative py-32 sm:py-44 bg-[#050505]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left 5 Columns: Sticky Header */}
          <div className="lg:col-span-5 space-y-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500]">
              <ScrambleText text="(Common Questions)" />
            </p>
            <RollingHeading
              text="Everything you need to know before you drive."
              highlightWords={["before", "you", "drive."]}
              className="font-display font-black text-4xl sm:text-5xl tracking-tight leading-[1.04]"
            />
            <p className="text-neutral-400 text-base font-light leading-relaxed">
              Clear answers on documents, foreign driving permits, airport
              handovers, and refundable deposits in Sri Lanka.
            </p>
            <div className="pt-2">
              <button
                onClick={() =>
                  onSelectVehicleForBooking(FLEET_VEHICLES[1], "Colombo")
                }
                className="px-7 py-4 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <RollText>[ Book Your Vehicle Now ]</RollText>
              </button>
            </div>
          </div>

          {/* Right 7 Columns: Animated Accordion */}
          <div className="lg:col-span-7 divide-y divide-white/15 border-y border-white/15">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={item.num} className="py-6">
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-start justify-between gap-6 text-left group"
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="font-mono text-xs font-bold text-[#FF5500]">
                        {item.num}
                      </span>
                      <h3
                        className={`font-display font-bold text-xl sm:text-2xl transition-colors ${
                          isOpen
                            ? "text-[#FF5500]"
                            : "text-white group-hover:text-[#FF5500]"
                        }`}
                      >
                        {item.q}
                      </h3>
                    </div>
                    <span
                      className={`mt-1 w-8 h-8 shrink-0 border flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? "bg-[#FF5500] border-[#FF5500] text-black rotate-45"
                          : "border-white/20 text-white group-hover:border-[#FF5500]"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 pl-10 pr-6 text-neutral-400 text-sm sm:text-base leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

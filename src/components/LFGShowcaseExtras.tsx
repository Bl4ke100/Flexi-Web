"use client";

import OptimizedImage from "@/components/OptimizedImage";
import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useAnimationFrame,
  useInView,
  useMotionValue,
} from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { formatDailyRate } from "@/data/fleetData";
import WhatsAppLink from "./WhatsAppLink";
import { useSiteContent } from "./SiteContentProvider";
import {
  ScrambleText,
  RollingHeading,
  RollText,
  FourPointStar,
} from "./AnimatedText";

const MANIFESTO_TOKENS: Array<{ text: string; highlight?: boolean; badge?: string }> = [
  {
    "text": "Make"
  },
  {
    "text": "your"
  },
  {
    "text": "ride"
  },
  {
    "text": "better"
  },
  {
    "text": "with"
  },
  {
    "text": "Flexi",
    "highlight": true
  },
  {
    "text": "Rental.",
    "highlight": true
  },
  {
    "text": "Clean,"
  },
  {
    "text": "comfortable"
  },
  {
    "text": "cars,"
  },
  {
    "text": "hybrids,"
  },
  {
    "text": "SUVs,"
  },
  {
    "text": "and"
  },
  {
    "text": "vans"
  },
  {
    "text": "for"
  },
  {
    "text": "short"
  },
  {
    "text": "and"
  },
  {
    "text": "long"
  },
  {
    "text": "stays"
  },
  {
    "text": "in"
  },
  {
    "text": "Sri"
  },
  {
    "text": "Lanka."
  },
  {
    "text": "Airport"
  },
  {
    "text": "pickup"
  },
  {
    "text": "and"
  },
  {
    "text": "return,"
  },
  {
    "text": "luxury"
  },
  {
    "text": "wedding",
    "highlight": true
  },
  {
    "text": "cars,"
  },
  {
    "text": "and"
  },
  {
    "text": "customer"
  },
  {
    "text": "support"
  },
  {
    "text": "available"
  },
  {
    "text": "24/7.",
    "highlight": true
  },
  {
    "text": "Choose"
  },
  {
    "text": "your"
  },
  {
    "text": "vehicle"
  },
  {
    "text": "and"
  },
  {
    "text": "ask"
  },
  {
    "text": "our"
  },
  {
    "text": "team"
  },
  {
    "text": "for"
  },
  {
    "text": "a"
  },
  {
    "text": "quote.",
    "highlight": true
  }
];

const TRIP_PAIRINGS = [
  {
    "index": "01",
    "tripName": "Airport pickup & return",
    "vehicleId": "toyota-axio",
    "hub": "Airport"
  },
  {
    "index": "02",
    "tripName": "Everyday compact rentals",
    "vehicleId": "suzuki-wagon-r",
    "hub": "By arrangement"
  },
  {
    "index": "03",
    "tripName": "SUVs for your getaway",
    "vehicleId": "honda-vezel",
    "hub": "By arrangement"
  },
  {
    "index": "04",
    "tripName": "Hybrid rental options",
    "vehicleId": "toyota-prius",
    "hub": "By arrangement"
  },
  {
    "index": "05",
    "tripName": "Van & group enquiries",
    "vehicleId": "nissan-nv200",
    "hub": "By arrangement"
  }
];

const FAQ_ITEMS = [
  {
    "num": "01",
    "q": "What information should I send when enquiring?",
    "a": "Send your rental dates, preferred vehicle, pickup and return arrangements, and any special requests. Our team will confirm availability, the required documents, and rental terms."
  },
  {
    "num": "02",
    "q": "Can I arrange airport pickup and return?",
    "a": "Yes. We arrange airport pickup and return. Share your flight details and dates on WhatsApp to agree the handover arrangements."
  },
  {
    "num": "03",
    "q": "Do you offer wedding cars?",
    "a": "Yes. We offer luxury wedding car rentals. Send your wedding date, locations, and preferred car to ask about the available packages."
  },
  {
    "num": "04",
    "q": "How much will my rental cost?",
    "a": "Rates, deposits, mileage allowances, insurance coverage, and any additional charges are confirmed by our team for your dates and chosen vehicle. Request a full quote on WhatsApp."
  },
  {
    "num": "05",
    "q": "Can I rent for a short or long stay?",
    "a": "Yes. We offer short- and long-term rentals. Let our team know how long you need the vehicle and ask for a quote."
  },
  {
    "num": "06",
    "q": "Is support available during my rental?",
    "a": "Our customer support team is available 24/7. Contact the team on WhatsApp whenever you need assistance."
  }
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
  const marqueeRef = useRef<HTMLDivElement>(null);
  const inView = useInView(marqueeRef, { margin: "100px 0px" });
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
    if (!inView || document.hidden) return;
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
    <div ref={marqueeRef} className="py-10 bg-[#050505] border-y border-white/10 overflow-hidden select-none space-y-4">
      {/* Row 1: Solid White & Orange Kinetic Strip */}
      <motion.div
        style={{ x: x1, skewX: skewRow1 }}
        className="flex items-center gap-10 whitespace-nowrap w-max font-display font-black text-4xl sm:text-6xl uppercase tracking-tight"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="text-white">SUZUKI WAGON R</span>
            <FourPointStar className="w-6 h-6 text-[#FF5500]" />
            <span className="text-[#FF5500]">TOYOTA AXIO</span>
            <FourPointStar className="w-6 h-6 text-white" />
            <span className="text-white">TOYOTA ALLION</span>
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
              HONDA VEZEL RS
            </span>
            <FourPointStar className="w-6 h-6 text-[#FF5500]" />
            <span className="text-white">TOYOTA PRIUS</span>
            <FourPointStar className="w-6 h-6 text-[#FF5500]" />
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px #FF5500" }}
            >
              NISSAN NV200
            </span>
            <FourPointStar className="w-6 h-6 text-white" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function LFGShowcaseExtras() {
  const { fleet } = useSiteContent();
  const tripPairings = TRIP_PAIRINGS.map(item => ({ ...item,
    vehicle: fleet.find(vehicle => vehicle.id === item.vehicleId) ?? fleet[0],
  }));
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
              Explore rental options for your journey. Tap to check availability
              and request a quote on WhatsApp.
            </p>
          </div>

          {/* Interactive Rows + Cursor-Following Floating Image Box */}
          <div
            ref={listContainerRef}
            onMouseMove={handleListMouseMove}
            onMouseLeave={() => setHoveredTripIdx(null)}
            className="relative divide-y divide-white/15 border-y border-white/15"
          >
            {tripPairings.map((item, idx) => {
              const isHovered = hoveredTripIdx === idx;
              return (
                <WhatsAppLink
                  key={item.index}
                  vehicle={item.vehicle}
                  hub={item.hub}
                  inquiry={`Trip: ${item.tripName}`}
                  onMouseEnter={() => setHoveredTripIdx(idx)}
                  onFocus={() => setHoveredTripIdx(idx)}
                  onBlur={() => setHoveredTripIdx(null)}
                  aria-label={`Plan ${item.tripName} on WhatsApp`}
                  data-cursor="CHAT"
                  className="group block relative cursor-pointer py-7 sm:py-9 px-4 sm:px-8 transition-colors duration-300 overflow-hidden"
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
                        {item.vehicle.brand} {item.vehicle.name}
                      </span>
                      <span
                        className={`font-mono text-[11px] uppercase tracking-wider ${
                          isHovered ? "text-black/75" : "text-neutral-400"
                        }`}
                      >
                        {item.vehicle.category} • Check availability on WhatsApp
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
                        {formatDailyRate(item.vehicle.pricePerDay)}
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
                </WhatsAppLink>
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
                  <OptimizedImage
                    src={tripPairings[hoveredTripIdx].vehicle.image} sizes="280px"
                    alt={tripPairings[hoveredTripIdx].vehicle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white font-bold">
                      {tripPairings[hoveredTripIdx].vehicle.name}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#FF5500]">
                      {tripPairings[hoveredTripIdx].hub}
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
              Ask about airport handovers, wedding cars, rental options,
              and the next steps for your booking.
            </p>
            <div className="pt-2">
              <WhatsAppLink
                className="inline-block px-7 py-4 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <RollText>[ Chat on WhatsApp ]</RollText>
              </WhatsAppLink>
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

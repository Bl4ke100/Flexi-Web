"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValueEvent,
} from "framer-motion";
import {
  ScrambleText,
  RollingHeading,
  FourPointStar,
  RollText,
} from "./AnimatedText";

const MOSAIC_IMAGES = [
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80",
];

const DISCIPLINES = [
  {
    num: "01",
    title: "Self-Drive Car Rentals",
    desc: "Clean, well-maintained hybrids, sedans, and SUVs for daily errands or island-wide trips.",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "02",
    title: "Katunayake Airport Pickup",
    desc: "Step out of BIA arrivals and straight into your waiting car—available 24 hours a day.",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "03",
    title: "With-Driver (Chauffeur) Tours",
    desc: "Friendly, English-speaking local drivers who know every route from Sigiriya to Mirissa.",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "04",
    title: "Doorstep Home & Hotel Delivery",
    desc: "We deliver your vehicle directly to your home in Colombo, Kandy, or Galle within 30 minutes.",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "05",
    title: "Long-Term & Corporate Plans",
    desc: "Discounted weekly and monthly packages with full servicing and replacement vehicle backup.",
    image:
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1400&q=85",
  },
  {
    num: "06",
    title: "24/7 Island-Wide Roadside Help",
    desc: "Complete peace of mind with full insurance and round-the-clock support anywhere in Sri Lanka.",
    image:
      "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1400&q=85",
  },
];

const PROCESS_STEPS = [
  {
    step: "Step 01",
    title: "Pick Your Car",
    desc: "Choose from fuel-saving Wagon R hybrids, family sedans, SUVs, or KDH vans.",
  },
  {
    step: "Step 02",
    title: "Choose Dates",
    desc: "Select self-drive or with-driver, plus your pickup location in Colombo, BIA, or outstation.",
  },
  {
    step: "Step 03",
    title: "Quick Verification",
    desc: "Simple NIC / Passport and driving license check—no complicated paperwork or delays.",
  },
  {
    step: "Step 04",
    title: "Fast Handover",
    desc: "Pick up from our branch or have the vehicle delivered clean and fueled to your doorstep.",
  },
  {
    step: "Step 05",
    title: "Hit the Road",
    desc: "Enjoy Sri Lanka with 24/7 roadside support and easy drop-off when your trip is done.",
  },
];

const GAUGE_TICKS = Array.from({ length: 30 }, (_, i) => {
  const startAngle = 135;
  const endAngle = 405;
  const angleDeg = startAngle + (i / 29) * (endAngle - startAngle);
  const rad = (angleDeg * Math.PI) / 180;
  const x1 = 100 + Math.cos(rad) * 78;
  const y1 = 100 + Math.sin(rad) * 78;
  const x2 = 100 + Math.cos(rad) * 94;
  const y2 = 100 + Math.sin(rad) * 94;
  return { x1, y1, x2, y2 };
});

function AnimatedStat({
  target,
  suffix,
  label,
}: {
  target: number;
  suffix: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const duration = 1400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return (
    <div
      ref={ref}
      className="py-8 border-t border-white/15 flex flex-col justify-between"
    >
      <dt className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3">
        {label}
      </dt>
      <dd className="font-display font-black text-5xl sm:text-7xl tracking-tight text-white tabular-nums">
        {count}
        <span className="text-[#FF5500]">{suffix}</span>
      </dd>
    </div>
  );
}

function TiltVaultTile({
  image,
  title,
  tag,
  colSpan,
  aspect,
}: {
  image: string;
  title: string;
  tag: string;
  colSpan: string;
  aspect: string;
}) {
  const tileRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tileRef.current) return;
    const rect = tileRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 12, ry: x * 12 });
  };

  const handleLeave = () => setTilt({ rx: 0, ry: 0 });

  return (
    <motion.div
      ref={tileRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: "transform 0.18s ease-out",
      }}
      data-cursor="VIEW"
      className={`${colSpan} ${aspect} group relative overflow-hidden bg-[#0D0D0D] border border-white/10 cursor-pointer`}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover scale-105 group-hover:scale-115 transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500] block mb-1">
            {tag}
          </span>
          <h4 className="font-display font-bold text-xl sm:text-2xl text-white">
            {title}
          </h4>
        </div>
        <span className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center text-white group-hover:bg-[#FF5500] group-hover:border-[#FF5500] group-hover:text-black transition-all">
          ↗
        </span>
      </div>
    </motion.div>
  );
}

export default function ScrollytellingSection({
  onOpenBooking,
}: {
  onOpenBooking: () => void;
}) {
  // 1. Scroll-Linked Mosaic Carousel Track
  const aboutRef = useRef<HTMLElement>(null);
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"],
  });
  const carouselX = useSpring(
    useTransform(aboutScroll, [0, 1], ["6%", "-28%"]),
    { stiffness: 80, damping: 24 }
  );

  // 2. Pinned 6-Disciplines Scroll Stage
  const disciplinesRef = useRef<HTMLDivElement>(null);
  const [activeDiscipline, setActiveDiscipline] = useState(0);
  const { scrollYProgress: dsScroll } = useScroll({
    target: disciplinesRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(dsScroll, "change", (v) => {
    const idx = Math.min(
      DISCIPLINES.length - 1,
      Math.max(0, Math.floor(v * DISCIPLINES.length))
    );
    setActiveDiscipline(idx);
  });

  // 3. Pinned 5-Step Radial Gauge Process Stage
  const processRef = useRef<HTMLDivElement>(null);
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const [litTicks, setLitTicks] = useState(6);
  const { scrollYProgress: procScroll } = useScroll({
    target: processRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(procScroll, "change", (v) => {
    const stepIdx = Math.min(
      PROCESS_STEPS.length - 1,
      Math.max(0, Math.floor(v * PROCESS_STEPS.length))
    );
    setActiveProcessStep(stepIdx);
    setLitTicks(Math.max(3, Math.round(v * 30)));
  });

  return (
    <div className="bg-[#050505] text-white">
      {/* ===================================================================
          SECTION 1: (WHO WE ARE) — ROLLING HEADINGS + CURVED MOSAIC + STATS
      =================================================================== */}
      <section
        id="about"
        ref={aboutRef}
        className="relative py-32 sm:py-44 overflow-hidden border-t border-white/10"
      >
        <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
          <header className="max-w-4xl mx-auto text-center mb-20">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-5">
              <ScrambleText text="(Who we are)" />
            </p>
            <div className="flex justify-center mb-6">
              <RollingHeading
                text="Simple, reliable car rental for every road in Sri Lanka."
                highlightWords={["every", "road", "Sri", "Lanka."]}
                className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.03] justify-center"
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-neutral-400 text-lg sm:text-xl font-light max-w-2xl mx-auto leading-relaxed"
            >
              Whether you need a fuel-efficient hybrid for Colombo city runs, an
              SUV for Kandy &amp; Ella hill climbs, or a spacious KDH van for a
              family trip down south, Flexi Rental has the right vehicle ready
              for you.
            </motion.p>
          </header>
        </div>

        {/* Scroll-Driven Mosaic Staggered Image Carousel */}
        <div className="relative w-full overflow-hidden py-8 mb-24 select-none">
          <motion.div
            style={{ x: carouselX }}
            className="flex items-center gap-6 px-6 w-max"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((panelIdx) => {
              const isDouble = panelIdx % 2 === 0;
              const img1 = MOSAIC_IMAGES[panelIdx % MOSAIC_IMAGES.length];
              const img2 =
                MOSAIC_IMAGES[(panelIdx + 3) % MOSAIC_IMAGES.length];

              return (
                <div
                  key={panelIdx}
                  className="flex flex-col gap-6 shrink-0 w-[230px] sm:w-[290px]"
                >
                  {isDouble ? (
                    <>
                      <div className="relative h-[180px] sm:h-[220px] overflow-hidden bg-[#111] border border-white/10 group">
                        <img
                          src={img1}
                          alt=""
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                        />
                      </div>
                      <div className="relative h-[180px] sm:h-[220px] overflow-hidden bg-[#111] border border-white/10 group">
                        <img
                          src={img2}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-700 scale-105 group-hover:scale-110"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="relative h-[384px] sm:h-[464px] overflow-hidden bg-[#111] border border-[#FF5500]/40 group">
                      <img
                        src={img1}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 scale-105 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500]">
                        SRI LANKA // 0{panelIdx + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Two-Column Editorial + Spinning Circular SVG Badge + 4 Count-Up Stats */}
        <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
            <div className="lg:col-span-6 space-y-6">
              <p className="font-display text-2xl sm:text-4xl text-white leading-[1.25] font-bold">
                Every vehicle in our fleet is serviced, sanitized, and inspected
                before every handover—so you can drive anywhere on the island
                with zero stress.
              </p>
              <div className="h-[2px] w-24 bg-[#FF5500]" />
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <p className="text-neutral-400 text-base leading-relaxed max-w-md">
                Honest Sri Lankan Rupee rates. No hidden charges. Self-drive or
                with an experienced local driver. Our goal? Making every trip{" "}
                <span className="text-[#FF5500] font-medium">
                  smooth, affordable, and memorable.
                </span>
              </p>

              {/* Spinning Circular SVG Badge */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  viewBox="0 0 100 100"
                  className="w-full h-full text-white"
                >
                  <defs>
                    <path
                      id="flexi-badge-circle"
                      d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
                    />
                  </defs>
                  <text
                    className="font-mono uppercase fill-white"
                    fontSize="8.8"
                    letterSpacing="2.1"
                  >
                    <textPath href="#flexi-badge-circle">
                      ISLAND-WIDE RENTAL ✦ FLEXI SRI LANKA ✦{" "}
                    </textPath>
                  </text>
                </motion.svg>
                <FourPointStar className="w-6 h-6 text-[#FF5500] absolute" />
              </div>
            </div>
          </div>

          {/* 4 Animated Count-Up Stats */}
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedStat target={150} suffix="+" label="Vehicles in Fleet" />
            <AnimatedStat target={15} suffix="k+" label="Happy Customers" />
            <AnimatedStat target={24} suffix="/7" label="Roadside Support" />
            <AnimatedStat target={6} suffix="+" label="Island-Wide Hubs" />
          </dl>
        </div>
      </section>

      {/* ===================================================================
          SECTION 2: (WHAT WE DO) — PINNED 6 SERVICES SCROLL STAGE
      =================================================================== */}
      <section
        id="disciplines"
        ref={disciplinesRef}
        className="relative h-[320vh] border-t border-white/10 bg-[#050505]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-20">
          <div className="max-w-[1360px] w-full mx-auto px-6 sm:px-12">
            <header className="mb-12">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3">
                <ScrambleText text="(What we offer)" />
              </p>
              <RollingHeading
                text="Six services, one trusted team."
                highlightWords={["trusted", "team."]}
                className="font-display font-black text-4xl sm:text-6xl tracking-tight"
              />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left 7 Columns: 6 Interactive / Scroll-Driven Steps */}
              <div className="lg:col-span-7 divide-y divide-white/10">
                {DISCIPLINES.map((item, idx) => {
                  const isActive = activeDiscipline === idx;
                  return (
                    <div
                      key={item.num}
                      onMouseEnter={() => setActiveDiscipline(idx)}
                      className={`py-4 sm:py-5 transition-all duration-300 cursor-pointer flex items-baseline gap-6 ${
                        isActive ? "opacity-100 pl-3" : "opacity-35 hover:opacity-70"
                      }`}
                    >
                      <span
                        className={`font-mono text-xs sm:text-sm font-bold ${
                          isActive ? "text-[#FF5500]" : "text-neutral-500"
                        }`}
                      >
                        {item.num}
                      </span>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                        <h3
                          className={`font-display font-bold text-xl sm:text-3xl tracking-tight transition-colors ${
                            isActive ? "text-[#FF5500]" : "text-white"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-400 max-w-sm">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right 5 Columns: Morphing Clipped Media Reveal */}
              <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
                <div className="relative w-full aspect-[4/5] max-h-[480px] overflow-hidden bg-[#0D0D0D] border border-white/15">
                  {DISCIPLINES.map((item, idx) => {
                    const isActive = activeDiscipline === idx;
                    return (
                      <motion.div
                        key={item.num}
                        initial={false}
                        animate={{
                          clipPath: isActive
                            ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                            : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
                          scale: isActive ? 1 : 1.12,
                        }}
                        transition={{
                          duration: 0.65,
                          ease: [0.76, 0, 0.24, 1],
                        }}
                        className="absolute inset-0"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <span className="font-mono text-xs text-[#FF5500] block mb-1">
                            SERVICE // {item.num}
                          </span>
                          <div className="font-display font-bold text-2xl text-white">
                            {item.title}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 3: (HOW IT WORKS) — 30-TICK RADIAL GAUGE
      =================================================================== */}
      <section
        id="process"
        ref={processRef}
        className="relative h-[260vh] border-t border-white/10 bg-[#070707]"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center py-20">
          <div className="max-w-[1360px] w-full mx-auto px-6 sm:px-12">
            <header className="mb-14">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3">
                <ScrambleText text="(How a rental works)" />
              </p>
              <RollingHeading
                text="From booking to the open road."
                highlightWords={["open", "road."]}
                className="font-display font-black text-4xl sm:text-6xl tracking-tight mb-4"
              />
              <p className="text-neutral-400 text-base sm:text-lg font-light max-w-xl">
                Five simple steps, zero hassle. Book online in minutes and pick
                up your vehicle at the airport, our branch, or your doorstep.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left 5 Columns: 30-Tick SVG Radial Gauge */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {GAUGE_TICKS.map((t, i) => {
                      const isLit = i < litTicks;
                      return (
                        <line
                          key={i}
                          x1={t.x1}
                          y1={t.y1}
                          x2={t.x2}
                          y2={t.y2}
                          stroke={isLit ? "#FF5500" : "rgba(255,255,255,0.16)"}
                          strokeWidth={isLit ? "3.2" : "2"}
                          strokeLinecap="round"
                          className="transition-colors duration-200"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#FF5500] mb-1">
                      STEP
                    </span>
                    <span className="font-display font-black text-6xl sm:text-7xl text-white tabular-nums">
                      0{activeProcessStep + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 7 Columns: 5 Steps List */}
              <ol className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {PROCESS_STEPS.map((s, idx) => {
                  const isActive = activeProcessStep === idx;
                  return (
                    <li
                      key={s.step}
                      onMouseEnter={() => {
                        setActiveProcessStep(idx);
                        setLitTicks((idx + 1) * 6);
                      }}
                      className={`p-6 border transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "bg-[#111111] border-[#FF5500] shadow-[0_0_35px_rgba(255,85,0,0.18)]"
                          : "bg-[#0A0A0A] border-white/10 opacity-50 hover:opacity-85"
                      }`}
                    >
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FF5500] block mb-2">
                        {s.step}
                      </span>
                      <h3 className="font-display font-bold text-2xl text-white mb-2">
                        {s.title}
                      </h3>
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        {s.desc}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          SECTION 4: (THE GALLERY) — 3D MOUSE-TILT ASYMMETRICAL COLLAGE
      =================================================================== */}
      <section
        id="vault"
        className="relative py-32 sm:py-44 border-t border-white/10 bg-[#050505]"
      >
        <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3">
                <ScrambleText text="(Explore Sri Lanka)" />
              </p>
              <RollingHeading
                text="Built for island road trips."
                highlightWords={["island", "road", "trips."]}
                className="font-display font-black text-4xl sm:text-6xl tracking-tight mb-4"
              />
              <p className="text-neutral-400 text-base sm:text-lg font-light max-w-xl">
                From Colombo city streets and the Southern Expressway to misty
                mornings in Nuwara Eliya and Ella.
              </p>
            </div>

            <button
              onClick={onOpenBooking}
              className="self-start lg:self-end px-7 py-3.5 border border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500] hover:text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all"
            >
              <RollText>[ Book Your Ride ]</RollText>
            </button>
          </div>

          {/* 12-Column Asymmetrical 3D-Tilt Collage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <TiltVaultTile
              colSpan="lg:col-span-7"
              aspect="aspect-[4/3]"
              image="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=85"
              tag="COLOMBO CITY // DAILY HYBRID"
              title="Suzuki Wagon R — Effortless City Driving"
            />
            <TiltVaultTile
              colSpan="lg:col-span-5"
              aspect="aspect-[3/4]"
              image="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85"
              tag="ELLA & NUWARA ELIYA // HILL COUNTRY"
              title="Toyota Raize Turbo — Highland Ready"
            />
            <TiltVaultTile
              colSpan="lg:col-span-4"
              aspect="aspect-square"
              image="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85"
              tag="FAMILY & GROUP TOURS // 9 SEATS"
              title="Toyota KDH High-Roof Van"
            />
            <TiltVaultTile
              colSpan="lg:col-span-8"
              aspect="aspect-[2/1]"
              image="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=85"
              tag="KATUNAYAKE BIA // 24/7 AIRPORT PICKUP"
              title="Toyota Axio Hybrid — Ready at Arrivals"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

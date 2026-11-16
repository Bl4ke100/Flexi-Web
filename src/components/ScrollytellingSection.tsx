"use client";

import OptimizedImage from "@/components/OptimizedImage";
import { createGaugeTicks } from "@/lib/gauge";
import React, { useRef, useState, useEffect } from "react";
import WhatsAppLink from "./WhatsAppLink";
import { useSiteContent } from "./SiteContentProvider";
import { DEFAULT_ABOUT_IMAGES } from "@/data/aboutImages";
import { PINNED_SCROLL_QUERY, useMediaQuery } from "@/lib/use-media-query";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValueEvent,
  useMotionValue,
} from "framer-motion";
import {
  ScrambleText,
  RollingHeading,
  FourPointStar,
  RollText,
} from "./AnimatedText";

const SHOW_EXPLORE_SRI_LANKA = false;

const DISCIPLINES = [
  {
    "num": "01",
    "title": "Rental Cars & Hybrids",
    "desc": "Choose from Toyota, Honda, Suzuki, and Nissan models. Ask our team for availability and a quote.",
    "image": "/services/rental-cars.webp"
  },
  {
    "num": "02",
    "title": "Airport Pickup & Return",
    "desc": "Arrange your vehicle handover at the airport for arrival and departure.",
    "image": "/services/airport-handover.webp"
  },
  {
    "num": "03",
    "title": "Luxury Wedding Cars",
    "desc": "Make your special day memorable. Ask about the available cars and wedding packages.",
    "image": "/services/wedding-cars.webp"
  },
  {
    "num": "04",
    "title": "Rent a Car Insurance",
    "desc": "Ask about rental insurance, including the coverage and conditions for your chosen vehicle.",
    "image": "/services/rental-insurance.webp"
  },
  {
    "num": "05",
    "title": "Short- & Long-Term Rentals",
    "desc": "Arrange a rental for a quick visit or a longer stay in Sri Lanka.",
    "image": "/services/flexible-rentals.webp"
  },
  {
    "num": "06",
    "title": "24/7 Customer Support",
    "desc": "Contact our team around the clock before or during your rental.",
    "image": "/services/customer-support.webp"
  }
];

const PROCESS_STEPS = [
  {
    step: "Step 01",
    title: "Pick Your Car",
    desc: "Explore our Wagon R, Toyota sedans and hybrids, Honda crossovers, and Nissan NV200.",
  },
  {
    step: "Step 02",
    title: "Message Us on WhatsApp",
    desc: "Send your dates, preferred vehicle, pickup and return locations, and any special requests to our team.",
  },
  {
    step: "Step 03",
    title: "Confirm with Our Team",
    desc: "We check availability, share your final quote, and confirm the rental terms and required documents on WhatsApp.",
  },
  {
    step: "Step 04",
    title: "Fast Handover",
    desc: "Meet our team at the airport or your agreed delivery point for your clean, inspected vehicle.",
  },
  {
    step: "Step 05",
    title: "Hit the Road",
    desc: "Enjoy Sri Lanka with 24/7 customer support, then return your vehicle at the airport or agreed location.",
  },
];

const GAUGE_TICKS = createGaugeTicks();

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
  imageFit = "contain",
}: {
  image: string;
  title: string;
  tag: string;
  imageFit?: "cover" | "contain";
}) {
  const tileRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tileRef.current) return;
    const rect = tileRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * 12);
    rotateY.set(x * 12);
  };

  const handleLeave = () => { rotateX.set(0); rotateY.set(0); };

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
        transformPerspective: 1000,
        rotateX,
        rotateY,
        transition: "transform 0.18s ease-out",
      }}
      data-cursor="VIEW"
      className="group min-w-0 h-full flex flex-col overflow-hidden bg-[#0D0D0D] border border-white/10"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-black/40">
        <OptimizedImage
          src={image}
          sizes="(min-width: 768px) 50vw, 100vw"
          alt={title}
          loading="lazy"
          className={`absolute inset-0 w-full h-full ${imageFit === "contain" ? "object-contain" : "object-cover"} object-center`}
        />
      </div>
      <div className="flex flex-1 items-center gap-4 border-t border-white/10 p-5 sm:p-6">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500] block mb-1">
            {tag}
          </span>
          <h4 className="font-display font-bold text-xl sm:text-2xl text-white">
            {title}
          </h4>
        </div>
      </div>
    </motion.div>
  );
}

export default function ScrollytellingSection() {
  const { settings, fleet } = useSiteContent();
  const aboutImages = settings.aboutImages ?? DEFAULT_ABOUT_IMAGES;
  const pinned = useMediaQuery(PINNED_SCROLL_QUERY);
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
                text={settings.aboutTitle}
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
              {settings.aboutDescription}
            </motion.p>
          </header>
        </div>

        {/* Scroll-Driven Mosaic Staggered Image Carousel */}
        <div tabIndex={pinned ? undefined : 0} role="region" aria-label="About Flexi Rental photos" className={`relative w-full py-8 mb-16 sm:mb-24 select-none ${pinned ? "overflow-hidden" : "overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-px-6"}`}>
          <motion.div
            style={{ x: pinned ? carouselX : 0 }}
            className="flex items-center gap-6 px-6 w-max"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((panelIdx) => {
              const isDouble = panelIdx % 2 === 0;
              const img1 = aboutImages[panelIdx % aboutImages.length];
              const img2 =
                aboutImages[(panelIdx + 3) % aboutImages.length];

              return (
                <div
                  key={panelIdx}
                  className="flex flex-col gap-6 shrink-0 w-[230px] sm:w-[290px] snap-start"
                >
                  {isDouble ? (
                    <>
                      <div className="relative h-[180px] sm:h-[220px] overflow-hidden bg-[#111] border border-white/10 group">
                        <OptimizedImage
                          src={img1} sizes="290px"
                          alt=""
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                        />
                      </div>
                      <div className="relative h-[180px] sm:h-[220px] overflow-hidden bg-[#111] border border-white/10 group">
                        <OptimizedImage
                          src={img2} sizes="290px"
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-700 scale-105 group-hover:scale-110"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="relative h-[384px] sm:h-[464px] overflow-hidden bg-[#111] border border-[#FF5500]/40 group">
                      <OptimizedImage
                        src={img1} sizes="290px"
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
                Choose a clean, comfortable rental for your stay in Sri Lanka,
                with airport pickup and return and support available 24/7.
              </p>
              <div className="h-[2px] w-24 bg-[#FF5500]" />
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <p className="text-neutral-400 text-base leading-relaxed max-w-md">
                Share your dates and preferred vehicle with our team. We will
                confirm availability, your quote, and rental terms so you can{" "}
                <span className="text-[#FF5500] font-medium">
                  plan your journey with confidence.
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
            <AnimatedStat target={fleet.length} suffix="" label="Vehicles to Explore" />
            <AnimatedStat target={24} suffix="/7" label="Customer Support" />
            <AnimatedStat target={2} suffix="" label="Airport Delivery & Return" />
            <AnimatedStat target={100} suffix="%" label="Cleaned Before Handover" />
          </dl>
        </div>
      </section>

      {/* ===================================================================
          SECTION 2: (WHAT WE DO) — PINNED 6 SERVICES SCROLL STAGE
      =================================================================== */}
      <section
        id="disciplines"
        ref={disciplinesRef}
        style={{ height: pinned ? "320svh" : "auto" }}
        className="relative border-t border-white/10 bg-[#050505]"
      >
        <div className={`${pinned ? "pinned-story sticky top-0 h-[100svh] overflow-hidden" : "relative"} w-full flex flex-col justify-center py-20`}>
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

            {!pinned && <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {DISCIPLINES.map(item => <article key={item.num} className="min-w-0 overflow-hidden border border-white/15 bg-[#0D0D0D]">
                <div className="aspect-[4/3] overflow-hidden"><OptimizedImage src={item.image} sizes="50vw" alt={item.title} className="h-full w-full object-cover" /></div>
                <div className="p-3 sm:p-5"><span className="font-mono text-[8px] sm:text-xs text-[#FF5500]">SERVICE // {item.num}</span><h3 className="font-display font-bold text-sm sm:text-2xl leading-tight mt-2 sm:mt-3 mb-2 break-words">{item.title}</h3><p className="text-[11px] sm:text-sm text-neutral-400 leading-relaxed">{item.desc}</p></div>
              </article>)}
            </div>}
            <div className={`${pinned ? "grid" : "hidden"} grid-cols-1 lg:grid-cols-12 gap-12 items-center`}>
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
                        <OptimizedImage
                          src={item.image} sizes="480px"
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
        style={{ height: pinned ? "260svh" : "auto" }}
        className="relative border-t border-white/10 bg-[#070707]"
      >
        <div className={`${pinned ? "pinned-story sticky top-0 h-[100svh] overflow-hidden" : "relative"} w-full flex flex-col justify-center py-20`}>
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
                Choose your vehicle, arrange your booking on WhatsApp, and pick
                up and return at the airport or an agreed handover point.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left 5 Columns: 30-Tick SVG Radial Gauge */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 xl:w-80 xl:h-80 flex items-center justify-center">
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
              <ol className="process-list lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                          : `bg-[#0A0A0A] border-white/10 ${pinned ? "opacity-50 hover:opacity-85" : "opacity-100"}`
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
      {SHOW_EXPLORE_SRI_LANKA && <section
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

            <WhatsAppLink
              className="self-start lg:self-end px-7 py-3.5 border border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500] hover:text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all"
            >
              <RollText>[ Book on WhatsApp ]</RollText>
            </WhatsAppLink>
          </div>

          {/* Matching image frames and aligned captions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <TiltVaultTile
              image="/posts/suzuki-wagon-r.png"
              tag="COMPACT RENTAL OPTIONS"
              title="Suzuki Wagon R — Effortless City Driving"
            />
            <TiltVaultTile
              imageFit="cover"
              image="/posts/vezel-photo.png"
              tag="ELLA & NUWARA ELIYA // HILL COUNTRY"
              title="Honda Vezel"
            />
            <TiltVaultTile
              image="/posts/nissan-nv200.png"
              tag="VAN RENTAL ENQUIRIES"
              title="Nissan NV200"
            />
            <TiltVaultTile
              image="/posts/toyota-axio.png"
              tag="AIRPORT PICKUP & RETURN"
              title="Toyota Axio — Airport Pickup & Return"
            />
          </div>
        </div>
      </section>}
    </div>
  );
}

"use client";

import OptimizedImage from "@/components/OptimizedImage";
import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatDailyRate, Vehicle } from "@/data/fleetData";
import { ScrambleText, RollingHeading, RollText } from "./AnimatedText";
import WhatsAppLink from "./WhatsAppLink";
import { useSiteContent } from "./SiteContentProvider";
import SearchField from "./SearchField";
import { matchesSearch } from "@/lib/search";

interface FleetShowroomProps {
  compareList: Vehicle[];
  onToggleCompare: (vehicle: Vehicle) => void;
}

const CATEGORIES = [
  "All",
  "Compact & City",
  "Sedan",
  "Hybrid Sedan",
  "SUV & Crossover",
  "Van & Group",
] as const;
const PAGE_SIZE = 6;

export default function FleetShowroom({
  compareList,
  onToggleCompare,
}: FleetShowroomProps) {
  const { fleet } = useSiteContent();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredVehicles = useMemo(() => {
    return fleet.filter((car) => {
      return (selectedCategory === "All" || car.category === selectedCategory) && matchesSearch(query, car.brand, car.name, car.category, car.transmission, car.engineOrType, car.seats, ...car.features);
    });
  }, [selectedCategory, fleet, query]);
  const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleVehicles = filteredVehicles.slice(firstIndex, firstIndex + PAGE_SIZE);

  function changePage(nextPage: number) {
    setPage(nextPage);
    resultsRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }

  return (
    <section
      id="fleet-showroom"
      className="relative py-24 sm:py-32 bg-[#050505] border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3">
              <ScrambleText text="(Our fleet)" />
            </p>
            <RollingHeading
              text="Everyday cars for every journey."
              highlightWords={["every", "journey."]}
              className="font-display font-black text-4xl sm:text-6xl tracking-tight"
            />
            <p className="mt-5 max-w-xl text-neutral-400 text-sm sm:text-base leading-relaxed">
              Browse our fleet, then message us on WhatsApp to check your dates.
              Our team will confirm availability, specifications, and your rental quote.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.15em]">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => { setSelectedCategory(category); setPage(1); }}
                  aria-pressed={active}
                  className={`px-3.5 py-2 border transition-all duration-300 ${
                    active
                      ? "bg-[#FF5500] border-[#FF5500] text-black font-bold"
                      : "bg-transparent border-white/15 text-neutral-400 hover:border-white hover:text-white"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div ref={resultsRef} className="scroll-mt-28 flex flex-wrap items-center justify-between gap-4 mb-7">
          <div className="w-full max-w-lg"><SearchField label="Search vehicles" value={query} onChange={value => { setQuery(value); setPage(1); }} placeholder="Search model, brand, transmission, or features" /></div>
          <p role="status" className="text-xs text-neutral-400">{filteredVehicles.length ? `Showing ${firstIndex + 1}\u2013${firstIndex + visibleVehicles.length} of ${filteredVehicles.length} vehicles` : "0 vehicles found"}</p>
        </div>
        {!filteredVehicles.length && <div className="py-12 text-center border border-white/10 text-neutral-400"><p>{fleet.length ? "No vehicles match your search." : "Message our team for current vehicles and rates."}</p>{fleet.length > 0 && <button type="button" className="mt-4 text-sm text-[#FF5500]" onClick={() => { setQuery(""); setSelectedCategory("All"); setPage(1); }}>Clear search and filters</button>}</div>}

        <div
          id="fleet-results"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-9"
        >
            {visibleVehicles.map((car, idx) => {
              const inCompare = compareList.some((c) => c.id === car.id);
              return (
                <motion.article
                  key={car.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (idx % 3) * 0.04 }}
                  className="group min-w-0 flex flex-col justify-between border-b border-white/10 pb-6"
                >
                  <div>
                    {/* Poster Frame */}
                    <div
                      className="relative aspect-square overflow-hidden bg-[#0D0D0D] border border-white/10 mb-5 cursor-pointer"
                    >
                      <OptimizedImage
                        src={car.image}
                        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                        alt={car.name}
                        className={`w-full h-full ${car.imageFit === "contain" ? "object-contain" : "object-cover"} object-center transition-transform duration-1000 ease-out`}
                        loading="lazy"
                      />
                      {car.imageFit !== "contain" && <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />}
                      <WhatsAppLink
                        vehicle={car}
                        aria-label={`Ask about ${car.name} on WhatsApp`}
                        data-cursor="CHAT"
                        className="absolute inset-0"
                      />

                      {/* Top Tag & Compare Button */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                        <span className="sr-only px-3.5 py-1.5 bg-black/75 backdrop-blur-md border border-white/15 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500]">
                          {car.badge}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(car);
                          }}
                          className={`px-3.5 py-1.5 backdrop-blur-md border font-mono text-[10px] uppercase tracking-[0.18em] flex items-center gap-1.5 transition-all ${
                            inCompare
                              ? "bg-[#FF5500] text-black border-[#FF5500] font-bold"
                              : "bg-black/75 text-white border-white/20 hover:border-[#FF5500]"
                          }`}
                        >
                          {inCompare ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Comparing</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Compare</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

                    {/* Title & Rate */}
                    <div className="space-y-3 mb-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#FF5500] mb-1">
                          {car.brand} • {car.category}
                        </div>
                        <h3 className="font-display font-bold text-2xl text-white tracking-tight">
                          {car.name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <div className="font-display font-semibold text-lg text-white tabular-nums">
                          {formatDailyRate(car.pricePerDay, "")}
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">
                          {car.status === "coming-soon" ? "Coming soon" : car.pricePerDay == null ? "Confirm your dates" : "Per day"}
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-400 text-sm font-light leading-relaxed mb-5">
                      {car.tagline}
                    </p>
                  </div>

                  {/* Bracket CTAs */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">
                      {car.status === "coming-soon" ? "Coming soon for rent" : car.category}
                    </span>

                    <WhatsAppLink
                      vehicle={car}
                      aria-label={`${car.status === "coming-soon" ? "Ask about launch of" : "Book"} ${car.name} on WhatsApp`}
                      className="shrink-0 px-4 py-2.5 bg-[#FF5500] hover:bg-white text-black font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors"
                    >
                      <RollText>{car.status === "coming-soon" ? "[ Ask about launch ]" : "[ WhatsApp ]"}</RollText>
                    </WhatsAppLink>
                  </div>
                </motion.article>
              );
            })}
        </div>
        {pageCount > 1 && <nav aria-label="Fleet pagination" className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">Page {currentPage} of {pageCount}</p>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous fleet page" aria-controls="fleet-results" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)} className="flex h-10 items-center gap-2 border border-white/20 px-3 text-xs hover:border-[#FF5500] disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`Go to fleet page ${number}`} aria-current={currentPage === number ? "page" : undefined} aria-controls="fleet-results" onClick={() => changePage(number)} className={`h-10 min-w-10 border px-3 text-xs font-mono transition-colors ${currentPage === number ? "bg-[#FF5500] border-[#FF5500] text-black font-bold" : "border-white/20 text-neutral-300 hover:border-[#FF5500]"}`}>{number}</button>)}
            <button type="button" aria-label="Next fleet page" aria-controls="fleet-results" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)} className="flex h-10 items-center gap-2 border border-white/20 px-3 text-xs hover:border-[#FF5500] disabled:opacity-30 disabled:cursor-not-allowed"><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" /></button>
          </div>
        </nav>}
      </div>
    </section>
  );
}

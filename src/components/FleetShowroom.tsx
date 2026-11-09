"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { FLEET_VEHICLES, Vehicle } from "@/data/fleetData";
import { ScrambleText, RollingHeading, RollText } from "./AnimatedText";

interface FleetShowroomProps {
  compareList: Vehicle[];
  onToggleCompare: (vehicle: Vehicle) => void;
  onSelectForBooking: (vehicle: Vehicle) => void;
}

const CATEGORIES = [
  "All",
  "Compact & City",
  "Hybrid Sedan",
  "SUV & Crossover",
  "Van & Group",
] as const;

export default function FleetShowroom({
  compareList,
  onToggleCompare,
  onSelectForBooking,
}: FleetShowroomProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredVehicles = useMemo(() => {
    return FLEET_VEHICLES.filter((car) => {
      return selectedCategory === "All" || car.category === selectedCategory;
    });
  }, [selectedCategory]);

  return (
    <section
      id="fleet-showroom"
      className="relative py-32 sm:py-44 bg-[#050505] border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3">
              <ScrambleText text="(Our fleet)" />
            </p>
            <RollingHeading
              text="Everyday cars for every journey."
              highlightWords={["every", "journey."]}
              className="font-display font-black text-4xl sm:text-6xl tracking-tight"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.15em]">
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 border transition-all duration-300 ${
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

        {/* Spacious 2-Column Fleet Showcase */}
        <motion.div
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((car, idx) => {
              const inCompare = compareList.some((c) => c.id === car.id);
              return (
                <motion.article
                  layout
                  key={car.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.65, delay: (idx % 2) * 0.1 }}
                  className="group flex flex-col justify-between border-b border-white/10 pb-10"
                >
                  <div>
                    {/* Poster Frame */}
                    <div
                      onClick={() => onSelectForBooking(car)}
                      data-cursor="BOOK"
                      className="relative aspect-[16/10] overflow-hidden bg-[#0D0D0D] border border-white/10 mb-8 cursor-pointer"
                    >
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover object-center scale-100 group-hover:scale-108 transition-transform duration-1000 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                      {/* Top Tag & Compare Button */}
                      <div className="absolute top-5 inset-x-5 flex items-center justify-between">
                        <span className="px-3.5 py-1.5 bg-black/75 backdrop-blur-md border border-white/15 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500]">
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

                      {/* Bottom Spec Strip */}
                      <div className="absolute bottom-5 inset-x-5 flex items-center justify-between font-mono text-xs text-white">
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">
                              FUEL ECONOMY
                            </span>
                            <span className="font-bold text-[#FF5500]">
                              {car.fuelEconomy}
                            </span>
                          </div>
                          <div className="h-6 w-[1px] bg-white/20" />
                          <div>
                            <span className="text-[10px] text-neutral-400 block">
                              CAPACITY
                            </span>
                            <span className="font-bold text-white">
                              {car.seats} Seats
                            </span>
                          </div>
                          <div className="h-6 w-[1px] bg-white/20 hidden sm:block" />
                          <div className="hidden sm:block">
                            <span className="text-[10px] text-neutral-400 block">
                              LUGGAGE
                            </span>
                            <span className="font-bold text-white">
                              {car.luggage}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Title & Rate */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF5500] mb-1">
                          {car.brand} • {car.category}
                        </div>
                        <h3 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
                          {car.name}
                        </h3>
                      </div>

                      <div className="text-right">
                        <div className="font-display font-black text-2xl sm:text-3xl text-white tabular-nums">
                          Rs. {car.pricePerDay.toLocaleString()}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                          Per Day
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-400 text-sm sm:text-base font-light leading-relaxed mb-8">
                      {car.tagline}
                    </p>
                  </div>

                  {/* Bracket CTAs */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      {car.engineOrType} • {car.transmission}
                    </span>

                    <button
                      onClick={() => onSelectForBooking(car)}
                      className="px-6 py-3 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                    >
                      <RollText>[ Book Vehicle ]</RollText>
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

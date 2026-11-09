"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { HUB_LOCATIONS, FLEET_VEHICLES, Vehicle } from "@/data/fleetData";
import { ScrambleText, RollingHeading } from "./AnimatedText";

interface GlobalHubsSectionProps {
  onSelectVehicleForBooking: (vehicle: Vehicle, hubCity: string) => void;
}

export default function GlobalHubsSection({
  onSelectVehicleForBooking,
}: GlobalHubsSectionProps) {
  const [activeHub, setActiveHub] = useState(HUB_LOCATIONS[0]);

  const hubVehicles = FLEET_VEHICLES.filter((car) =>
    car.availableIn.includes(activeHub.city)
  );

  return (
    <section
      id="global-hubs"
      className="relative py-32 sm:py-44 bg-[#050505] border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3">
              <ScrambleText text="(Pickup locations)" />
            </p>
            <RollingHeading
              text="Six branches across Sri Lanka."
              highlightWords={["Sri", "Lanka."]}
              className="font-display font-black text-4xl sm:text-6xl tracking-tight"
            />
          </div>

          <p className="max-w-md text-neutral-400 text-base font-light leading-relaxed">
            Pick up your car at Bandaranaike International Airport (BIA), our
            Colombo branch, or request doorstep delivery in Kandy, Galle,
            Negombo, and Ella.
          </p>
        </div>

        {/* Horizontal Location Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-16 pb-8 border-b border-white/10 font-mono text-xs uppercase tracking-[0.15em]">
          {HUB_LOCATIONS.map((hub) => {
            const isSelected = activeHub.id === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => setActiveHub(hub)}
                className={`px-6 py-3.5 border transition-all duration-300 flex items-center gap-3 ${
                  isSelected
                    ? "bg-[#FF5500] border-[#FF5500] text-black font-bold"
                    : "bg-[#0F0F0F] text-neutral-400 hover:text-white border-white/10"
                }`}
              >
                <span>{hub.city}</span>
                <span
                  className={`text-[10px] ${
                    isSelected ? "text-black/75" : "text-neutral-600"
                  }`}
                >
                  {hub.deliveryMinutes}m
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Branch Overview & Available Cars */}
        <motion.div
          key={activeHub.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          {/* Left 4 Columns: Branch Details */}
          <div className="lg:col-span-4 space-y-6 p-8 sm:p-10 bg-[#0D0D0D] border border-white/10">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF5500]">
              {activeHub.coords}
            </div>
            <h3 className="font-display font-bold text-3xl sm:text-4xl text-white">
              {activeHub.city}
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {activeHub.hubName}
            </p>

            <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Delivery Time
                </div>
                <div className="font-display font-bold text-2xl text-white">
                  {activeHub.deliveryMinutes} min
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Available Now
                </div>
                <div className="font-display font-bold text-2xl text-[#FF5500]">
                  {activeHub.fleetCount} Cars
                </div>
              </div>
            </div>
          </div>

          {/* Right 8 Columns: Vehicle Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {hubVehicles.map((car) => (
              <div
                key={car.id}
                onClick={() => onSelectVehicleForBooking(car, activeHub.city)}
                data-cursor="BOOK"
                className="group cursor-pointer p-6 bg-[#0D0D0D] border border-white/10 hover:border-[#FF5500] transition-all duration-300 flex flex-col justify-between gap-6"
              >
                <div className="aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500] mb-1">
                      {car.brand} • {car.fuelEconomy}
                    </div>
                    <h4 className="font-display font-bold text-xl text-white">
                      {car.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white group-hover:text-[#FF5500] transition-colors">
                    <span>Rs. {car.pricePerDay.toLocaleString()}/d</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

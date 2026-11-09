"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { FLEET_VEHICLES, Vehicle } from "@/data/fleetData";
import { ScrambleText, RollingHeading, RollText } from "./AnimatedText";

interface PricingCalculatorProps {
  onReserveWithConfig: (
    vehicle: Vehicle,
    days: number,
    totalPrice: number,
    addons: string[]
  ) => void;
}

const ADDONS = [
  {
    id: "airport-pickup",
    label: "Katunayake BIA Airport Pickup / Drop-off",
    price: 3500,
    perDay: false,
  },
  {
    id: "with-driver",
    label: "Experienced English-Speaking Driver",
    price: 6500,
    perDay: true,
  },
  {
    id: "full-insurance",
    label: "Zero-Excess Full Insurance Cover",
    price: 1500,
    perDay: true,
  },
  {
    id: "baby-seat",
    label: "Child / Baby Safety Car Seat",
    price: 1500,
    perDay: false,
  },
];

export default function PricingCalculator({
  onReserveWithConfig,
}: PricingCalculatorProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const receiptY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const [selectedCarId, setSelectedCarId] = useState<string>(
    FLEET_VEHICLES[0].id
  );
  const [days, setDays] = useState<number>(4);
  const [mileageTier, setMileageTier] = useState<"standard" | "extra" | "unlimited">(
    "standard"
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    "airport-pickup",
  ]);

  const selectedVehicle = useMemo(
    () =>
      FLEET_VEHICLES.find((c) => c.id === selectedCarId) || FLEET_VEHICLES[0],
    [selectedCarId]
  );

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const pricing = useMemo(() => {
    const baseSubtotal = selectedVehicle.pricePerDay * days;
    let discountRate = 0;
    let discountLabel = "Standard Daily Rate";

    if (days >= 14) {
      discountRate = 0.2;
      discountLabel = "20% Long-Term Discount";
    } else if (days >= 7) {
      discountRate = 0.12;
      discountLabel = "12% Weekly Discount";
    } else if (days >= 3) {
      discountRate = 0.08;
      discountLabel = "8% Multi-Day Discount";
    }

    const discountAmount = Math.round(baseSubtotal * discountRate);
    const mileageCostPerDay =
      mileageTier === "unlimited" ? 3000 : mileageTier === "extra" ? 1500 : 0;
    const mileageTotal = mileageCostPerDay * days;

    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
      const found = ADDONS.find((a) => a.id === addonId);
      if (!found) return sum;
      return sum + (found.perDay ? found.price * days : found.price);
    }, 0);

    const total = baseSubtotal - discountAmount + mileageTotal + addonsTotal;
    const effectiveDaily = Math.round(total / days);

    return {
      baseSubtotal,
      discountRate,
      discountLabel,
      discountAmount,
      mileageTotal,
      addonsTotal,
      total,
      effectiveDaily,
    };
  }, [selectedVehicle, days, mileageTier, selectedAddons]);

  return (
    <section
      id="pricing-lab"
      ref={sectionRef}
      className="relative py-32 sm:py-44 bg-[#080808] border-t border-white/10 overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="max-w-2xl mb-20">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3">
            <ScrambleText text="(Rate calculator)" />
          </p>
          <RollingHeading
            text="Honest Sri Lankan rates."
            highlightWords={["Honest", "rates."]}
            className="font-display font-black text-4xl sm:text-6xl tracking-tight mb-4"
          />
          <p className="text-neutral-400 text-base sm:text-lg font-light leading-relaxed">
            Calculate your exact trip cost in LKR. Save up to 20% automatically
            on weekly and two-week rentals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left 7 Columns */}
          <div className="lg:col-span-7 space-y-12">
            {/* 1. Select Vehicle */}
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5">
                01 — Select Vehicle
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {FLEET_VEHICLES.map((car) => {
                  const active = car.id === selectedCarId;
                  return (
                    <button
                      key={car.id}
                      onClick={() => setSelectedCarId(car.id)}
                      className={`p-5 border text-left transition-all duration-300 flex items-center justify-between ${
                        active
                          ? "bg-[#FF5500] border-[#FF5500] text-black shadow-[0_12px_35px_rgba(255,85,0,0.3)]"
                          : "bg-[#0F0F0F] border-white/10 text-neutral-300 hover:border-white/25"
                      }`}
                    >
                      <div>
                        <div
                          className={`font-mono text-[10px] uppercase tracking-[0.2em] mb-1 ${
                            active ? "text-black/75" : "text-neutral-500"
                          }`}
                        >
                          {car.brand}
                        </div>
                        <div
                          className={`font-display font-bold text-base ${
                            active ? "text-black" : "text-white"
                          }`}
                        >
                          {car.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold text-sm tabular-nums ${
                            active ? "text-black" : "text-white"
                          }`}
                        >
                          Rs. {car.pricePerDay.toLocaleString()}
                        </div>
                        <div
                          className={`text-[10px] ${
                            active ? "text-black/75" : "text-neutral-500"
                          }`}
                        >
                          / day
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Duration Slider */}
            <div className="p-8 bg-[#0F0F0F] border border-white/10">
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                  02 — Rental Duration
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-bold text-3xl sm:text-4xl text-white tabular-nums">
                    {days} {days === 1 ? "Day" : "Days"}
                  </span>
                  {pricing.discountRate > 0 && (
                    <span className="font-mono text-xs font-bold text-[#FF5500]">
                      — {Math.round(pricing.discountRate * 100)}% Off
                    </span>
                  )}
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full h-1.5 appearance-none cursor-pointer bg-white/15 accent-[#FF5500]"
              />
              <div className="flex justify-between font-mono text-[10px] text-neutral-500 mt-4">
                <span>1 Day</span>
                <span>3+ Days (-8%)</span>
                <span>7+ Days (-12%)</span>
                <span>14+ Days (-20%)</span>
                <span>30 Days</span>
              </div>
            </div>

            {/* 3. Daily Mileage Package */}
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5">
                03 — Daily Distance Allowance
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    id: "standard",
                    title: "100 km / day",
                    sub: "Included Standard",
                  },
                  {
                    id: "extra",
                    title: "200 km / day",
                    sub: "+Rs. 1,500 / day",
                  },
                  {
                    id: "unlimited",
                    title: "Unlimited km",
                    sub: "+Rs. 3,000 / day",
                  },
                ].map((tier) => {
                  const active = mileageTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      onClick={() => setMileageTier(tier.id as any)}
                      className={`p-5 border text-left transition-all ${
                        active
                          ? "bg-white text-black border-white"
                          : "bg-[#0F0F0F] border-white/10 text-white hover:border-white/25"
                      }`}
                    >
                      <div className="font-bold text-sm mb-1">{tier.title}</div>
                      <div
                        className={`text-xs ${
                          active ? "text-neutral-700" : "text-neutral-400"
                        }`}
                      >
                        {tier.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Optional Extras */}
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5">
                04 — Optional Add-Ons
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ADDONS.map((addon) => {
                  const active = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-5 border text-left transition-all flex items-center justify-between gap-4 ${
                        active
                          ? "bg-[#141414] border-[#FF5500] text-white"
                          : "bg-[#0F0F0F] border-white/10 text-neutral-400 hover:border-white/25"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-white mb-1">
                          {addon.label}
                        </div>
                        <div className="font-mono text-xs text-[#FF5500]">
                          {addon.perDay
                            ? `+Rs. ${addon.price.toLocaleString()} / day`
                            : `+Rs. ${addon.price.toLocaleString()} flat`}
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? "bg-[#FF5500] text-black"
                            : "border border-white/20"
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Summary Card */}
          <motion.div
            style={{ y: receiptY }}
            className="lg:col-span-5 lg:sticky lg:top-28 p-8 sm:p-10 bg-[#0F0F0F] border border-white/15 shadow-2xl"
          >
            <div className="relative aspect-[16/9] overflow-hidden mb-8 bg-black border border-white/10">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500]">
                    {selectedVehicle.brand}
                  </div>
                  <div className="font-display font-bold text-2xl text-white">
                    {selectedVehicle.name}
                  </div>
                </div>
                <span className="font-mono text-xs text-white/80 tabular-nums">
                  {days} {days === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm pb-8 mb-8 border-b border-white/10">
              <div className="flex justify-between text-neutral-400">
                <span>
                  Vehicle Rate (Rs. {selectedVehicle.pricePerDay.toLocaleString()} ×{" "}
                  {days}d)
                </span>
                <span className="text-white tabular-nums">
                  Rs. {pricing.baseSubtotal.toLocaleString()}
                </span>
              </div>

              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-[#FF5500]">
                  <span>{pricing.discountLabel}</span>
                  <span className="tabular-nums">
                    -Rs. {pricing.discountAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-neutral-400">
                <span>Distance Package</span>
                <span className="text-white tabular-nums">
                  {pricing.mileageTotal === 0
                    ? "Included (100 km/d)"
                    : `+Rs. ${pricing.mileageTotal.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between text-neutral-400">
                <span>Optional Add-Ons</span>
                <span className="text-white tabular-nums">
                  +Rs. {pricing.addonsTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-8">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">
                  Estimated Total
                </div>
                <div className="font-display font-black text-3xl sm:text-4xl text-white tabular-nums">
                  Rs. {pricing.total.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-neutral-500">Avg. Per Day</div>
                <div className="font-mono text-sm font-bold text-[#FF5500] tabular-nums">
                  Rs. {pricing.effectiveDaily.toLocaleString()}/d
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onReserveWithConfig(
                  selectedVehicle,
                  days,
                  pricing.total,
                  selectedAddons
                )
              }
              className="w-full py-4 px-6 bg-[#FF5500] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
            >
              <RollText>[ Book With This Quote ]</RollText>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

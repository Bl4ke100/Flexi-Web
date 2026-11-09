"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, X } from "lucide-react";
import { FLEET_VEHICLES, HUB_LOCATIONS, Vehicle } from "@/data/fleetData";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle: Vehicle | null;
  initialHub?: string;
  initialDays?: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  initialVehicle,
  initialHub = "Colombo",
  initialDays = 3,
}: BookingModalProps) {
  const [selectedCarId, setSelectedCarId] = useState<string>(
    initialVehicle?.id || FLEET_VEHICLES[0].id
  );
  const [hub, setHub] = useState<string>(initialHub);
  const [days, setDays] = useState<number>(initialDays);
  const [driveOption, setDriveOption] = useState<
    "self-drive" | "with-driver" | "airport-pickup"
  >("self-drive");
  const [driverName, setDriverName] = useState("Kasun Perera");
  const [driverPhone, setDriverPhone] = useState("+94 77 123 4567");
  const [confirmedPass, setConfirmedPass] = useState<string | null>(null);

  useEffect(() => {
    if (initialVehicle) setSelectedCarId(initialVehicle.id);
    if (initialHub) setHub(initialHub);
    if (initialDays) setDays(initialDays);
    setConfirmedPass(null);
  }, [initialVehicle, initialHub, initialDays, isOpen]);

  const vehicle =
    FLEET_VEHICLES.find((c) => c.id === selectedCarId) || FLEET_VEHICLES[0];

  const optionFee =
    driveOption === "with-driver"
      ? 6500 * days
      : driveOption === "airport-pickup"
      ? 3500
      : 0;
  const discount =
    days >= 14 ? 0.2 : days >= 7 ? 0.12 : days >= 3 ? 0.08 : 0;
  const baseCost = vehicle.pricePerDay * days;
  const totalCost = Math.round(baseCost * (1 - discount) + optionFee);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = `FX-LK-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedPass(randomCode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0D0D0D] border border-white/15 p-8 sm:p-10 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF5500] mb-1">
                  {confirmedPass ? "Booking Confirmed" : "Flexi Rental Sri Lanka"}
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  {confirmedPass
                    ? "Your Vehicle Is Reserved"
                    : "Book Your Vehicle"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {confirmedPass ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-[#070707] border border-[#FF5500] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-4 py-1.5 bg-[#FF5500] text-black font-mono text-xs font-bold">
                      Ref #{confirmedPass}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                      {hub} Branch
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6 border-y border-white/10">
                    <div>
                      <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF5500] mb-1">
                        {vehicle.brand}
                      </div>
                      <h4 className="font-display font-bold text-3xl text-white">
                        {vehicle.name}
                      </h4>
                      <p className="font-mono text-xs text-neutral-400 mt-1">
                        {days} {days === 1 ? "Day" : "Days"} •{" "}
                        {driveOption.replace("-", " ").toUpperCase()}
                      </p>
                    </div>
                    <div className="p-3 bg-white text-black shrink-0">
                      <QrCode className="w-14 h-14" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Customer</span>
                    <span className="text-white font-medium">{driverName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Estimated Total</span>
                    <span className="text-[#FF5500] font-display font-bold text-2xl tabular-nums">
                      Rs. {totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setConfirmedPass(null)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 font-mono text-xs uppercase tracking-wider text-white"
                  >
                    Modify Booking
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 bg-[#FF5500] text-black font-mono font-bold text-xs uppercase tracking-wider"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      Select Vehicle
                    </label>
                    <select
                      value={selectedCarId}
                      onChange={(e) => setSelectedCarId(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#070707] border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5500]"
                    >
                      {FLEET_VEHICLES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0D0D0D]">
                          {c.brand} {c.name} — Rs. {c.pricePerDay.toLocaleString()}/d
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      Pickup Location
                    </label>
                    <select
                      value={hub}
                      onChange={(e) => setHub(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#070707] border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5500]"
                    >
                      {HUB_LOCATIONS.map((h) => (
                        <option
                          key={h.id}
                          value={h.city}
                          className="bg-[#0D0D0D]"
                        >
                          {h.city} ({h.deliveryMinutes}m pickup/delivery)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      Days
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={days}
                      onChange={(e) =>
                        setDays(Math.max(1, Number(e.target.value)))
                      }
                      className="w-full px-4 py-3.5 bg-[#070707] border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      Rental Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        {
                          id: "self-drive",
                          label: "Self-Drive",
                          fee: "Standard",
                        },
                        {
                          id: "airport-pickup",
                          label: "BIA Airport",
                          fee: "+Rs. 3,500",
                        },
                        {
                          id: "with-driver",
                          label: "With Driver",
                          fee: "+Rs. 6,500/d",
                        },
                      ].map((mode) => (
                        <button
                          type="button"
                          key={mode.id}
                          onClick={() => setDriveOption(mode.id as any)}
                          className={`py-3 px-2 border text-center font-mono text-xs transition-all ${
                            driveOption === mode.id
                              ? "bg-[#FF5500] border-[#FF5500] text-black font-bold"
                              : "bg-[#070707] border-white/10 text-neutral-400"
                          }`}
                        >
                          <div>{mode.label}</div>
                          <div
                            className={`text-[10px] mt-0.5 ${
                              driveOption === mode.id
                                ? "text-black/75"
                                : "text-neutral-500"
                            }`}
                          >
                            {mode.fee}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#070707] border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#070707] border border-white/15 text-sm text-white focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>

                <div className="p-6 bg-[#070707] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-neutral-400 mb-1">
                      Estimated Total ({days} {days === 1 ? "Day" : "Days"})
                    </div>
                    <div className="font-display font-bold text-3xl text-white tabular-nums">
                      Rs. {totalCost.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-[#FF5500]">
                    No Hidden Charges
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#FF5500] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-[0.2em] transition-colors"
                >
                  [ Confirm Booking ]
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

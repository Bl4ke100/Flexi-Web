"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { Vehicle } from "@/data/fleetData";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  onRemoveVehicle: (id: string) => void;
  onSelectForBooking: (vehicle: Vehicle) => void;
}

export default function CompareModal({
  isOpen,
  onClose,
  vehicles,
  onRemoveVehicle,
  onSelectForBooking,
}: CompareModalProps) {
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
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0D0D0D] border border-white/15 p-8 sm:p-10 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF5500] mb-1">
                  Vehicle Comparison
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  Compare Specifications
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-white/5 hover:bg-white/10 text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-neutral-400 mb-6">
                  No vehicles selected for comparison yet.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-[#FF5500] text-black font-mono text-xs font-bold uppercase tracking-wider"
                >
                  Browse Our Cars
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vehicles.map((car) => (
                  <div
                    key={car.id}
                    className="bg-[#070707] border border-white/10 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44">
                        <img
                          src={car.image}
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onRemoveVehicle(car.id)}
                          className="absolute top-3 right-3 p-2 bg-black/75 hover:bg-[#FF5500] hover:text-black text-white border border-white/15 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500]">
                            {car.brand}
                          </div>
                          <h4 className="font-display font-bold text-xl text-white">
                            {car.name}
                          </h4>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/10 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Daily Rate</span>
                            <span className="text-[#FF5500] font-bold tabular-nums">
                              Rs. {car.pricePerDay.toLocaleString()}/d
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Fuel Economy</span>
                            <span className="text-white font-medium">
                              {car.fuelEconomy}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Seats</span>
                            <span className="text-white font-medium">
                              {car.seats} Passengers
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Luggage</span>
                            <span className="text-white">{car.luggage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Engine</span>
                            <span className="text-white">{car.engineOrType}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectForBooking(car);
                        }}
                        className="w-full py-3.5 bg-[#FF5500] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        [ Book {car.name} ]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

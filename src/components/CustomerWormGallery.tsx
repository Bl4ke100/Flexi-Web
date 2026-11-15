"use client";

import OptimizedImage from "@/components/OptimizedImage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useInView,
} from "framer-motion";
import { X, MapPin } from "lucide-react";
import type { CustomerPhoto } from "@/data/fleetData";
import { FourPointStar } from "./AnimatedText";
import { useSiteContent } from "./SiteContentProvider";
import SearchField from "./SearchField";
import { matchesSearch } from "@/lib/search";
import { supportsWebGL2 } from "@/lib/webgl";
import GalleryErrorBoundary from "./GalleryErrorBoundary";

const CustomerGalleryFallback = dynamic(() => import("./CustomerGalleryFallback"), { ssr: false });
const CustomerGalleryScene = dynamic(() => import("./CustomerGalleryScene"), { ssr: false });

export default function CustomerWormGallery() {
  const { gallery: photos } = useSiteContent();
  const sectionRef = useRef<HTMLElement>(null);
  const sceneReady = useInView(sectionRef, { once: true, margin: "1000px 0px" });
  const [renderer, setRenderer] = useState<"checking" | "webgl" | "fallback">("checking");
  const checkedWebGL = useRef(false);
  const showFallback = useCallback(() => setRenderer("fallback"), []);
  useEffect(() => {
    if (!sceneReady || checkedWebGL.current) return;
    checkedWebGL.current = true;
    setRenderer(supportsWebGL2() ? "webgl" : "fallback");
  }, [sceneReady]);
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null);
  const [fullGalleryOpen, setFullGalleryOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredPhotos = photos.filter(photo => matchesSearch(query, photo.customerName, photo.vehicleName, photo.location, photo.tripTag));

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.0002,
  });

  return (
    <section
      id="customer-moments"
      ref={sectionRef}
      className={`relative ${photos.length ? "h-[580vh]" : "min-h-screen"} bg-[#050505] border-t border-white/10 select-none`}
    >
      {/* Sticky Full-Screen Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* ===================================================================
            THIN ORBITAL HAIRLINE ARCS IN BACKGROUND (EXACT LFG STYLE)
        =================================================================== */}
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full z-[1]"
        >
          <path
            d="M 130 115 C 85 80, 380 110, 1255 410"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.1"
          />
          <path
            d="M 205 390 C 65 435, 185 655, 1045 810"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.1"
          />
        </svg>

        {/* ===================================================================
            WEBGL / THREE.JS TRUE 3D BENDING HELICAL FILM TAPE + Z=0 HEADLINE
        =================================================================== */}
        <div
          data-cursor="VIEW"
          className="absolute inset-0 z-10 w-full h-full"
        >
          {sceneReady && (renderer === "webgl"
            ? <GalleryErrorBoundary onUnavailable={showFallback} fallback={<CustomerGalleryFallback photos={photos} progress={smoothScroll} onSelect={setSelectedPhoto} />}>
              <CustomerGalleryScene photos={photos} progress={smoothScroll} onSelect={setSelectedPhoto} onUnavailable={showFallback} />
            </GalleryErrorBoundary>
            : renderer === "fallback" ? <CustomerGalleryFallback photos={photos} progress={smoothScroll} onSelect={setSelectedPhoto} /> : null)}
        </div>

        {/* ===================================================================
            TOP & BOTTOM UI CORNERS
        =================================================================== */}
        <div className="pointer-events-none relative z-30 w-full max-w-[1440px] mx-auto px-6 sm:px-12 pt-24 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] flex items-center gap-2">
            <FourPointStar className="w-3.5 h-3.5 text-[#FF5500]" />
            (Customer Gallery)
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
            {photos.length ? "Scroll until all frames pass ↑" : "Customer journeys"}
          </span>
        </div>

        <div className="relative z-30 w-full max-w-[1440px] mx-auto px-6 sm:px-12 pb-8 sm:pb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <p className="pointer-events-none text-neutral-300 text-sm sm:text-base leading-snug font-light">
            More than just a gallery.
            <br />
            <span className="text-white font-medium">
              Every customer on the road.
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <button
              onClick={() => setFullGalleryOpen(true)}
              className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-white hover:text-[#FF5500] border-b border-white hover:border-[#FF5500] pb-1 transition-colors"
            >
              VIEW FULL GALLERY
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SINGLE PHOTO LIGHTBOX MODAL
      ===================================================================== */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-[#0D0D0D] border border-[#FF5500] overflow-hidden"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/80 border border-white/20 text-white hover:bg-[#FF5500] hover:text-black flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[16/10] w-full bg-black overflow-hidden">
                <OptimizedImage
                  src={selectedPhoto.image} sizes="(min-width: 768px) 768px, 100vw"
                  alt={selectedPhoto.customerName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs uppercase tracking-[0.2em]">
                  <span className="px-3 py-1 bg-[#FF5500] text-black font-bold">
                    {selectedPhoto.tripTag}
                  </span>
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                    {selectedPhoto.location}
                  </span>
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                  {selectedPhoto.customerName} —{" "}
                  <span className="text-[#FF5500]">
                    {selectedPhoto.vehicleName}
                  </span>
                </h3>

                <p className="text-neutral-300 text-base leading-relaxed">
                  {selectedPhoto.quote}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          FULL GALLERY GRID MODAL ("VIEW FULL GALLERY")
      ===================================================================== */}
      <AnimatePresence>
        {fullGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullGalleryOpen(false)}
            className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md overflow-y-auto p-6 sm:p-12"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-7xl mx-auto"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-10 border-b border-white/15">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] block mb-1">
                    (All Customer Handovers)
                  </span>
                  <h3 className="font-display font-black text-3xl sm:text-5xl text-white uppercase">
                    THE DRIVES WE MADE{" "}
                    <span className="text-[#FF5500]">MEMORIES</span>
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setFullGalleryOpen(false)}
                    className="w-11 h-11 border border-white/20 text-white hover:border-[#FF5500] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="max-w-xl mb-8"><SearchField label="Search gallery" value={query} onChange={setQuery} placeholder="Search vehicle, location, or caption" /></div>
              <p role="status" className="text-sm text-neutral-400 mb-6">{filteredPhotos.length} photos found</p>
              {!filteredPhotos.length && <p className="py-10 text-neutral-400">{photos.length ? "No photos match your search." : "Customer moments will appear here when published by our team."}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredPhotos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setFullGalleryOpen(false);
                      setSelectedPhoto(item);
                    }}
                    className="cursor-pointer group relative aspect-[3.8/4.8] overflow-hidden bg-[#0D0D0D] border border-white/15 hover:border-[#FF5500]"
                  >
                    <OptimizedImage
                      src={item.image} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      alt={item.customerName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 inset-x-4">
                      <span className="px-2 py-0.5 bg-[#FF5500] text-black font-mono text-[9px] font-bold uppercase tracking-wider">
                        {item.vehicleName}
                      </span>
                      <h4 className="font-display font-black text-xl text-white mt-2">
                        {item.customerName}
                      </h4>
                      <p className="font-mono text-[10px] text-neutral-400 uppercase">
                        {item.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}

"use client";

import OptimizedImage from "@/components/OptimizedImage";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { activeDeals } from "@/lib/content-schema";
import { useSiteContent } from "./SiteContentProvider";
import { RollingHeading, ScrambleText } from "./AnimatedText";
import WhatsAppLink from "./WhatsAppLink";

export default function DealsSection() {
  const { deals, settings } = useSiteContent();
  const visibleDeals = activeDeals(deals);
  if (!visibleDeals.length) return null;
  return (
    <section id="deals" className="py-24 sm:py-32 bg-[#050505] border-t border-white/10">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3"><ScrambleText text="(Deals & offers)" /></p>
            <RollingHeading text={settings.valueTitle} highlightWords={["deals", "Sri", "Lanka."]} className="font-display font-black text-4xl sm:text-6xl tracking-tight" />
          </div>
          <p className="text-neutral-400 max-w-md leading-relaxed">{settings.valueDescription}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleDeals.map((deal, index) => (
            <motion.article key={deal.id} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: index % 2 * 0.1 }} className="group relative min-h-[450px] sm:min-h-[510px] overflow-hidden border border-white/15 bg-[#0D0D0D] flex items-end">
              <OptimizedImage src={deal.image} sizes="(min-width: 1024px) 50vw, 100vw" alt={deal.imageAlt} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />
              <div className="relative p-7 sm:p-10 w-full">
                <span className="inline-block bg-[#FF5500] text-black px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-6">{deal.badge}</span>
                <h3 className="font-display font-bold text-3xl sm:text-4xl leading-tight mb-4 max-w-md">{deal.title}</h3>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-md mb-7">{deal.description}</p>
                <WhatsAppLink inquiry={deal.inquiry} className="inline-flex items-center gap-4 border-b border-[#FF5500] pb-2 text-[#FF5500] text-xs font-bold font-mono uppercase tracking-wider">{deal.cta}<ArrowUpRight className="w-4 h-4" /></WhatsAppLink>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-6">Ask for availability and the full quote for your dates. Our team confirms every offer on WhatsApp.</p>
      </div>
    </section>
  );
}

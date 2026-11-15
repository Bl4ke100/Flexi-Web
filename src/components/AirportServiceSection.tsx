"use client";

import { motion } from "framer-motion";
import { PlaneLanding, PlaneTakeoff, Headphones, Sparkles } from "lucide-react";
import { ScrambleText, RollingHeading, RollText } from "./AnimatedText";
import { useSiteContent } from "./SiteContentProvider";
import WhatsAppLink from "./WhatsAppLink";

export default function AirportServiceSection() {
  const { settings } = useSiteContent();
  const services = [
    { icon: PlaneLanding, title: "Delivered for your arrival", description: "Share your flight details and preferred vehicle. We arrange the vehicle handover at the airport.", number: "01" },
    { icon: PlaneTakeoff, title: "Return it at the airport", description: "Keep your final day simple. Agree your return time with us and hand the vehicle back at the airport.", number: "02" },
    { icon: Headphones, title: settings.supportTitle, description: settings.supportDescription, number: "03" },
    { icon: Sparkles, title: settings.qualityTitle, description: settings.qualityDescription, number: "04" },
  ];
  return (
    <section id="airport-service" className="relative py-28 sm:py-40 bg-[#050505] border-t border-white/10">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12">
        <div className="grid lg:grid-cols-2 gap-12 mb-16 items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] mb-3"><ScrambleText text="(From arrival to departure)" /></p>
            <RollingHeading text={settings.airportTitle} highlightWords={["delivery.", "returns."]} className="font-display font-black text-4xl sm:text-6xl tracking-tight" />
          </div>
          <p className="text-neutral-400 leading-relaxed max-w-xl">{settings.airportDescription}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon: Icon, title, description, number }, index) => (
            <motion.article key={number} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.06 }} className="bg-[#0D0D0D] border border-white/10 p-7 sm:p-8">
              <div className="flex justify-between items-center mb-10"><Icon className="w-6 h-6 text-[#FF5500]" /><span className="font-mono text-[10px] text-neutral-500">/{number}</span></div>
              <h3 className="font-display font-bold text-xl mb-4">{title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
            </motion.article>
          ))}
        </div>
        <WhatsAppLink hub="Katunayake Airport" inquiry="I'd like to arrange airport delivery and airport return." className="inline-block mt-10 px-7 py-4 bg-[#FF5500] text-black hover:bg-white transition-colors font-mono text-xs font-bold uppercase tracking-[0.18em]"><RollText>[ Arrange Airport Handover ]</RollText></WhatsAppLink>
      </div>
    </section>
  );
}

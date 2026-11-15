"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";

export default function SearchField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (value: string) => void; placeholder: string;
}) {
  const id = useId();
  return <div className="relative w-full">
    <label htmlFor={id} className="sr-only">{label}</label>
    <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
    <input id={id} type="search" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-black/50 border border-white/15 rounded-lg py-3 pl-11 pr-12 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-[#FF5500] [&::-webkit-search-cancel-button]:appearance-none" />
    {value && <button type="button" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-white focus-visible:outline-[#FF5500]"><X className="w-4 h-4" /></button>}
  </div>;
}

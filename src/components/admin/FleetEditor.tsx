"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { formatDailyRate, type Vehicle } from "@/data/fleetData";
import { vehicleSchema } from "@/lib/content-schema";
import { Field, ImageField, TextField, inputClass, primaryClass, secondaryClass } from "./AdminEditors";
import SearchField from "../SearchField";
import { matchesSearch } from "@/lib/search";

const categories: Vehicle["category"][] = ["Compact & City", "Sedan", "Hybrid Sedan", "SUV & Crossover", "Van & Group"];

interface FleetEditorProps {
  fleet: Vehicle[];
  onSave: (fleet: Vehicle[]) => Promise<void>;
}

export default function FleetEditor({ fleet, onSave }: FleetEditorProps) {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ vehicle: Vehicle; isNew: boolean } | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const visibleFleet = fleet.filter(vehicle => (category === "All" || vehicle.category === category) && matchesSearch(query, vehicle.brand, vehicle.name, vehicle.category, vehicle.year, vehicle.transmission, vehicle.engineOrType, ...vehicle.features));

  function addVehicle() {
    const base = fleet[0];
    setEditing({ isNew: true, vehicle: {
      ...base, id: `vehicle-${crypto.randomUUID()}`, name: "", brand: "", image: "", tagline: "",
      badge: "New arrival", features: [], availableIn: [], year: null, pricePerDay: null, deposit: null, seats: null,
      fuelEconomy: "On request", engineOrType: "Confirm with team", transmission: "Confirm with team", luggage: "On request", status: "on-request", heroImage: undefined,
      category: category === "All" ? base.category : category as Vehicle["category"],
    } });
  }

  return <div className="space-y-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-white font-medium">{fleet.length} {fleet.length === 1 ? "vehicle" : "vehicles"}</p><p className="text-sm text-neutral-400 mt-1">Select a card to edit its details, photos, and pricing.</p></div>
      <button ref={addButton} type="button" disabled={fleet.length >= 100} className={primaryClass} onClick={addVehicle}><Plus className="w-4 h-4" />Add vehicle</button>
    </div>
    <div className="flex flex-wrap gap-2" aria-label="Filter vehicles by category">
      {["All", ...categories].map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`px-3.5 py-2 text-xs border transition-colors ${category === item ? "bg-[#FF5500] border-[#FF5500] text-black font-semibold" : "border-white/15 text-neutral-400 hover:border-white/50 hover:text-white"}`}>{item}</button>)}
    </div>
    <SearchField label="Search admin vehicles" value={query} onChange={setQuery} placeholder="Search model, brand, year, or features" />
    <p role="status" className="text-xs text-neutral-400">Showing {visibleFleet.length} of {fleet.length} vehicles</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      {visibleFleet.map(vehicle => <article key={vehicle.id}>
        <button type="button" aria-label={`Edit ${vehicle.brand} ${vehicle.name}`} onClick={() => setEditing({ vehicle, isNew: false })} className="group block w-full h-full text-left border-b border-white/10 pb-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5500]">
          <span className="relative block aspect-[16/10] overflow-hidden bg-black border border-white/10 mb-5">
            <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.name}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <span className="absolute top-4 left-4 max-w-[calc(100%_-_5rem)] px-3 py-1.5 border border-white/15 bg-black/75 text-[#FF5500] font-mono text-[9px] uppercase tracking-wider">{vehicle.badge}</span>
            <span className="absolute top-4 right-4 p-2.5 bg-black/75 border border-white/15 text-white group-hover:border-[#FF5500] group-hover:text-[#FF5500] transition-colors"><Pencil className="w-3.5 h-3.5" /></span>
            <span className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs">
              <span><span className="block text-[9px] text-neutral-400 mb-1">FUEL ECONOMY</span><span className="text-[#FF5500] font-bold">{vehicle.fuelEconomy}</span></span>
              <span><span className="block text-[9px] text-neutral-400 mb-1">CAPACITY</span><span className="font-bold">{vehicle.seats == null ? "On request" : `${vehicle.seats} seats`}</span></span>
              <span><span className="block text-[9px] text-neutral-400 mb-1">LUGGAGE</span><span className="font-bold">{vehicle.luggage}</span></span>
            </span>
          </span>
          <span className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-3">
            <span className="min-w-0"><span className="block font-mono text-[10px] uppercase tracking-wider text-[#FF5500] mb-1.5">{vehicle.brand} · {vehicle.category}</span><span className="block font-display font-bold text-xl sm:text-2xl tracking-tight leading-tight group-hover:text-[#FF5500] transition-colors">{vehicle.name}</span></span>
            <span className="shrink-0 text-left sm:text-right"><span className="block font-display font-bold text-xl tabular-nums">{formatDailyRate(vehicle.pricePerDay, "")}</span><span className="block mt-1 text-[9px] text-neutral-500 font-mono uppercase tracking-wider">{vehicle.pricePerDay == null ? "Quote required" : "Per day"}</span></span>
          </span>
          <span className="block text-sm text-neutral-400 leading-relaxed line-clamp-2 mb-5">{vehicle.tagline}</span>
          <span className="flex items-center justify-between gap-3 text-xs"><span className="text-neutral-500 truncate">{vehicle.status === "coming-soon" ? "Coming soon" : vehicle.transmission}{vehicle.year ? ` · ${vehicle.year}` : ""}</span><span className="shrink-0 inline-flex items-center gap-2 text-[#FF5500] font-semibold">Edit details<ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></span>
        </button>
      </article>)}
    </div>
    {!visibleFleet.length && <div className="py-12 text-center text-sm text-neutral-400"><p>{fleet.length ? "No vehicles match your search and category." : "Add your first vehicle to publish your real fleet."}</p>{fleet.length > 0 && <button type="button" className="mt-3 text-[#FF5500]" onClick={() => { setQuery(""); setCategory("All"); }}>Clear search and filters</button>}</div>}
    {editing && <VehicleDialog key={editing.vehicle.id} vehicle={editing.vehicle} isNew={editing.isNew} canRemove={fleet.length > 1} onDismiss={() => setEditing(null)} fallbackFocus={addButton} onSave={async vehicle => {
      await onSave(editing.isNew ? [...fleet, vehicle] : fleet.map(item => item.id === vehicle.id ? vehicle : item));
      if (category !== "All" && category !== vehicle.category) setCategory(vehicle.category);
      setQuery("");
      setEditing(null);
    }} onRemove={async () => { await onSave(fleet.filter(vehicle => vehicle.id !== editing.vehicle.id)); setEditing(null); }} />}
  </div>;
}

function VehicleDialog({ vehicle, isNew, canRemove, onDismiss, onSave, onRemove, fallbackFocus }: {
  vehicle: Vehicle; isNew: boolean; canRemove: boolean; onDismiss: () => void;
  onSave: (vehicle: Vehicle) => Promise<void>; onRemove: () => Promise<void>;
  fallbackFocus: { current: HTMLButtonElement | null };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [draft, setDraft] = useState<Vehicle>({ ...vehicle, features: [...vehicle.features], availableIn: [...vehicle.availableIn] });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const busy = saving || uploading;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      (opener?.isConnected ? opener : fallbackFocus.current)?.focus({ preventScroll: true });
    };
  }, [fallbackFocus]);

  function update(patch: Partial<Vehicle>) { setDraft(previous => ({ ...previous, ...patch })); setError(""); }
  async function submit() {
    const parsed = vehicleSchema.safeParse({ ...draft, features: draft.features.map(feature => feature.trim()).filter(Boolean) });
    if (!parsed.success) { setError(parsed.error.issues.slice(0, 3).map(issue => `${issue.path.join(".")}: ${issue.message}`).join(" ")); return; }
    setSaving(true); setError("");
    try { await onSave(parsed.data); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to save the vehicle."); }
    finally { setSaving(false); }
  }

  return <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId} aria-modal="true" onCancel={event => { event.preventDefault(); if (!busy) onDismiss(); }} onClick={event => {
    if (event.target !== event.currentTarget || busy) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onDismiss();
  }} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-5xl max-h-[calc(100dvh_-_2rem)] overflow-y-auto bg-[#0D0D0D] text-white border border-white/15 rounded-2xl p-0 shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm">
    <div className="sticky top-0 z-10 flex items-center justify-between gap-5 px-5 sm:px-8 py-5 bg-[#0D0D0D] border-b border-white/10">
      <div><h2 id={titleId} className="font-display font-bold text-2xl">{isNew ? "Add vehicle" : "Edit vehicle"}</h2><p id={descriptionId} className="text-sm text-neutral-400 mt-1">{isNew ? "Add a vehicle to your customer fleet." : `${vehicle.brand} ${vehicle.name}`} · Save to publish your changes.</p></div>
      <button type="button" disabled={busy} onClick={onDismiss} aria-label="Close vehicle editor" className="p-2.5 rounded-lg border border-white/15 text-neutral-400 hover:text-white hover:border-[#FF5500] disabled:opacity-40"><X className="w-5 h-5" /></button>
    </div>
    <form onSubmit={event => { event.preventDefault(); if (!busy) void submit(); }}>
      <fieldset disabled={saving} className="grid lg:grid-cols-[1fr_1.5fr] gap-7 p-5 sm:p-8 min-w-0">
        <ImageField value={draft.image} onChange={image => update({ image })} section="fleet" onBusyChange={setUploading} />
        <div className="grid sm:grid-cols-2 gap-5 min-w-0">
          <TextField label="Vehicle name" value={draft.name} onChange={name => update({ name })} />
          <TextField label="Brand" value={draft.brand} onChange={brand => update({ brand })} />
          <div className="sm:col-span-2"><TextField label="Hero photo URL (optional)" required={false} value={draft.heroImage ?? ""} onChange={heroImage => update({ heroImage: heroImage || undefined })} /></div>
          <Field label="Category"><select className={inputClass} value={draft.category} onChange={event => update({ category: event.target.value as Vehicle["category"] })}>{categories.map(category => <option key={category}>{category}</option>)}</select></Field>
          <TextField label="Year (optional)" type="number" required={false} value={draft.year == null ? "" : String(draft.year)} onChange={value => update({ year: value === "" ? null : Number(value) })} />
          <TextField label="Daily rate (LKR, blank for a quote)" type="number" required={false} value={draft.pricePerDay == null ? "" : String(draft.pricePerDay)} onChange={value => update({ pricePerDay: value === "" ? null : Number(value) })} />
          <TextField label="Deposit (LKR, optional)" type="number" required={false} value={draft.deposit == null ? "" : String(draft.deposit)} onChange={value => update({ deposit: value === "" ? null : Number(value) })} />
          <TextField label="Fuel economy" value={draft.fuelEconomy} onChange={fuelEconomy => update({ fuelEconomy })} />
          <TextField label="Engine or type" value={draft.engineOrType} onChange={engineOrType => update({ engineOrType })} />
          <TextField label="Seats (optional)" type="number" required={false} value={draft.seats == null ? "" : String(draft.seats)} onChange={value => update({ seats: value === "" ? null : Number(value) })} />
          <TextField label="Luggage" value={draft.luggage} onChange={luggage => update({ luggage })} />
          <TextField label="Transmission" value={draft.transmission} onChange={transmission => update({ transmission })} />
          <TextField label="Badge" value={draft.badge} onChange={badge => update({ badge })} />
          <Field label="Availability"><select className={inputClass} value={draft.status ?? "on-request"} onChange={event => update({ status: event.target.value as Vehicle["status"] })}><option value="on-request">Check availability</option><option value="coming-soon">Coming soon</option></select></Field>
          <Field label="Image display"><select className={inputClass} value={draft.imageFit ?? "cover"} onChange={event => update({ imageFit: event.target.value as Vehicle["imageFit"] })}><option value="cover">Photo (fill frame)</option><option value="contain">Poster (show full image)</option></select></Field>
          <div className="sm:col-span-2"><TextField label="Description" multiline value={draft.tagline} onChange={tagline => update({ tagline })} /></div>
          <div className="sm:col-span-2"><TextField label="Features (one per line)" multiline required={false} value={draft.features.join("\n")} onChange={value => update({ features: value.split("\n") })} /></div>
        </div>
      </fieldset>
      <div className="sticky bottom-0 px-5 sm:px-8 py-5 bg-[#0D0D0D] border-t border-white/10 space-y-4">
        {error && <p role="alert" className="text-sm text-red-300 leading-relaxed">{error}</p>}
        {confirmRemove ? <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-neutral-300 max-w-lg">Remove {vehicle.name} from the website? This change publishes immediately.</p><div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className={secondaryClass} onClick={() => setConfirmRemove(false)}>Keep vehicle</button><button type="button" disabled={busy} className={`${secondaryClass} text-red-300`} onClick={async () => { setSaving(true); setError(""); try { await onRemove(); } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to remove the vehicle."); } finally { setSaving(false); } }}>{saving ? "Removing..." : "Confirm removal"}</button></div></div> : <div className="flex flex-wrap items-center justify-between gap-4">
          <div>{!isNew && <button type="button" disabled={busy || !canRemove} title={!canRemove ? "Keep at least one vehicle in your fleet." : undefined} className={`${secondaryClass} text-red-300`} onClick={() => setConfirmRemove(true)}><Trash2 className="w-4 h-4" />Remove vehicle</button>}</div>
          <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className={secondaryClass} onClick={onDismiss}>Cancel</button><button disabled={busy} className={primaryClass}><Save className="w-4 h-4" />{saving ? "Saving..." : uploading ? "Uploading..." : isNew ? "Add vehicle" : "Save vehicle"}</button></div>
        </div>}
      </div>
    </form>
  </dialog>;
}

"use client";

import { useEffect, useState } from "react";
import { adminRequest } from "@/lib/admin-client";
import { ImageField, TextField, primaryClass, secondaryClass } from "./AdminEditors";
import SearchField from "../SearchField";
import { matchesSearch } from "@/lib/search";

interface GalleryRecord {
  id: string; customer_name: string; location: string; vehicle_name: string;
  quote: string; status: "pending" | "approved" | "rejected"; preview_url: string | null;
}
export default function GalleryAdmin() {
  const [photos, setPhotos] = useState<GalleryRecord[]>([]);
  const [filter, setFilter] = useState("pending");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ customerName: "", location: "", vehicleName: "", quote: "", image: "" });
  const visiblePhotos = photos.filter(photo => (filter === "all" || photo.status === filter) && matchesSearch(query, photo.customer_name, photo.vehicle_name, photo.location, photo.quote));
  async function refresh() { setPhotos(await adminRequest<GalleryRecord[]>("/api/admin/gallery")); }
  useEffect(() => { refresh().catch(error => setMessage(error.message)); }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); await refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update gallery."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3 justify-between"><p className="text-sm text-neutral-400 max-w-xl">Only authorized administrators can add photos. Published photos appear in the existing animated gallery. Visitors have view-only access.</p><div className="flex gap-2"><button className={secondaryClass} type="button" disabled={busy} onClick={() => void run(refresh)}>Refresh</button><button className={primaryClass} type="button" onClick={() => setShowAdd(!showAdd)}>Add photo</button></div></div>
    {message && <p role="status" className="p-4 rounded-lg border border-white/15 text-sm">{message}</p>}
    {showAdd && <form className="border border-white/10 p-5 sm:p-7 rounded-xl grid md:grid-cols-2 gap-6" onSubmit={event => { event.preventDefault(); void run(async () => { await adminRequest("/api/admin/gallery", { method: "POST", body: JSON.stringify(draft) }); setShowAdd(false); setDraft({ customerName: "", location: "", vehicleName: "", quote: "", image: "" }); setMessage("Photo published."); }); }}>
      <ImageField section="gallery" value={draft.image} onChange={image => setDraft({ ...draft, image })} />
      <div className="space-y-4"><TextField label="Customer name" value={draft.customerName} onChange={customerName => setDraft({ ...draft, customerName })} /><TextField label="Trip location" value={draft.location} onChange={location => setDraft({ ...draft, location })} /><TextField label="Vehicle" value={draft.vehicleName} onChange={vehicleName => setDraft({ ...draft, vehicleName })} /><TextField label="Customer note" value={draft.quote} onChange={quote => setDraft({ ...draft, quote })} /><label className="flex gap-3 text-xs text-neutral-400 leading-relaxed"><input type="checkbox" required className="accent-[#FF5500]" />I have permission to publish this photo and customer information.</label><button disabled={busy || !draft.image} className={primaryClass}>Publish photo</button></div>
    </form>}
    <div className="flex flex-wrap gap-2">{["pending", "approved", "rejected", "all"].map(status => <button key={status} type="button" className={`${secondaryClass} capitalize ${filter === status ? "border-[#FF5500] text-[#FF5500]" : ""}`} onClick={() => setFilter(status)}>{status}{status !== "all" && ` (${photos.filter(photo => photo.status === status).length})`}</button>)}</div>
    <SearchField label="Search admin gallery" value={query} onChange={setQuery} placeholder="Search name, vehicle, location, or note" />
    <p role="status" className="text-xs text-neutral-400">{visiblePhotos.length} photos found</p>
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{visiblePhotos.map(photo => <article key={photo.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
      {photo.preview_url && <img src={photo.preview_url} alt={`Photo submitted by ${photo.customer_name}`} className="h-52 w-full object-cover" />}
      <div className="p-5 space-y-3"><span className="text-xs uppercase text-[#FF5500] tracking-wider">{photo.status}</span><h3 className="font-semibold">{photo.customer_name}</h3><p className="text-xs text-neutral-400">{photo.location} · {photo.vehicle_name}</p><p className="text-sm text-neutral-300 leading-relaxed">{photo.quote}</p>
        <div className="flex flex-wrap gap-2 pt-3">{(photo.status === "pending" ? ["approve", "reject", "delete"] : ["delete"]).map(action => <button key={action} disabled={busy} type="button" className={`${action === "approve" ? primaryClass : secondaryClass} capitalize`} onClick={() => {
          if (action === "delete" && !window.confirm("Delete this gallery record and its stored photo?")) return;
          void run(async () => { await adminRequest("/api/admin/gallery", { method: "PATCH", body: JSON.stringify({ id: photo.id, action }) }); setMessage("Gallery updated."); });
        }}>{action}</button>)}</div>
      </div>
    </article>)}</div>
    {!visiblePhotos.length && <p className="py-10 text-center text-neutral-500 text-sm">No photos match this view and search.</p>}
  </div>;
}

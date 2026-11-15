"use client";

import { useState, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { Plus, Upload } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { type SiteSettings, type Deal, type Permission, imageExtension } from "@/lib/content-schema";
import { DEFAULT_ABOUT_IMAGES } from "@/data/aboutImages";

export const inputClass = "w-full bg-black/50 border border-white/15 rounded-lg px-3.5 py-3 text-sm text-white outline-none focus:border-[#FF5500] disabled:opacity-40";
export const primaryClass = "inline-flex justify-center items-center gap-2 px-5 py-3 rounded-lg bg-[#FF5500] text-black font-semibold text-sm hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
export const secondaryClass = "inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 text-sm hover:border-[#FF5500] transition-colors disabled:opacity-40";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm text-neutral-400">{label}</span>{children}</label>;
}
export function TextField({ label, value, onChange, multiline = false, type = "text", required = true }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; required?: boolean;
}) {
  return <Field label={label}>{multiline
    ? <textarea required={required} className={inputClass} rows={4} value={value} onChange={event => onChange(event.target.value)} />
    : <input required={required} type={type} className={inputClass} value={value} onChange={event => onChange(event.target.value)} />}</Field>;
}

export function ImageField({ value, onChange, section, onBusyChange }: { value: string; onChange: (url: string) => void; section: Permission; onBusyChange?: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); onBusyChange?.(true); setError("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image under 5 MB.");
      const extension = imageExtension(new Uint8Array(await file.arrayBuffer()));
      if (!extension) throw new Error("Choose a JPG, PNG, or WebP image.");
      const client = getSupabaseBrowser();
      if (!client) throw new Error("Connect Supabase before uploading images.");
      const path = `${section}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage.from("site-media").upload(path, file, {
        contentType: extension === "jpg" ? "image/jpeg" : `image/${extension}`,
      });
      if (uploadError) throw new Error("Upload failed. Check your permissions and storage setup.");
      onChange(client.storage.from("site-media").getPublicUrl(path).data.publicUrl);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Upload failed."); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  return <div className="space-y-3">
    {value && <img src={value} alt="Current image preview" className="h-40 w-full object-cover rounded-lg border border-white/10" />}
    <TextField label="Image URL" value={value} onChange={onChange} />
    <label className={`${secondaryClass} cursor-pointer`}><Upload className="w-4 h-4" />{busy ? "Uploading..." : "Upload image"}<input type="file" disabled={busy} accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => void upload(event.target.files?.[0])} /></label>
    {busy && <p className="text-xs text-neutral-500">Wait for the upload to finish before saving.</p>}
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
  </div>;
}

type TextSetting = Exclude<keyof SiteSettings, "aboutImages">;
const settingLabels: Record<TextSetting, string> = {
  companyName: "Business name", whatsappNumber: "WhatsApp number (country code, digits only)",
  australiaPhone: "Australian contact number", contactEmail: "Contact email", socialName: "Social media display name", tagline: "Brand tagline",
  heroIntro: "Home page introduction", aboutTitle: "About heading", aboutDescription: "About description",
  airportTitle: "Airport section heading", airportDescription: "Airport delivery and return description",
  supportTitle: "Customer support heading", supportDescription: "Customer support description",
  valueTitle: "Deals section heading", valueDescription: "Deals introduction",
  qualityTitle: "Vehicle care heading", qualityDescription: "Vehicle care description",
};
export function SettingsEditor({ settings, onChange, onBusyChange }: { settings: SiteSettings; onChange: Dispatch<SetStateAction<SiteSettings>>; onBusyChange?: (busy: boolean) => void }) {
  const aboutImages = settings.aboutImages ?? DEFAULT_ABOUT_IMAGES;
  return <div className="grid md:grid-cols-2 gap-6">{(Object.keys(settingLabels) as TextSetting[]).map(key =>
    <div key={key} className={key.endsWith("Description") || key === "heroIntro" ? "md:col-span-2" : ""}>
      <TextField label={settingLabels[key]} required={!["australiaPhone", "contactEmail", "socialName", "tagline"].includes(key)} value={settings[key]} multiline={key.endsWith("Description") || key === "heroIntro"} onChange={value => onChange(current => ({ ...current, [key]: value }))} />
    </div>)}
    <section className="md:col-span-2 border-t border-white/10 pt-7 space-y-5" aria-labelledby="about-images-heading">
      <div><h2 id="about-images-heading" className="font-semibold text-xl">Who we are images</h2><p className="mt-2 text-sm text-neutral-400">Replace the eight images used in the About mosaic. Some images appear more than once in the layout. Upload a JPG, PNG, or WebP under 5 MB, or paste an image URL. Save changes to publish.</p></div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {aboutImages.map((image, index) => <fieldset key={index} className="min-w-0 rounded-xl border border-white/10 p-4 space-y-4">
          <legend className="px-2 text-sm text-neutral-300">About image {index + 1}</legend>
          <ImageField value={image} section="settings" onBusyChange={onBusyChange} onChange={url => onChange(current => ({ ...current, aboutImages: (current.aboutImages ?? DEFAULT_ABOUT_IMAGES).map((value, slot) => slot === index ? url : value) }))} />
        </fieldset>)}
      </div>
    </section>
  </div>;
}

function localDateTime(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function DealsEditor({ deals, onChange }: { deals: Deal[]; onChange: (deals: Deal[]) => void }) {
  function update(id: string, patch: Partial<Deal>) { onChange(deals.map(deal => deal.id === id ? { ...deal, ...patch } : deal)); }
  return <div className="space-y-6">
    <p className="text-sm text-neutral-400">Publish offers, upload banner artwork, and schedule when each banner appears. Dates use your device&apos;s timezone. Save to apply your changes.</p>
    {deals.map((deal, index) => <div key={deal.id} className="rounded-xl border border-white/10 p-5 sm:p-7 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3"><h3 className="font-semibold">Banner {index + 1}</h3><div className="flex flex-wrap gap-2">
        <button type="button" disabled={!index} className={secondaryClass} onClick={() => { const reordered = [...deals]; [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]]; onChange(reordered); }}>Move up</button>
        <button type="button" className={`${secondaryClass} text-red-300`} onClick={() => onChange(deals.filter(item => item.id !== deal.id))}>Remove from draft</button>
      </div></div>
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-7"><ImageField value={deal.image} onChange={image => update(deal.id, { image })} section="deals" />
        <div className="grid sm:grid-cols-2 gap-5">
          <TextField label="Title" value={deal.title} onChange={title => update(deal.id, { title })} />
          <TextField label="Badge" value={deal.badge} onChange={badge => update(deal.id, { badge })} />
          <div className="sm:col-span-2"><TextField label="Description" multiline value={deal.description} onChange={description => update(deal.id, { description })} /></div>
          <TextField label="Image description" value={deal.imageAlt} onChange={imageAlt => update(deal.id, { imageAlt })} />
          <TextField label="Button label" value={deal.cta} onChange={cta => update(deal.id, { cta })} />
          <div className="sm:col-span-2"><TextField label="WhatsApp inquiry" value={deal.inquiry} onChange={inquiry => update(deal.id, { inquiry })} /></div>
          <TextField label="Starts (optional)" type="datetime-local" required={false} value={localDateTime(deal.startsAt)} onChange={value => update(deal.id, { startsAt: value ? new Date(value).toISOString() : "" })} />
          <TextField label="Ends (optional)" type="datetime-local" required={false} value={localDateTime(deal.endsAt)} onChange={value => update(deal.id, { endsAt: value ? new Date(value).toISOString() : "" })} />
          <label className="flex gap-3 text-sm items-center"><input className="accent-[#FF5500]" type="checkbox" checked={deal.published} onChange={event => update(deal.id, { published: event.target.checked })} />Published</label>
        </div>
      </div>
    </div>)}
    <button type="button" className={secondaryClass} onClick={() => onChange([...deals, {
      id: `deal-${crypto.randomUUID()}`, title: "New rental offer", description: "Describe the offer and any conditions.",
      badge: "LATEST OFFER", image: "/offer-placeholder.svg", imageAlt: "Rental offer", cta: "Ask about this deal",
      inquiry: "I'd like to know more about this rental offer.", published: false, startsAt: "", endsAt: "",
    }])}><Plus className="w-4 h-4" />Add deal or banner</button>
  </div>;
}

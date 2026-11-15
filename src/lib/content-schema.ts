import { z } from "zod";

const text = (max = 200) => z.string().trim().min(1).max(max);
export const imageUrlSchema = z.string().max(2000).refine(value => {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Use an HTTPS image URL or a local /image path.");

export const settingsSchema = z.object({
  companyName: text(80),
  whatsappNumber: z.string().regex(/^[1-9]\d{7,14}$/, "Use the country code and digits only."),
  australiaPhone: z.string().regex(/^\d{8,15}$/).or(z.literal("")).default(""),
  contactEmail: z.email().or(z.literal("")).default(""),
  socialName: z.string().trim().max(100).default(""),
  tagline: z.string().trim().max(140).default(""),
  heroIntro: text(600),
  aboutTitle: text(180),
  aboutDescription: text(1000),
  aboutImages: z.array(imageUrlSchema).length(8, "Choose an image for each of the eight About image slots.").optional(),
  airportTitle: text(120),
  airportDescription: text(600),
  supportTitle: text(120),
  supportDescription: text(600),
  valueTitle: text(120),
  valueDescription: text(600),
  qualityTitle: text(120),
  qualityDescription: text(600),
}).strict();

export const vehicleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/), name: text(100), brand: text(60),
  year: z.number().int().min(1990).max(2100).nullable(),
  category: z.enum(["Compact & City", "Sedan", "Hybrid Sedan", "SUV & Crossover", "Van & Group"]),
  tagline: text(600), pricePerDay: z.number().int().min(0).max(10000000).nullable(),
  deposit: z.number().int().min(0).max(10000000).nullable(), fuelEconomy: text(50),
  engineOrType: text(100), transmission: text(60), seats: z.number().int().min(1).max(60).nullable(),
  luggage: text(100), image: imageUrlSchema, badge: text(80),
  heroImage: imageUrlSchema.optional(), imageFit: z.enum(["cover", "contain"]).optional(),
  status: z.enum(["on-request", "coming-soon"]).optional(),
  availableIn: z.array(text(80)).max(30), features: z.array(text(160)).max(20),
}).strict();
export const fleetSchema = z.array(vehicleSchema).min(1).max(100).refine(
  fleet => new Set(fleet.map(vehicle => vehicle.id)).size === fleet.length,
  "Each vehicle needs a unique ID.",
);

export const dealSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/), title: text(140), description: text(600),
  badge: text(60), image: imageUrlSchema, imageAlt: text(180), cta: text(60),
  inquiry: text(400), published: z.boolean(),
  startsAt: z.union([z.iso.datetime(), z.literal("")]),
  endsAt: z.union([z.iso.datetime(), z.literal("")]),
}).strict().refine(deal => !deal.startsAt || !deal.endsAt || deal.startsAt < deal.endsAt,
  "The end date must be after the start date.");
export const dealsSchema = z.array(dealSchema).max(30).refine(
  deals => new Set(deals.map(deal => deal.id)).size === deals.length,
  "Each deal needs a unique ID.",
);
export type SiteSettings = z.infer<typeof settingsSchema>;
export type Deal = z.infer<typeof dealSchema>;
export const PERMISSIONS = ["settings", "fleet", "deals", "gallery"] as const;
export type Permission = (typeof PERMISSIONS)[number];
export const permissionSchema = z.array(z.enum(PERMISSIONS)).max(4);
export const createAdminSchema = z.object({
  email: z.email().max(254), password: z.string().min(12).max(128),
  permissions: permissionSchema,
}).strict();
export const updateAdminSchema = z.object({
  id: z.uuid(), permissions: permissionSchema, active: z.boolean(),
}).strict();
export const galleryFieldsSchema = z.object({
  customerName: text(100), location: text(160), vehicleName: text(100),
  quote: text(600), consent: z.literal("true"), website: z.literal(""),
}).strict();

export function activeDeals(deals: Deal[], now = Date.now()) {
  return deals.filter(deal => deal.published &&
    (!deal.startsAt || Date.parse(deal.startsAt) <= now) &&
    (!deal.endsAt || Date.parse(deal.endsAt) > now));
}

export function imageExtension(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)) return "png";
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  return null;
}

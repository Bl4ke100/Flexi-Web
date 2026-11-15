import postContent from "./postContent.json";

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  year: number | null;
  category: "Compact & City" | "Sedan" | "Hybrid Sedan" | "SUV & Crossover" | "Van & Group";
  tagline: string;
  pricePerDay: number | null;
  deposit: number | null;
  fuelEconomy: string;
  engineOrType: string;
  transmission: string;
  seats: number | null;
  luggage: string;
  image: string;
  heroImage?: string;
  imageFit?: "cover" | "contain";
  status?: "on-request" | "coming-soon";
  badge: string;
  availableIn: string[];
  features: string[];
}

export const FLEET_VEHICLES = postContent.fleet as Vehicle[];

export interface CustomerPhoto {
  id: string;
  customerName: string;
  location: string;
  vehicleName: string;
  tripTag: string;
  quote: string;
  image: string;
}

export const CUSTOMER_GALLERY_PHOTOS: CustomerPhoto[] = postContent.gallery;

export function formatDailyRate(value: number | null, suffix = " / day") {
  return value == null ? "Request a quote" : `Rs. ${value.toLocaleString("en-LK")}${suffix}`;
}

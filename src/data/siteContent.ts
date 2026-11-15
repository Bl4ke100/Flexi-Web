import postContent from "./postContent.json";
import { FLEET_VEHICLES, CUSTOMER_GALLERY_PHOTOS, type CustomerPhoto, type Vehicle } from "./fleetData";
import type { Deal, SiteSettings } from "@/lib/content-schema";

export const DEFAULT_SETTINGS: SiteSettings = postContent.settings;
export const DEFAULT_DEALS: Deal[] = postContent.deals;

export interface PublicContent {
  settings: SiteSettings;
  fleet: Vehicle[];
  deals: Deal[];
  gallery: CustomerPhoto[];
  connected: boolean;
}
export const DEFAULT_CONTENT: PublicContent = {
  settings: DEFAULT_SETTINGS, fleet: FLEET_VEHICLES, deals: DEFAULT_DEALS,
  gallery: CUSTOMER_GALLERY_PHOTOS, connected: false,
};

import type { Vehicle } from "@/data/fleetData";

export const WHATSAPP_NUMBER = "94742074851";
export const WHATSAPP_DISPLAY_NUMBER = "+94 74 207 4851";

export interface BookingInquiry {
  vehicle?: Vehicle;
  hub?: string;
  inquiry?: string;
}

export function getWhatsAppBookingUrl({
  vehicle,
  hub,
  inquiry,
}: BookingInquiry = {}, number = WHATSAPP_NUMBER): string {
  const message = [
    "Hi Flexi Rental! I'd like to arrange a rental.",
    vehicle && `Vehicle: ${vehicle.brand} ${vehicle.name}`,
    vehicle?.status === "coming-soon" && "I would like an update on this upcoming vehicle.",
    hub && `Pickup location: ${hub}`,
    inquiry,
    "Please help me with availability, pricing, and the next steps.",
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

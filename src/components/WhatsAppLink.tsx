import type { ComponentProps } from "react";
import { getWhatsAppBookingUrl, type BookingInquiry } from "@/lib/whatsapp";
import { useSiteContent } from "./SiteContentProvider";

type WhatsAppLinkProps = Omit<ComponentProps<"a">, "href"> & BookingInquiry;

export default function WhatsAppLink({
  vehicle,
  hub,
  inquiry,
  children,
  ...props
}: WhatsAppLinkProps) {
  const { settings } = useSiteContent();
  return (
    <a
      {...props}
      href={getWhatsAppBookingUrl({ vehicle, hub, inquiry }, settings.whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

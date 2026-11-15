import { DEFAULT_CONTENT } from "@/data/siteContent";
import { fleetSchema, settingsSchema, dealsSchema } from "@/lib/content-schema";
import { getSupabasePublic } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export async function GET() {
  const client = getSupabasePublic();
  const headers = { "Cache-Control": "no-store" };
  if (!client) return Response.json(DEFAULT_CONTENT, { headers });
  const [content, gallery] = await Promise.all([
    client.from("site_content").select("key,data"),
    client.from("gallery_photos").select("id,customer_name,location,vehicle_name,quote,image_url,trip_tag")
      .eq("status", "approved").order("created_at", { ascending: false }).limit(100),
  ]);
  if (content.error || gallery.error) return Response.json({ error: "Content is temporarily unavailable." }, { status: 503, headers });
  const entries = Object.fromEntries((content.data ?? []).map(row => [row.key, row.data]));
  const settings = settingsSchema.safeParse(entries.settings);
  const fleet = fleetSchema.safeParse(entries.fleet);
  const deals = dealsSchema.safeParse(entries.deals);
  return Response.json({
    settings: settings.success ? settings.data : DEFAULT_CONTENT.settings,
    fleet: fleet.success ? fleet.data : DEFAULT_CONTENT.fleet,
    deals: deals.success ? deals.data : DEFAULT_CONTENT.deals,
    gallery: (gallery.data ?? []).map(photo => ({
      id: photo.id, customerName: photo.customer_name, location: photo.location,
      vehicleName: photo.vehicle_name, quote: photo.quote, image: photo.image_url, tripTag: photo.trip_tag,
    })), connected: true,
  }, { headers });
}

import { z } from "zod";
import { imageUrlSchema } from "@/lib/content-schema";
import { requireAdmin, apiError, ApiError, readJson } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const publishSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(160),
  vehicleName: z.string().trim().min(1).max(100),
  quote: z.string().trim().min(1).max(600), image: imageUrlSchema,
}).strict();
export async function POST(request: Request) {
  try {
    const { service, user } = await requireAdmin(request, "gallery");
    const parsed = publishSchema.safeParse(await readJson(request, 10000));
    if (!parsed.success) throw new ApiError(400, "Please complete all photo details and choose a valid image.");
    const photo = parsed.data;
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-media/gallery/`;
    const storagePath = photo.image.startsWith(prefix) ? photo.image.slice(prefix.length) : null;
    if (storagePath && !/^[a-f0-9-]+\.(jpg|png|webp)$/.test(storagePath)) throw new ApiError(400, "Invalid image path.");
    const { error } = await service.from("gallery_photos").insert({
      customer_name: photo.customerName, location: photo.location,
      vehicle_name: photo.vehicleName, quote: photo.quote, image_url: photo.image,
      storage_path: storagePath, status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString(),
    });
    if (error) throw new ApiError(503, "Unable to publish the photo.");
    return Response.json({ created: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
export async function GET(request: Request) {
  try {
    const { service } = await requireAdmin(request, "gallery");
    const { data, error } = await service.from("gallery_photos").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw new ApiError(503, "Unable to load photos.");
    const photos = await Promise.all((data ?? []).map(async photo => {
      if (photo.image_url || !photo.storage_path || photo.status === "rejected") return { ...photo, preview_url: photo.image_url };
      const { data: signed } = await service.storage.from("gallery-submissions").createSignedUrl(photo.storage_path, 600);
      return { ...photo, preview_url: signed?.signedUrl ?? null };
    }));
    return Response.json(photos, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
const reviewSchema = z.object({ id: z.uuid(), action: z.enum(["approve", "reject", "delete"]) }).strict();
export async function PATCH(request: Request) {
  try {
    const { service, user } = await requireAdmin(request, "gallery");
    const parsed = reviewSchema.safeParse(await readJson(request, 4096));
    if (!parsed.success) throw new ApiError(400, "Invalid photo action.");
    const { id, action } = parsed.data;
    const { data: photo, error } = await service.from("gallery_photos").select("*").eq("id", id).maybeSingle();
    if (error || !photo) throw new ApiError(404, "Photo not found.");
    if (action === "approve") {
      if (photo.status === "approved") return Response.json({ saved: true });
      if (photo.status !== "pending" || !photo.storage_path) throw new ApiError(400, "Only pending photos can be approved.");
      const { data: file, error: downloadError } = await service.storage.from("gallery-submissions").download(photo.storage_path);
      if (downloadError || !file) throw new ApiError(503, "Unable to retrieve the uploaded photo.");
      const publicName = `${id}-${crypto.randomUUID()}.${photo.storage_path.split(".").pop()}`;
      const publicPath = `gallery/${publicName}`;
      const { error: copyError } = await service.storage.from("site-media").upload(publicPath, file, { contentType: file.type });
      if (copyError) throw new ApiError(503, "Unable to publish the photo.");
      const { data: url } = service.storage.from("site-media").getPublicUrl(publicPath);
      const { data: updated, error: updateError } = await service.from("gallery_photos").update({
        status: "approved", image_url: url.publicUrl, storage_path: publicName, reviewed_by: user.id, reviewed_at: new Date().toISOString(),
      }).eq("id", id).eq("status", "pending").select("id").maybeSingle();
      if (updateError || !updated) {
        await service.storage.from("site-media").remove([publicPath]);
        throw new ApiError(updateError ? 503 : 409, "The photo could not be approved. Refresh the gallery and try again.");
      }
      await service.storage.from("gallery-submissions").remove([photo.storage_path]);
    } else {
      if (action === "reject" && photo.status !== "pending") throw new ApiError(400, "Only pending photos can be rejected.");
      const result = action === "delete"
        ? await service.from("gallery_photos").delete().eq("id", id).select("storage_path,status").maybeSingle()
        : await service.from("gallery_photos").update({ status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", id).eq("status", "pending").select("storage_path,status").maybeSingle();
      if (result.error) throw new ApiError(503, "Unable to update the photo.");
      if (!result.data) throw new ApiError(409, "This photo was already reviewed. Refresh the gallery.");
      if (result.data.storage_path) {
        await service.storage.from("gallery-submissions").remove([result.data.storage_path]);
        if (action === "delete" && result.data.status === "approved") await service.storage.from("site-media").remove([`gallery/${result.data.storage_path}`]);
      }
    }
    return Response.json({ saved: true });
  } catch (error) { return apiError(error); }
}

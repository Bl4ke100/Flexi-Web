import { z } from "zod";
import { settingsSchema, fleetSchema, dealsSchema } from "@/lib/content-schema";
import { requireAdmin, apiError, ApiError, readJson } from "@/lib/supabase/server";

const contentSchema = z.discriminatedUnion("key", [
  z.object({ key: z.literal("settings"), data: settingsSchema }).strict(),
  z.object({ key: z.literal("fleet"), data: fleetSchema }).strict(),
  z.object({ key: z.literal("deals"), data: dealsSchema }).strict(),
]);
export async function PUT(request: Request) {
  try {
    const parsed = contentSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid content.");
    const { service, user } = await requireAdmin(request, parsed.data.key);
    const { error } = await service.from("site_content").upsert({
      ...parsed.data, updated_at: new Date().toISOString(), updated_by: user.id,
    });
    if (error) throw new ApiError(503, "Unable to save content. Check the database setup and try again.");
    return Response.json({ saved: true });
  } catch (error) { return apiError(error); }
}

import { createAdminSchema, updateAdminSchema } from "@/lib/content-schema";
import { requireAdmin, apiError, ApiError, readJson } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { service } = await requireAdmin(request, "super_admin");
    const { data, error } = await service.from("admin_accounts").select("id,email,role,permissions,active").order("created_at");
    if (error) throw new ApiError(503, "Unable to load administrators.");
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const { service } = await requireAdmin(request, "super_admin");
    const parsed = createAdminSchema.safeParse(await readJson(request, 4096));
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid administrator details.");
    const { email, password, permissions } = parsed.data;
    const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new ApiError(400, "Unable to create that account. It may already exist or the password may not meet the configured requirements.");
    const { error: insertError } = await service.from("admin_accounts").insert({ id: data.user.id, email, role: "admin", permissions });
    if (insertError) {
      await service.auth.admin.deleteUser(data.user.id);
      throw new ApiError(503, "Account access could not be saved. Please try again.");
    }
    return Response.json({ created: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
export async function PATCH(request: Request) {
  try {
    const { service, user } = await requireAdmin(request, "super_admin");
    const parsed = updateAdminSchema.safeParse(await readJson(request, 4096));
    if (!parsed.success) throw new ApiError(400, "Invalid access settings.");
    if (parsed.data.id === user.id) throw new ApiError(400, "The super admin cannot change their own access here.");
    const { id, permissions, active } = parsed.data;
    const { data, error } = await service.from("admin_accounts").update({ permissions, active })
      .eq("id", id).eq("role", "admin").select("id").maybeSingle();
    if (error || !data) throw new ApiError(400, "That administrator cannot be changed.");
    return Response.json({ saved: true });
  } catch (error) { return apiError(error); }
}

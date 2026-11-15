import { requireAdmin, apiError } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const { account } = await requireAdmin(request);
    return Response.json(account, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}

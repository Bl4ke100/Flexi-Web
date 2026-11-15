import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Permission } from "@/lib/content-schema";

export function getSupabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export function getSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new ApiError(503, "Website management is not connected yet.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function requireAdmin(request: Request, permission?: Permission | "super_admin") {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new ApiError(401, "Please sign in.");
  const publicClient = getSupabasePublic();
  if (!publicClient) throw new ApiError(503, "Website management is not connected yet.");
  // Validate with Auth on every request. Never trust getSession() or request-supplied roles.
  const { data: { user }, error } = await publicClient.auth.getUser(token);
  if (error || !user) throw new ApiError(401, "Your session has expired. Please sign in again.");
  const service = getSupabaseService();
  const { data: account, error: accountError } = await service.from("admin_accounts")
    .select("id,email,role,permissions,active").eq("id", user.id).maybeSingle();
  if (accountError) throw new ApiError(503, "Unable to verify access. Please try again.");
  if (!account?.active) throw new ApiError(403, "This account does not have admin access.");
  if (permission === "super_admin" ? account.role !== "super_admin" :
      permission && account.role !== "super_admin" && !account.permissions.includes(permission)) {
    throw new ApiError(403, "You do not have permission for this action.");
  }
  return { service, user, account };
}

export function apiError(error: unknown) {
  return Response.json({ error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." },
    { status: error instanceof ApiError ? error.status : 500, headers: { "Cache-Control": "no-store" } });
}

export async function readJson(request: Request, maxBytes = 1000000): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError(415, "Expected JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Missing request body.");
  const parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) { await reader.cancel(); throw new ApiError(413, "Request is too large."); }
    parts.push(value);
  }
  try { return JSON.parse(Buffer.concat(parts).toString("utf8")); }
  catch { throw new ApiError(400, "Invalid JSON."); }
}

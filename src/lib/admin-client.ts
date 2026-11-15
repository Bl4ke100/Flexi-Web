import { getSupabaseBrowser } from "./supabase/client";

export async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const client = getSupabaseBrowser();
  const { data } = client ? await client.auth.getSession() : { data: { session: null } };
  if (!data.session) throw new Error("Please sign in again.");
  const response = await fetch(path, {
    ...options, cache: "no-store", credentials: "omit",
    headers: { ...options.headers, Authorization: `Bearer ${data.session.access_token}`, ...(options.body ? { "Content-Type": "application/json" } : {}) },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to complete the action.");
  return result as T;
}
export interface AdminAccount {
  id: string; email: string; role: "admin" | "super_admin";
  permissions: string[]; active: boolean;
}

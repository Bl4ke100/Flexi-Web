import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTypescript } from "./load-typescript.mjs";

const schema = loadTypescript("../src/lib/content-schema.ts");

test("Admin payloads cannot grant super admin role or inject permissions", () => {
  assert.equal(schema.createAdminSchema.safeParse({ email: "admin@example.com", password: "long-password-123", permissions: ["deals"] }).success, true);
  assert.equal(schema.createAdminSchema.safeParse({ email: "admin@example.com", password: "long-password-123", permissions: ["deals"], role: "super_admin" }).success, false);
  assert.equal(schema.permissionSchema.safeParse(["super_admin"]).success, false);
  assert.equal(schema.createAdminSchema.safeParse({ email: "admin@example.com", password: "short", permissions: [] }).success, false);
});

test("Image fields reject executable URLs and uploads reject SVG/HTML", () => {
  for (const value of ["javascript:alert(1)", "data:image/svg+xml,<svg/>", "//example.com/a.png", "http://example.com/a.png"]) assert.equal(schema.imageUrlSchema.safeParse(value).success, false);
  assert.equal(schema.imageUrlSchema.safeParse("https://example.com/photo.jpg").success, true);
  assert.equal(schema.imageExtension(new TextEncoder().encode("<svg><script>bad()</script></svg>")), null);
  assert.equal(schema.imageExtension(new Uint8Array([255, 216, 255, 224])), "jpg");
  assert.equal(schema.imageExtension(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])), "png");
  assert.equal(schema.imageExtension(new TextEncoder().encode("RIFFxxxxWEBP")), "webp");
});

test("Offers respect draft state and both schedule boundaries", () => {
  const offer = { id: "offer", title: "Offer", description: "Details", badge: "Deal", image: "/offer.jpg", imageAlt: "Offer", cta: "Ask us", inquiry: "Offer inquiry", published: true, startsAt: "2026-11-12T00:00:00.000Z", endsAt: "2026-11-13T00:00:00.000Z" };
  assert.equal(schema.activeDeals([offer], Date.parse(offer.startsAt) - 1).length, 0);
  assert.equal(schema.activeDeals([offer], Date.parse(offer.startsAt)).length, 1);
  assert.equal(schema.activeDeals([offer], Date.parse(offer.endsAt)).length, 0);
  assert.equal(schema.activeDeals([{ ...offer, published: false }], Date.parse(offer.startsAt)).length, 0);
  assert.equal(schema.dealSchema.safeParse({ ...offer, endsAt: offer.startsAt }).success, false);
});

test("Server authorization validates Auth, active membership, and exact permissions", async () => {
  let account = { id: "admin-id", email: "admin@example.com", role: "admin", active: true, permissions: ["deals"] };
  const query = { select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: account }; } };
  const server = loadTypescript("../src/lib/supabase/server.ts", {
    "server-only": {}, "@supabase/supabase-js": { createClient: () => ({
      auth: { async getUser(token) { return token === "valid-token" ? { data: { user: { id: "admin-id", user_metadata: { role: "super_admin" } } } } : { data: { user: null }, error: new Error("Invalid") }; } },
      from() { return query; },
    }) },
  }, { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-test", SUPABASE_SECRET_KEY: "server-test" });
  const request = token => new Request("https://example.com/api/admin/content", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  await assert.rejects(server.requireAdmin(request()), error => error.status === 401);
  await assert.rejects(server.requireAdmin(request("forged-token")), error => error.status === 401);
  assert.equal((await server.requireAdmin(request("valid-token"), "deals")).account.id, "admin-id");
  await assert.rejects(server.requireAdmin(request("valid-token"), "fleet"), error => error.status === 403);
  await assert.rejects(server.requireAdmin(request("valid-token"), "super_admin"), error => error.status === 403);
  account = { ...account, active: false };
  await assert.rejects(server.requireAdmin(request("valid-token"), "deals"), error => error.status === 403);
  account = null;
  await assert.rejects(server.requireAdmin(request("valid-token")), error => error.status === 403);
  account = { id: "admin-id", role: "super_admin", active: true, permissions: [] };
  await server.requireAdmin(request("valid-token"), "fleet");
  await server.requireAdmin(request("valid-token"), "super_admin");
});

test("JSON parsing bounds bodies before parsing and returns controlled errors", async () => {
  const server = loadTypescript("../src/lib/supabase/server.ts", { "server-only": {} });
  const json = body => new Request("https://example.com", { method: "POST", headers: { "Content-Type": "application/json" }, body });
  await assert.rejects(server.readJson(json("x".repeat(100)), 20), error => error.status === 413);
  await assert.rejects(server.readJson(json("{not json}")), error => error.status === 400);
  assert.deepEqual(await server.readJson(json('{"ok":true}')), { ok: true });
});

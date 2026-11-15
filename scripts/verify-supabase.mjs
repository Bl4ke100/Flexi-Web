// Reads credentials from .env.local without printing them.
// Default: read-only readiness checks. --write-tests also creates disposable
// QA data, exercises the local app, and removes its test account/photo afterward.
import { createRequire } from "node:module";
import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
const project = "https://jyvqrrgmbwfquergpimv.supabase.co";
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
const app = process.env.FLEXI_VERIFY_URL || "http://127.0.0.1:3001";
const email = "janindumagamage100@gmail.com";
const writeTests = process.argv.includes("--write-tests");
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

function check(condition, label) {
  if (!condition) throw new Error(label);
  console.log(`PASS: ${label}`);
}
async function request(path, { token, method = "GET", body } = {}) {
  const response = await fetch(app + path, {
    method, headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    }, body: body ? body instanceof FormData ? body : JSON.stringify(body) : undefined,
  });
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(`${method} ${path} returned HTTP ${response.status} instead of JSON. Restart the local website and retry.`);
  }
  const data = await response.json();
  return { status: response.status, data };
}

check(process.env.NEXT_PUBLIC_SUPABASE_URL === project, "Project URL matches the intended Supabase project");
check(Boolean(publicKey && !/REPLACE|YOUR[_-]/i.test(publicKey)), "Publishable key is configured");
check(Boolean(secret && !/REPLACE|YOUR[_-]/i.test(secret)), "Server secret is configured");
check(["127.0.0.1", "localhost"].includes(new URL(app).hostname), "Test requests target the local website only");

const service = createClient(project, secret, options);
const anonymous = createClient(project, publicKey, options);
const superClient = createClient(project, publicKey, options);
const limitedClient = createClient(project, publicKey, options);
const runId = randomUUID();
const qaEmail = `flexi-setup-${runId}@example.com`;
const qaName = `Setup verification ${runId}`;
let testAdminId;
let testPhotoId;
const testStoragePaths = new Set();

try {
  const account = await service.from("admin_accounts").select("id,role,active,permissions").eq("email", email).single();
  check(!account.error && account.data?.role === "super_admin" && account.data.active, "Server secret can access the active super-admin record");
  const authUser = await service.auth.admin.getUserById(account.data.id);
  check(!authUser.error && Boolean(authUser.data.user?.email_confirmed_at), "The super-admin Auth login is confirmed");
  const configResponse = await fetch(project + "/auth/v1/settings", { headers: { apikey: publicKey } });
  const config = await configResponse.json();
  check(configResponse.ok && config.disable_signup && config.external?.email, "Email login is enabled and public signups are disabled");

  for (const [id, expectedPublic] of [["site-media", true], ["gallery-submissions", false]]) {
    const bucket = await service.storage.getBucket(id);
    check(!bucket.error && bucket.data?.public === expectedPublic && bucket.data.file_size_limit === 5242880,
      `${id} has the intended visibility and 5 MB upload limit`);
  }
  const privateTable = await anonymous.from("admin_accounts").select("id").limit(1);
  check(Boolean(privateTable.error), "Anonymous clients cannot read administrator records");
  const website = await request("/api/content");
  check(website.status === 200 && website.data.connected && website.data.fleet?.length > 0,
    "The local website loads live Supabase content");
  check((await request("/api/admin/me")).status === 401, "Protected routes reject requests without a login");
  if (!writeTests) {
    console.log("Read-only checks complete. Pass --write-tests to verify disposable admin and upload workflows.");
  } else {
    // Generates an internal one-time verification token. No email is sent, and
    // neither the token nor a session is printed or written to disk.
    const link = await service.auth.admin.generateLink({ type: "magiclink", email });
    check(!link.error && Boolean(link.data?.properties?.hashed_token), "Auth can issue a temporary verification token for the existing super admin");
    const session = await superClient.auth.verifyOtp({ type: "magiclink", token_hash: link.data.properties.hashed_token });
    check(!session.error && Boolean(session.data.session), "A real Supabase session passes authentication");
    const token = session.data.session.access_token;
    const me = await request("/api/admin/me", { token });
    check(me.status === 200 && me.data.role === "super_admin", "The website recognizes the verified super-admin session");
    check((await request("/api/admin/accounts", { token })).status === 200, "The super admin can manage administrators");

    const password = randomBytes(24).toString("base64url") + "aA1!";
    const created = await request("/api/admin/accounts", { token, method: "POST", body: { email: qaEmail, password, permissions: ["deals"] } });
    check(created.status === 201, "The admin panel can create an administrator with selected permissions");
    const qaAccount = await service.from("admin_accounts").select("id").eq("email", qaEmail).single();
    testAdminId = qaAccount.data?.id;
    check(!qaAccount.error && Boolean(testAdminId), "The disposable administrator has a protected database access record");
    const qaSession = await limitedClient.auth.signInWithPassword({ email: qaEmail, password });
    check(!qaSession.error && Boolean(qaSession.data.session), "Email/password login works for the disposable administrator");
    const qaToken = qaSession.data.session.access_token;
    check((await request("/api/admin/me", { token: qaToken })).status === 200, "An active restricted admin can access their account");
    check((await request("/api/admin/accounts", { token: qaToken })).status === 403, "A restricted admin cannot manage administrators");
    check((await request("/api/admin/content", { token: qaToken, method: "PUT", body: { key: "settings", data: website.data.settings } })).status === 403,
      "A deals-only administrator cannot change website settings");
    const permitted = await limitedClient.rpc("has_admin_permission", { required_permission: "deals" });
    check(!permitted.error && permitted.data === true, "The assigned deals permission is enforced by the database");

    const form = new FormData();
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6lO8AAAAASUVORK5CYII=", "base64");
    form.set("photo", new File([png], "setup-test.png", { type: "image/png" }));
    for (const [key, value] of Object.entries({ customerName: qaName, location: "Airport", vehicleName: website.data.fleet[0].name,
      quote: "Disposable setup verification", consent: "true", website: "" })) form.set(key, value);
    const submitted = await request("/api/gallery/submit", { method: "POST", body: form });
    check(submitted.status === 201, "A customer can submit a photo through the website");
    const photos = await request("/api/admin/gallery", { token });
    const pending = photos.data.find(photo => photo.customer_name === qaName);
    testPhotoId = pending?.id;
    if (pending?.storage_path) testStoragePaths.add(pending.storage_path);
    check(pending?.status === "pending" && Boolean(pending.preview_url), "New submissions are private and available for admin review");
    const unpublished = await request("/api/content");
    check(!unpublished.data.gallery.some(photo => photo.id === testPhotoId), "A pending photo is hidden from the public gallery");
    check((await request("/api/admin/gallery", { token: qaToken })).status === 403, "A deals-only administrator cannot review customer photos");
    const approved = await request("/api/admin/gallery", { token, method: "PATCH", body: { id: testPhotoId, action: "approve" } });
    check(approved.status === 200, "A permitted administrator can approve a photo");
    const published = await request("/api/content");
    const publicPhoto = published.data.gallery.find(photo => photo.id === testPhotoId);
    check(Boolean(publicPhoto?.image), "An approved photo appears in the live public gallery");
    check((await fetch(publicPhoto.image)).ok, "The approved image is served from public storage");
    const publishedRecord = await service.from("gallery_photos").select("storage_path").eq("id", testPhotoId).single();
    if (publishedRecord.data?.storage_path) testStoragePaths.add(publishedRecord.data.storage_path);
    const removed = await request("/api/admin/gallery", { token, method: "PATCH", body: { id: testPhotoId, action: "delete" } });
    check(removed.status === 200, "The administrator can delete the disposable test photo");
    const afterDelete = await request("/api/content");
    check(!afterDelete.data.gallery.some(photo => photo.id === testPhotoId), "Deleted photos disappear from the public gallery");

    const disabled = await request("/api/admin/accounts", { token, method: "PATCH", body: { id: testAdminId, permissions: ["deals"], active: false } });
    check(disabled.status === 200, "The super admin can disable an administrator");
    check((await request("/api/admin/me", { token: qaToken })).status === 403,
      "Disabling an admin blocks their existing session on the next protected request");
  }
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : "Connection verification failed"}`);
  process.exitCode = 1;
} finally {
  if (writeTests) {
    try {
      const ownPhoto = await service.from("gallery_photos").select("id,storage_path").eq("customer_name", qaName).maybeSingle();
      if (ownPhoto.error) throw new Error("Unable to check disposable photo cleanup");
      if (ownPhoto.data) {
        if (ownPhoto.data.storage_path) testStoragePaths.add(ownPhoto.data.storage_path);
        const deletion = await service.from("gallery_photos").delete().eq("id", ownPhoto.data.id);
        if (deletion.error) throw new Error("Unable to remove the disposable photo record");
      }
      for (const path of testStoragePaths) {
        const privateRemoval = await service.storage.from("gallery-submissions").remove([path]);
        const publicRemoval = await service.storage.from("site-media").remove([`gallery/${path}`]);
        if (privateRemoval.error || publicRemoval.error) throw new Error("Unable to remove a disposable image");
      }
      const ownAdmin = await service.from("admin_accounts").select("id").eq("email", qaEmail).maybeSingle();
      testAdminId ??= ownAdmin.data?.id;
      if (testAdminId) {
        const removal = await service.auth.admin.deleteUser(testAdminId);
        if (removal.error) throw new Error("Unable to remove the disposable administrator");
      }
      console.log("CLEANUP: Disposable administrator, photo record, and image objects removed.");
    } catch (error) { console.error(`CLEANUP FAILED: ${error.message}`); process.exitCode = 1; }
    await Promise.allSettled([superClient.auth.signOut({ scope: "local" }), limitedClient.auth.signOut({ scope: "local" })]);
  }
}

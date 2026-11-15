// Dry-run by default. --apply uploads the original artwork and publishes the
// reviewed content to the configured project. Credentials stay in .env.local.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import ts from "typescript";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
require("@next/env").loadEnvConfig(root, true, { info() {}, error() {} });
const content = JSON.parse(readFileSync(join(root, "src/data/postContent.json"), "utf8"));
const sources = JSON.parse(readFileSync(join(root, "scripts/post-import-sources.json"), "utf8"));
const javascript = ts.transpileModule(readFileSync(join(root, "src/lib/content-schema.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const schemaModule = { exports: {} };
new Function("require", "module", "exports", javascript)(require, schemaModule, schemaModule.exports);
const { fleetSchema, settingsSchema, dealsSchema } = schemaModule.exports;
settingsSchema.parse(content.settings);
fleetSchema.parse(content.fleet);
dealsSchema.parse(content.deals);
const galleryImages = new Set(content.gallery.map(photo => photo.image));
const files = Object.keys(sources).map(name => {
  const bytes = readFileSync(join(root, "public/posts", name));
  if (bytes.length > 5 * 1024 * 1024) throw new Error(`${name} exceeds the storage image limit`);
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error(`Invalid PNG: ${name}`);
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  const local = `/posts/${name}`;
  const section = galleryImages.has(local) ? "gallery" : content.deals.some(deal => deal.image === local) ? "deals" : "fleet";
  return { name, bytes, local, path: `${section}/post-import/${hash}-${name}` };
});
const expectedUrl = "https://jyvqrrgmbwfquergpimv.supabase.co";
if (process.env.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) throw new Error("Configured project does not match the reviewed Flexi Rental project.");
console.log(`Validated ${content.fleet.length} listings, ${content.deals.length} cards, ${content.gallery.length} gallery posts, and ${files.length} original images.`);
if (!process.argv.includes("--apply")) {
  console.log("Dry run only. Add --apply --backup-dir <absolute-directory> to update Supabase.");
  process.exit(0);
}
const backupArgument = process.argv.indexOf("--backup-dir");
if (backupArgument === -1 || !process.argv[backupArgument + 1]) throw new Error("A backup directory is required before applying changes.");
const backupDir = resolve(process.argv[backupArgument + 1]);
mkdirSync(backupDir, { recursive: true });
const service = createClient(expectedUrl, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const publicClient = createClient(expectedUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
function checked(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}
const oldContent = checked(await service.from("site_content").select("*"), "Read content");
const oldGallery = checked(await service.from("gallery_photos").select("*"), "Read gallery");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
writeFileSync(join(backupDir, `before-post-import-${stamp}.json`), JSON.stringify({ project: expectedUrl, content: oldContent, gallery: oldGallery }, null, 2));
console.log("Saved a backup of the existing content and gallery.");

const urls = new Map();
for (const file of files) {
  const upload = await service.storage.from("site-media").upload(file.path, file.bytes, { contentType: "image/png", cacheControl: "31536000", upsert: false });
  if (upload.error && !["409", "Duplicate"].includes(String(upload.error.statusCode)) && !/already exists|duplicate/i.test(upload.error.message)) {
    throw new Error(`Image upload failed for ${file.name}: ${upload.error.message}`);
  }
  const url = service.storage.from("site-media").getPublicUrl(file.path).data.publicUrl;
  const response = await fetch(url, { method: "HEAD" });
  if (!response.ok || !response.headers.get("content-type")?.includes("image/png")) throw new Error(`Cannot verify published image ${file.name}`);
  urls.set(file.local, url);
}
console.log(`Verified ${urls.size} images in public Supabase storage.`);
const published = JSON.parse(JSON.stringify(content), (_key, value) => urls.get(value) ?? value);
const now = new Date().toISOString();
const rows = ["settings", "fleet", "deals"].map(key => ({ key, data: published[key], updated_at: now }));
// Reject a concurrent admin edit rather than silently replacing it.
const latest = checked(await service.from("site_content").select("*"), "Check content revision");
for (const previous of oldContent) {
  const current = latest.find(row => row.key === previous.key);
  if (JSON.stringify(current) !== JSON.stringify(previous)) throw new Error("Website content changed during import. Review the new content before retrying.");
}
checked(await service.from("site_content").upsert(rows), "Publish content");

// Stable UUIDs make re-running an import update the same gallery entries.
function galleryId(id) {
  const hash = createHash("sha256").update(`flexi-rental-posts:${id}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
const galleryRows = published.gallery.map((photo, index) => {
  const path = new URL(photo.image).pathname.split("/site-media/")[1];
  return {
    id: galleryId(photo.id), customer_name: photo.customerName, location: photo.location,
    vehicle_name: photo.vehicleName, quote: photo.quote, trip_tag: photo.tripTag,
    image_url: photo.image, storage_path: path.replace(/^gallery\//, ""), status: "approved",
    reviewed_at: now, created_at: new Date(Date.now() - index * 1000).toISOString(),
  };
});
checked(await service.from("gallery_photos").upsert(galleryRows), "Publish source gallery posts");
// Only archive exact demo entries documented in migration 002. Keep all other
// customer/admin uploads, and retain the demo rows for recovery.
const seed = readFileSync(join(root, "supabase/migrations/002_restore_existing_gallery.sql"), "utf8");
const demo = oldGallery.filter(photo => photo.status === "approved" && photo.image_url?.startsWith("https://images.unsplash.com/") &&
  seed.includes(`'${photo.image_url}'`) && seed.includes(`'${photo.trip_tag}'`) && seed.includes(`'${photo.customer_name}'`));
for (const photo of demo) checked(await service.from("gallery_photos").update({ status: "rejected", reviewed_at: now })
  .eq("id", photo.id).eq("image_url", photo.image_url).eq("status", "approved"), "Archive demo entry");

const actual = checked(await publicClient.from("site_content").select("key,data"), "Verify anonymous content access");
const saved = Object.fromEntries(actual.map(row => [row.key, row.data]));
fleetSchema.parse(saved.fleet); settingsSchema.parse(saved.settings); dealsSchema.parse(saved.deals);
for (const key of ["settings", "fleet", "deals"]) {
  // PostgreSQL JSONB may reorder object keys.
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object"
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  if (JSON.stringify(canonical(saved[key])) !== JSON.stringify(canonical(published[key]))) throw new Error(`Stored ${key} does not match the import`);
}
const publicGallery = checked(await publicClient.from("gallery_photos").select("id,image_url"), "Verify public gallery");
if (!galleryRows.every(row => publicGallery.some(photo => photo.id === row.id && photo.image_url === row.image_url))) throw new Error("Gallery publication could not be verified");
if (demo.some(row => publicGallery.some(photo => photo.id === row.id))) throw new Error("A demo entry is still public");
console.log(`Published and verified ${saved.fleet.length} fleet listings, ${saved.deals.filter(deal => deal.published).length} service cards, one draft promotion, and ${galleryRows.length} gallery posts. Archived ${demo.length} demo entries.`);

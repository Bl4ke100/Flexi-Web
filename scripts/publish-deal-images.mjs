// Replace only the two generated deal images in Supabase, preserving other content.
// Dry run by default; --apply requires an absolute --backup-dir outside Git.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join, basename, sep, isAbsolute, relative } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { createClient } from "@supabase/supabase-js";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
require("@next/env").loadEnvConfig(root, true, { info() {}, error() {} });
const project = "https://jyvqrrgmbwfquergpimv.supabase.co";
if (process.env.NEXT_PUBLIC_SUPABASE_URL !== project) throw new Error("Unexpected Supabase project.");
const manifest = JSON.parse(readFileSync(join(root, "docs/deal-image-prompts.json"), "utf8"));
const ids = ["airport-delivery-return", "luxury-wedding-cars"];
if (manifest.images.length !== ids.length || !ids.every(id => manifest.images.filter(image => image.dealId === id).length === 1)) throw new Error("Expected exactly the airport and wedding images.");
const files = manifest.images.map(image => {
  const file = resolve(root, image.file);
  if (!file.startsWith(join(root, "assets/generated/deals") + sep)) throw new Error("Unexpected image path.");
  const bytes = readFileSync(file);
  if (bytes.length > 5 * 1024 * 1024 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") throw new Error("Invalid or oversized WebP.");
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  return { ...image, bytes, path: `deals/generated/${hash}-${basename(file)}` };
});
const schemaModule = { exports: {} };
const javascript = ts.transpileModule(readFileSync(join(root, "src/lib/content-schema.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
new Function("require", "module", "exports", javascript)(require, schemaModule, schemaModule.exports);
const { dealsSchema } = schemaModule.exports;
function checked(result, label) { if (result.error) throw new Error(`${label}: ${result.error.message}`); return result.data; }
const service = createClient(project, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const rows = checked(await service.from("site_content").select("*"), "Read content");
const before = rows.find(row => row.key === "deals");
if (!before?.updated_at) throw new Error("Missing versioned deals record.");
dealsSchema.parse(before.data);
for (const id of ids) if (before.data.filter(deal => deal.id === id).length !== 1) throw new Error(`Missing deal: ${id}`);
console.log("Validated two generated images and the existing Supabase deals.");
if (!process.argv.includes("--apply")) {
  console.log("Dry run only; nothing uploaded or changed.");
} else {
  const index = process.argv.indexOf("--backup-dir");
  const backupDirectory = index >= 0 ? process.argv[index + 1] : "";
  if (!backupDirectory || !isAbsolute(backupDirectory)) throw new Error("An absolute backup directory is required.");
  const backupRelative = relative(root, resolve(backupDirectory));
  if (!backupRelative.startsWith("..") && !isAbsolute(backupRelative)) throw new Error("Keep production backups outside the repository.");
  mkdirSync(backupDirectory, { recursive: true });
  const backupFile = join(backupDirectory, `before-deal-images-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  writeFileSync(backupFile, JSON.stringify({ project, rows }, null, 2), { flag: "wx" });
  console.log(`Saved content backup to ${backupFile}`);
  const replacements = new Map();
  for (const file of files) {
    const upload = await service.storage.from("site-media").upload(file.path, file.bytes, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
    if (upload.error && !["409", "Duplicate"].includes(String(upload.error.statusCode)) && !/already exists|duplicate/i.test(upload.error.message)) throw new Error(`Upload failed: ${upload.error.message}`);
    const url = service.storage.from("site-media").getPublicUrl(file.path).data.publicUrl;
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok || !response.headers.get("content-type")?.includes("image/webp") || !Buffer.from(await response.arrayBuffer()).equals(file.bytes)) throw new Error("Uploaded image verification failed.");
    replacements.set(file.dealId, { image: url, imageAlt: file.imageAlt });
  }
  const next = before.data.map(deal => replacements.has(deal.id) ? { ...deal, ...replacements.get(deal.id) } : deal);
  dealsSchema.parse(next);
  const updated = checked(await service.from("site_content").update({ data: next, updated_at: new Date().toISOString() }).eq("key", "deals").eq("updated_at", before.updated_at).select("key"), "Publish deal images");
  if (updated.length !== 1) throw new Error("Deals changed during upload. No deal record was overwritten; review and retry.");
  const publicClient = createClient(project, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const published = checked(await publicClient.from("site_content").select("data").eq("key", "deals").single(), "Verify public deals");
  if (!isDeepStrictEqual(published.data, next)) throw new Error("Published deals differ from the intended image update.");
  const after = checked(await service.from("site_content").select("*"), "Verify remaining content");
  for (const row of rows.filter(row => row.key !== "deals")) {
    if (!isDeepStrictEqual(row, after.find(item => item.key === row.key))) throw new Error(`Other content changed concurrently: ${row.key}`);
  }
  console.log("Published and verified both deal images. Other deal fields and site content are unchanged.");
}

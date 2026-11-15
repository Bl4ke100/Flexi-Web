// Publishes only the eight About image slots; never re-imports other site content.
// Dry run by default. Apply with --apply --backup-dir <absolute local directory>.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join, basename, sep, isAbsolute } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { createClient } from "@supabase/supabase-js";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
require("@next/env").loadEnvConfig(root, true, { info() {}, error() {} });
const expectedUrl = "https://jyvqrrgmbwfquergpimv.supabase.co";
if (process.env.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) throw new Error("Configured project does not match the Flexi Rental project.");
const manifest = JSON.parse(readFileSync(join(root, "docs/about-image-prompts.json"), "utf8"));
if (manifest.images.length !== 8) throw new Error("Exactly eight About images are required.");
const files = manifest.images.map(image => {
  const path = resolve(root, image.file);
  if (!path.startsWith(join(root, "public", "about") + sep)) throw new Error("Unexpected About image path.");
  const bytes = readFileSync(path);
  if (bytes.length > 5 * 1024 * 1024 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") throw new Error("Invalid or oversized WebP.");
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  return { bytes, path: `settings/about-generated/${hash}-${basename(path)}` };
});
const schemaModule = { exports: {} };
const javascript = ts.transpileModule(readFileSync(join(root, "src/lib/content-schema.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
new Function("require", "module", "exports", javascript)(require, schemaModule, schemaModule.exports);
const { settingsSchema } = schemaModule.exports;
function checked(result, label) { if (result.error) throw new Error(`${label}: ${result.error.message}`); return result.data; }
const service = createClient(expectedUrl, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const before = checked(await service.from("site_content").select("*").eq("key", "settings").single(), "Read settings");
settingsSchema.parse(before.data);
console.log("Validated eight generated About images and existing settings.");
if (!process.argv.includes("--apply")) {
  console.log("Dry run only; no uploads or settings changed.");
} else {
const backupArgument = process.argv.indexOf("--backup-dir");
const backupDirectory = backupArgument >= 0 ? process.argv[backupArgument + 1] : "";
if (!backupDirectory || !isAbsolute(backupDirectory)) throw new Error("An absolute backup directory is required.");
mkdirSync(backupDirectory, { recursive: true });
const backupFile = join(backupDirectory, `before-about-images-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
writeFileSync(backupFile, JSON.stringify({ project: expectedUrl, settings: before }, null, 2));
console.log(`Saved existing settings to ${backupFile}`);
const urls = await Promise.all(files.map(async file => {
  const upload = await service.storage.from("site-media").upload(file.path, file.bytes, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (upload.error && !["409", "Duplicate"].includes(String(upload.error.statusCode)) && !/already exists|duplicate/i.test(upload.error.message)) throw new Error(`Image upload failed: ${upload.error.message}`);
  const url = service.storage.from("site-media").getPublicUrl(file.path).data.publicUrl;
  const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(20000) });
  if (!response.ok || !response.headers.get("content-type")?.includes("image/webp")) throw new Error("Cannot verify an uploaded About image.");
  return url;
}));
const nextSettings = { ...before.data, aboutImages: urls };
settingsSchema.parse(nextSettings);
const changed = checked(await service.from("site_content").update({ data: nextSettings, updated_at: new Date().toISOString() }).eq("key", "settings").eq("updated_at", before.updated_at).select("key"), "Publish About images");
if (changed.length !== 1) throw new Error("Settings changed during upload. No settings were overwritten; review and retry.");
const publicClient = createClient(expectedUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const published = checked(await publicClient.from("site_content").select("data").eq("key", "settings").single(), "Verify public settings");
if (!isDeepStrictEqual(published.data, nextSettings)) throw new Error("Published settings differ from the expected About-image update.");
console.log("Published and verified all eight About image slots; other settings are unchanged.");
}

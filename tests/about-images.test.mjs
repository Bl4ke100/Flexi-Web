import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadTypescript } from "./load-typescript.mjs";

const content = JSON.parse(readFileSync(new URL("../src/data/postContent.json", import.meta.url), "utf8"));
const schema = loadTypescript("../src/lib/content-schema.ts");
const artwork = loadTypescript("../src/data/aboutImages.ts");
const customImages = Array.from({ length: 8 }, (_, index) => `https://example.com/about-${index + 1}.jpg`);

test("About images accept older settings and validate all eight replacement URLs", () => {
  assert.equal(schema.settingsSchema.safeParse(content.settings).success, true);
  assert.deepEqual(schema.settingsSchema.parse({ ...content.settings, aboutImages: customImages }).aboutImages, customImages);
  for (const aboutImages of [[], customImages.slice(1), [...customImages, customImages[0]], ["javascript:alert(1)", ...customImages.slice(1)], ["", ...customImages.slice(1)]]) {
    assert.equal(schema.settingsSchema.safeParse({ ...content.settings, aboutImages }).success, false);
  }
});

test("Settings editor exposes eight preview and upload slots for both old and new settings", () => {
  const { SettingsEditor } = loadTypescript("../src/components/admin/AdminEditors.tsx", {
    "@/lib/supabase/client": { getSupabaseBrowser: () => null },
    "@/lib/content-schema": schema,
    "@/data/aboutImages": artwork,
  });
  for (const images of [undefined, customImages]) {
    const html = renderToStaticMarkup(createElement(SettingsEditor, { settings: { ...content.settings, aboutImages: images }, onChange() {} }));
    assert.equal((html.match(/<fieldset/g) ?? []).length, 8);
    assert.equal((html.match(/type="file"/g) ?? []).length, 8);
    for (const image of images ?? artwork.DEFAULT_ABOUT_IMAGES) assert.ok(html.includes(`src="${image}"`));
  }
});

test("Public About mosaic uses the saved image slots in its existing twelve-frame layout", () => {
  const section = loadTypescript("../src/components/ScrollytellingSection.tsx", {
    "@/components/OptimizedImage": ({ sizes, ...props }) => createElement("img", props),
    "@/lib/gauge": loadTypescript("../src/lib/gauge.ts"),
    "@/data/aboutImages": artwork,
    "./WhatsAppLink": ({ children }) => createElement("a", null, children),
    "./SiteContentProvider": { useSiteContent: () => ({ settings: { ...content.settings, aboutImages: customImages }, fleet: content.fleet }) },
    "./AnimatedText": {
      ScrambleText: ({ text }) => createElement("span", null, text),
      RollingHeading: ({ text }) => createElement("h2", null, text),
      RollText: ({ children }) => createElement("span", null, children),
      FourPointStar: () => null,
    },
  }).default;
  const html = renderToStaticMarkup(createElement(section));
  const about = html.slice(html.indexOf('<section id="about"'), html.indexOf("</section>"));
  assert.equal((about.match(/<img/g) ?? []).length, 12);
  customImages.forEach(image => assert.ok(about.includes(`src="${image}"`)));
});

test("Admin save and public content read preserve replacement About images", async () => {
  let saved;
  const admin = loadTypescript("../src/app/api/admin/content/route.ts", {
    "@/lib/content-schema": schema,
    "@/lib/supabase/server": {
      readJson: request => request.json(),
      requireAdmin: async (_, permission) => {
        assert.equal(permission, "settings");
        return { user: { id: "admin-id" }, service: { from: () => ({ upsert: async row => { saved = row; return {}; } }) } };
      },
      apiError: error => { throw error; },
    },
  });
  const response = await admin.PUT(new Request("https://example.com/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "settings", data: { ...content.settings, aboutImages: customImages } }) }));
  assert.equal(response.status, 200);
  const defaults = { settings: content.settings, fleet: content.fleet, deals: content.deals, gallery: [] };
  const publicApi = loadTypescript("../src/app/api/content/route.ts", {
    "@/lib/content-schema": schema,
    "@/data/siteContent": { DEFAULT_CONTENT: defaults },
    "@/lib/supabase/server": { getSupabasePublic: () => ({ from: table => table === "site_content"
      ? { select: async () => ({ data: [saved, { key: "fleet", data: content.fleet }, { key: "deals", data: content.deals }] }) }
      : { select() { return this; }, eq() { return this; }, order() { return this; }, limit: async () => ({ data: [] }) } }) },
  });
  const published = await (await publicApi.GET()).json();
  assert.deepEqual(published.settings.aboutImages, customImages);
});

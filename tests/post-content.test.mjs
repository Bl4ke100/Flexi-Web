import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadTypescript } from "./load-typescript.mjs";

const content = JSON.parse(readFileSync(new URL("../src/data/postContent.json", import.meta.url), "utf8"));
const schema = loadTypescript("../src/lib/content-schema.ts");
const fleet = loadTypescript("../src/data/fleetData.ts", { "./postContent.json": { default: content } });
const whatsapp = loadTypescript("../src/lib/whatsapp.ts");

test("Unknown prices and specifications survive validation without becoming zero", () => {
  const vehicle = { ...content.fleet[0], year: null, pricePerDay: null, deposit: null, seats: null };
  const parsed = schema.vehicleSchema.parse(vehicle);
  assert.equal(parsed.pricePerDay, null);
  assert.equal(parsed.deposit, null);
  assert.equal(parsed.year, null);
  assert.equal(parsed.seats, null);
  assert.equal(fleet.formatDailyRate(parsed.pricePerDay), "Request a quote");
  assert.equal(fleet.formatDailyRate(9500), "Rs. 9,500 / day");
  for (const field of ["pricePerDay", "deposit", "seats", "year"]) {
    assert.equal(schema.vehicleSchema.safeParse({ ...vehicle, [field]: -1 }).success, false);
  }
});

test("Upcoming vehicle enquiries ask about launch and undated mileage promotion stays a draft", () => {
  const fronx = content.fleet.find(vehicle => vehicle.id === "suzuki-fronx");
  assert.equal(fronx.status, "coming-soon");
  const message = new URL(whatsapp.getWhatsAppBookingUrl({ vehicle: fronx })).searchParams.get("text");
  assert.match(message, /Suzuki Fronx/);
  assert.match(message, /upcoming vehicle/);
  assert.equal(schema.activeDeals(content.deals).some(deal => deal.id === "extra-500km"), false);
});

test("Contact settings accept older records and validate the imported email and phone", () => {
  assert.equal(schema.settingsSchema.safeParse(content.settings).success, true);
  const { australiaPhone, contactEmail, socialName, tagline, ...previous } = content.settings;
  assert.equal(schema.settingsSchema.parse(previous).contactEmail, "");
  assert.equal(schema.settingsSchema.safeParse({ ...content.settings, contactEmail: "invalid" }).success, false);
  assert.equal(schema.settingsSchema.safeParse({ ...content.settings, australiaPhone: "call me" }).success, false);
});

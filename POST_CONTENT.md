# Content imported from Flexi Rental posts

Source: `D:\Edits\Editing Jobs\Flexi Rental`, reviewed 14 November 2026. The source folder was not modified.

`src/data/postContent.json` supplies the local fallback content. The connected website reads settings, fleet, and deals from the existing Supabase `site_content` table, with customer and wedding images in `gallery_photos`. Images are copied unchanged into `public/posts` and uploaded to the existing public `site-media` bucket. `scripts/post-import-sources.json` maps each copied image to its original filename.

- 13 advertised rental model/variant listings, plus the Suzuki Fronx marked **coming soon**. Listings describe models rather than a count of individually available cars.
- Unknown rates, deposits, years, and seating capacities are `null`; the website requests a quote instead of displaying invented values. The Vezel RS post explicitly identifies 2017. Other specifications remain available on request.
- The contact card supplies the Australian number, Sri Lankan WhatsApp number, email, and social display name. No unverified social profile URLs or rental-office street address are added.
- Airport pickup/return, short/long rentals, wedding cars, insurance enquiries, and 24/7 support are reflected in the website content.
- The undated extra 500 km offer is saved as an **unpublished draft**. Confirm its validity, eligibility, duration, and expiry before publishing it.
- Seven existing customer/wedding posts replace demo gallery content. Captions use the business's thank-you message; customer names, personal testimonials, exact locations, and unknown vehicle models are not invented. Ten exact demo entries from migration 002 are archived as rejected, rather than deleted. Other uploads are preserved.
- Flexi Automotive and Flexi Tours are separate brands in the source folder; their contacts are not used as the rental booking number.

Validate the import without changing the database:

```powershell
node scripts/import-post-content.mjs
```

Apply only after reviewing `postContent.json` and any newer edits made through the admin panel:

```powershell
node scripts/import-post-content.mjs --apply --backup-dir 'C:\absolute\backup-directory'
```

The importer reads the existing ignored `.env.local`, checks the intended project, validates content and images, backs up content/gallery rows before writing, uploads images under content-hashed paths, refuses concurrent content edits, and verifies stored content through anonymous access. Re-running uses the same gallery IDs and image paths. It intentionally replaces the three content sections with the reviewed file, so do not rerun it over newer admin edits without merging those changes first.

The import updates the existing JSON content structure and requires no database schema migration. The updated application must be deployed wherever the website is hosted, because it supports nullable specifications, coming-soon status, and the new contact fields. No hosting deployment is performed by this script.

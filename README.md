
# Flexi Rental

Next.js website for vehicle discovery and WhatsApp bookings.

```sh
npm install
npm run dev
```

The public site works before a database is connected. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database setup, email/password administration, permissions, image uploads, and deployment environment variables. The admin panel is at `/admin`.

The fleet, contact details, services, and gallery now use the supplied Flexi Rental posts. See [POST_CONTENT.md](./POST_CONTENT.md) for source mappings, unknown pricing/specifications, the draft mileage promotion, and the backed-up Supabase import workflow.

```sh
npm test
npm run build
```

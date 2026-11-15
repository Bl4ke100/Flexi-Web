# Connect Flexi Rental to Supabase

The website works with its default content before connection. `/admin` deliberately has no working login until the project is configured. There are no hardcoded passwords or demo administrator accounts.

Supabase will provide three things: a PostgreSQL database for content and administrator permissions, Auth for email/password login, and Storage for images.

## Current project: connected locally

Updated 14 November 2026: the supplied Flexi Rental posts have replaced the demo content. Supabase contains 13 advertised rental model/variant listings plus the coming-soon Fronx, three published service cards, an unpublished 500 km promotion, and seven customer/wedding gallery posts. The original artwork is in `site-media`. Rates and unknown specifications remain unset. The ten seeded demo gallery entries are archived, not deleted. Do not rerun migration 002 to restore those examples. See [POST_CONTENT.md](./POST_CONTENT.md) for the import and backup details.

Verified on 12 November 2026: project `jyvqrrgmbwfquergpimv` is connected through the ignored `.env.local` file. The existing tables, storage buckets, and confirmed super-admin account were verified. The website settings, fleet, and deals are stored in Supabase. Do not rerun migration 001 or the initial account setup against this already configured project.

Production-build verification completed locally on 13 November 2026 at `http://127.0.0.1:3001`. All read-only connection checks passed. The compiled browser assets contain the publishable key and do not contain the server secret. No disposable QA administrator accounts, Auth users, or gallery photos remain in the project. Migration 002 carries over the original ten gallery photos so the scrolling film reel remains populated after connecting Supabase; those photos can be managed under **Gallery & uploads → Approved**.

Live checks passed for administrator creation, email/password login, section permissions, disabling an administrator, and the customer photo submission, approval, publication, and deletion flow. The disposable test account, photo record, and image objects were removed. Password reset email delivery and production-host configuration have not been tested.

For a read-only connection check, start the website locally on port 3001 and run `npm run verify:supabase`. The optional `npm run verify:supabase -- --write-tests` also creates disposable QA data, tests the workflows, and cleans up afterward. It uses the server key from `.env.local` and never prints passwords, keys, or session tokens. A different local port can be selected with the `FLEXI_VERIFY_URL` environment variable.

Supabase's advisor also reports that leaked-password protection is disabled. Before public launch, review [the password protection setting](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). The permission-check helper functions are intentionally SECURITY DEFINER functions scoped to the current authenticated user; the upload-limit table intentionally grants no direct client access.

The numbered instructions below are retained as a reference for a new project or deployment.

## 1. Create your project

1. Open https://supabase.com/dashboard and create an account or sign in.
2. Create a new project, named for example `flexi-rental`. Choose a region close to your customers, such as Singapore if it is available. Keep the database password in your password manager; the website does not need it.
3. Wait until the project is ready.

## 2. Create the database and image buckets

1. In your project, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase/migrations/001_site_management.sql` and run it **once** on this new project.
3. This creates the website content table, protected administrator accounts, photo moderation table, upload limits, and two image buckets. Row Level Security (RLS) is enabled by the script.
4. Run `supabase/migrations/002_restore_existing_gallery.sql` once to carry over the original website gallery photos. It preserves existing records and skips photos already present. After migration, manage gallery photos in the admin panel instead of rerunning the restoration script.

`site-media` is public and holds published vehicle, deal/banner, and gallery images. `gallery-submissions` is private and holds pending customer uploads. Pending uploads are never sent to the public website. Approval copies a photo into public storage; rejecting a submission removes its private file.

## 3. Create the first super admin

1. Open **Authentication → Users → Add user → Create new user**.
2. Use **janindumagamage100@gmail.com**, choose a unique password of at least 12 characters, and mark the email as confirmed. Set the password privately; do not send it in chat.
3. Return to **SQL Editor** and run `supabase/bootstrap-super-admin.sql` once. It assigns the existing confirmed user the super admin role.

Adding an Auth user alone does not grant administrator access. Access comes from the protected `admin_accounts` table. Only the super admin can add administrators or change their permissions through the website. The website cannot create another super admin or alter the super admin's own privileges; those changes require the project owner in Supabase.

## 4. Configure email/password authentication

In **Authentication**, keep the **Email** provider enabled. Disable public user signups / **Allow new users to sign up**, since administrator accounts are created by the super admin. Do not disable email/password login.

Under **URL Configuration**:

- Set the Site URL to your real production website URL when it is deployed.
- Add `http://localhost:3000/admin?reset=1` to the allowed redirect URLs for local password resets.
- Add `https://YOUR-DOMAIN/admin?reset=1` for production password resets. If you use another local port, add its exact `/admin?reset=1` URL too.

Set the minimum password length to **12** and enable the available strong-password options. Keep Supabase's authentication rate limits enabled. For reliable password reset emails in production, configure **custom SMTP** in the email settings using your email provider. The dashboard's default mail sender has restrictions and is for initial testing.

Administrators sign in at `/admin` with email and password. The super admin can create an administrator with an initial password and select any combination of: website content/contact, vehicles/rates, deals/banners, and gallery/uploads. Share the initial password privately; each administrator can change their own password under **Your account**.

## 5. Add the three environment variables

Find your **Project URL** in the project's connection/API settings. Open **Settings → API Keys** and copy the **publishable** and **secret** keys. Use the new keys beginning `sb_publishable_` and `sb_secret_`.

Copy `.env.example` to `.env.local` in the project root and fill it in:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
SUPABASE_SECRET_KEY=sb_secret_YOUR_KEY
```

The project URL and publishable key may appear in the browser. The secret key bypasses RLS and must stay in `.env.local` and in the hosting provider's **server environment variables**. Never put it in source files, prefix it with `NEXT_PUBLIC_`, commit it, or send it in a screenshot or chat message. `.env.local` is ignored by Git.

Restart the development server with `npm run dev`. On your host (for example Vercel), add the same three variables, then rebuild/redeploy. Public environment values are included at build time, so editing hosting variables without rebuilding is not enough. This app needs a Next.js server for admin operations and uploads; do not deploy it as a static-only export.

## What to give Codex

You can send the **Project URL**, **publishable key**, and your final website URL. Put the **secret key directly into `.env.local` yourself** (and into the host's server environment), then say that it is set. Do not send your Supabase account password, database password, or super admin password. These are not needed for the integration.

Also say whether you have run the migration and super admin bootstrap scripts. Once those steps are done, the live login, permission checks, image uploads, and publishing can be tested against your project.

## 6. Publish the first content

1. Open `/admin` and sign in as the super admin.
2. Review **Website content & contact**, then save. The WhatsApp number defaults to `94742074851`.
3. Open **Vehicles & rates** to see the fleet as cards. Select a vehicle to open its edit dialog, replace demonstration images/details with the client's real fleet, then choose **Save vehicle** to publish. **Cancel** discards dialog edits. Use **Add vehicle** for a new listing. Removing a vehicle requires confirmation and removes it from the live fleet list; route/hero recommendations fall back to a current vehicle.
4. In **Deals & banners**, upload real artwork, enter the offer text and conditions, and mark it published. Dates are entered in your device timezone and stored as UTC. Offer cards without dates remain visible until unpublished. Save to publish the current order and schedule.
5. In **Gallery & uploads**, add approved customer photos or review customer submissions. Once connected, the public gallery starts empty, so demonstration testimonials are not automatically saved as real customer submissions.
6. Under **Administrators**, create the other admins and select their permissions. Disabling access blocks subsequent protected requests, even when that person's existing login token has not expired.

Photos must be JPG, PNG, or WebP, up to 5 MB. The server checks file signatures, bounds request sizes, and accepts up to five customer submissions per 15 minutes per platform-provided client address, with a project-wide cap of 100 per day. On Vercel the platform-supplied client IP is hashed before use. On other hosts the app conservatively uses one shared submission limit until a trusted client-IP integration is implemented. Use your host's request/body-size limits too. Storage quotas and upload limits should be adjusted if the client needs higher volume.

Unsaved image uploads can remain as unused objects in `site-media`; periodically review unused images in Storage. Deleting a gallery photo removes its record and associated file. As with any public image, copies already downloaded or cached outside the website cannot be recalled.

## Verify before production

- Wrong passwords fail; an Auth user without an active admin entry cannot open management tools.
- An admin assigned only deals permission can edit offers but cannot change vehicles, settings, gallery photos, or administrators.
- Test a customer photo upload: it is private/pending, then visible publicly only after approval.
- Disable a test admin and confirm their next save is rejected.
- Confirm password reset mail reaches the recipient and the link opens `/admin` on the correct site.
- Confirm the three environment variables are set on the host, with only the publishable key in browser code.

Local automated checks exercise the PostgreSQL RLS policies, server authorization helper, content validation, offer schedules, and image type validation. They do not replace live verification with the project's real Supabase Auth, Storage, email provider, and hosting configuration.

Official references: [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [email/password Auth](https://supabase.com/docs/guides/auth/passwords), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

test("Database policies isolate admins, permissions, public photos, and storage", async () => {
  const db = new PGlite();
  const superId = "10000000-0000-4000-8000-000000000001";
  const dealsId = "10000000-0000-4000-8000-000000000002";
  const outsiderId = "10000000-0000-4000-8000-000000000003";
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema storage;
      grant usage on schema public, auth, storage to anon, authenticated, service_role;
      create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $$;
      grant execute on function auth.uid() to anon, authenticated, service_role;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant select, insert, update, delete on storage.objects to anon, authenticated, service_role;
      create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/'); $$;
      insert into auth.users values ('${superId}','janindumagamage100@gmail.com',now()), ('${dealsId}','deals@example.com',now()), ('${outsiderId}','visitor@example.com',now());
    `);
    await db.exec(readFileSync(new URL("../supabase/migrations/001_site_management.sql", import.meta.url), "utf8"));
    await db.exec(readFileSync(new URL("../supabase/bootstrap-super-admin.sql", import.meta.url), "utf8"));
    await db.exec(`insert into public.admin_accounts(id,email,permissions) values ('${dealsId}','deals@example.com',array['deals']);
      insert into public.site_content values ('settings','{}',now(),null), ('fleet','[]',now(),null), ('deals','[]',now(),null);
      insert into public.gallery_photos(customer_name,location,vehicle_name,quote,status,image_url) values
        ('Published','Airport','Car','Great trip','approved','https://example.com/photo.jpg'),
        ('Pending','Airport','Car','Private photo','pending',null);`);

    await db.exec("set role anon;");
    assert.equal((await db.query("select * from public.site_content")).rows.length, 3);
    assert.equal((await db.query("select customer_name from public.gallery_photos")).rows[0].customer_name, "Published");
    assert.equal((await db.query("select * from public.gallery_photos")).rows.length, 1);
    await assert.rejects(db.query("select * from public.admin_accounts"), /permission denied/);
    await assert.rejects(db.query("select public.reserve_gallery_upload('test')"), /permission denied/);
    await assert.rejects(db.query("insert into public.gallery_photos(customer_name,location,vehicle_name,quote) values ('x','x','x','x')"), /permission denied/);

    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${dealsId}',false);`);
    assert.equal((await db.query("select * from public.admin_accounts")).rows.length, 1);
    await db.query("update public.site_content set data='[\"changed\"]' where key='deals'");
    assert.equal((await db.query("update public.site_content set data='{}' where key='settings' returning key")).rows.length, 0);
    await assert.rejects(db.query("insert into public.site_content(key,data) values ('fleet','{}') on conflict(key) do update set data='{}'"), /row-level security/);
    await assert.rejects(db.query("update public.admin_accounts set role='super_admin'"), /permission denied/);
    await assert.rejects(db.query("update public.admin_accounts set permissions=array['fleet']"), /permission denied/);
    await assert.rejects(db.query("insert into public.admin_accounts(id,email,role) values ('10000000-0000-4000-8000-000000000004','x','super_admin')"), /permission denied/);
    await db.query("insert into storage.objects(bucket_id,name) values ('site-media','deals/offer.jpg')");
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('site-media','fleet/car.jpg')"), /row-level security/);
    await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values ('gallery-submissions','private.jpg')"), /row-level security/);

    await db.exec(`select set_config('request.jwt.claim.sub','${outsiderId}',false);`);
    assert.equal((await db.query("select * from public.admin_accounts")).rows.length, 0);
    assert.equal((await db.query("update public.site_content set data='{}' where key='deals' returning key")).rows.length, 0);

    await db.exec(`reset role; update public.admin_accounts set active=false where id='${dealsId}'; set role authenticated; select set_config('request.jwt.claim.sub','${dealsId}',false);`);
    assert.equal((await db.query("select public.has_admin_permission('deals') as allowed")).rows[0].allowed, false);
    assert.equal((await db.query("update public.site_content set data='{}' where key='deals' returning key")).rows.length, 0);

    await db.exec(`select set_config('request.jwt.claim.sub','${superId}',false);`);
    assert.equal((await db.query("select public.is_super_admin() as allowed")).rows[0].allowed, true);
    assert.equal((await db.query("select * from public.admin_accounts")).rows.length, 2);
    assert.equal((await db.query("select * from public.gallery_photos")).rows.length, 2);
    await assert.rejects(db.query("update public.admin_accounts set role='admin'"), /permission denied/);

    await db.exec("reset role; set role service_role;");
    for (let count = 0; count < 5; count++) assert.equal((await db.query("select public.reserve_gallery_upload('test') as allowed")).rows[0].allowed, true);
    assert.equal((await db.query("select public.reserve_gallery_upload('test') as allowed")).rows[0].allowed, false);

    const originalGallery = readFileSync(new URL("../supabase/migrations/002_restore_existing_gallery.sql", import.meta.url), "utf8");
    await db.exec(originalGallery);
    await db.exec(originalGallery);
    assert.equal((await db.query("select * from public.gallery_photos")).rows.length, 12, "Restoration preserves existing records and does not duplicate original photos");
    assert.equal((await db.query("select status from public.gallery_photos where customer_name='Pending'")).rows[0].status, "pending");
    await db.exec("reset role; set role anon;");
    assert.equal((await db.query("select * from public.gallery_photos")).rows.length, 11, "Original reel photos are public while pending submissions stay private");
  } finally { await db.close(); }
});

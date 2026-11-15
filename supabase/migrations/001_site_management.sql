begin;

create table public.admin_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  permissions text[] not null default '{}' check (permissions <@ array['settings','fleet','deals','gallery']::text[]),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admin_accounts enable row level security;
revoke all on public.admin_accounts from anon, authenticated;
grant select on public.admin_accounts to authenticated;
grant all on public.admin_accounts to service_role;

-- Roles live in this protected table, never in editable user_metadata.
create function public.has_admin_permission(required_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_accounts
    where id = (select auth.uid()) and active
      and (role = 'super_admin' or required_permission = any(permissions))
  );
$$;
create function public.is_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_accounts
    where id = (select auth.uid()) and active and role = 'super_admin');
$$;
revoke all on function public.has_admin_permission(text) from public, anon;
revoke all on function public.is_super_admin() from public, anon;
grant execute on function public.has_admin_permission(text), public.is_super_admin() to authenticated;

create policy "Read own admin access or manage team" on public.admin_accounts
  for select to authenticated using (id = (select auth.uid()) or (select public.is_super_admin()));
-- No client insert/update/delete policies: only the verified server API manages accounts.

create table public.site_content (
  key text primary key check (key in ('settings','fleet','deals')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.site_content enable row level security;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;
create policy "Read website content" on public.site_content for select to anon, authenticated using (true);
create policy "Edit permitted website sections" on public.site_content for all to authenticated
  using (public.has_admin_permission(key)) with check (public.has_admin_permission(key));

create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  location text not null check (char_length(location) between 1 and 160),
  vehicle_name text not null check (char_length(vehicle_name) between 1 and 100),
  quote text not null check (char_length(quote) between 1 and 600),
  trip_tag text not null default 'CUSTOMER JOURNEYS',
  image_url text,
  storage_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  check (status <> 'approved' or image_url is not null)
);
alter table public.gallery_photos enable row level security;
revoke all on public.gallery_photos from anon, authenticated;
grant select on public.gallery_photos to anon, authenticated;
grant all on public.gallery_photos to service_role;
create policy "Read approved customer photos" on public.gallery_photos for select to anon, authenticated using (status = 'approved');
create policy "Review all customer submissions" on public.gallery_photos for select to authenticated using (public.has_admin_permission('gallery'));
-- Public submission and moderation writes go through validated server routes.

create table public.gallery_upload_limits (
  id bigint generated always as identity primary key,
  rate_key text not null,
  created_at timestamptz not null default now()
);
create index on public.gallery_upload_limits (created_at);
create index on public.gallery_upload_limits (rate_key, created_at);
alter table public.gallery_upload_limits enable row level security;
revoke all on public.gallery_upload_limits from anon, authenticated;
grant all on public.gallery_upload_limits to service_role;
grant usage, select on sequence public.gallery_upload_limits_id_seq to service_role;

create function public.reserve_gallery_upload(p_rate_key text)
returns boolean language plpgsql set search_path = '' as $$
begin
  -- A transaction lock makes the limits atomic across multiple server instances.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('flexi_gallery_upload'));
  delete from public.gallery_upload_limits where created_at < now() - interval '1 day';
  if (select count(*) from public.gallery_upload_limits) >= 100 or
     (select count(*) from public.gallery_upload_limits where rate_key = p_rate_key
       and created_at > now() - interval '15 minutes') >= 5 then
    return false;
  end if;
  insert into public.gallery_upload_limits (rate_key) values (p_rate_key);
  return true;
end;
$$;
revoke all on function public.reserve_gallery_upload(text) from public, anon, authenticated;
grant execute on function public.reserve_gallery_upload(text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('site-media', 'site-media', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('gallery-submissions', 'gallery-submissions', false, 5242880, array['image/jpeg','image/png','image/webp']);

create policy "Admins upload permitted website images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'site-media' and public.has_admin_permission((storage.foldername(name))[1])
  );
create policy "Admins read permitted website image metadata" on storage.objects
  for select to authenticated using (
    bucket_id = 'site-media' and public.has_admin_permission((storage.foldername(name))[1])
  );
-- Pending uploads are private, and only the server can write or retrieve them.
-- Public visitors can download approved assets from the public site-media bucket.

commit;

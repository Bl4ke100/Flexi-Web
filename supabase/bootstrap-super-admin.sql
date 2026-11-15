-- First create this email/password user in Supabase Authentication > Users.
-- Run this once from the SQL Editor as the project owner, after migration 001.
do $$
declare super_user_id uuid;
begin
  select id into super_user_id from auth.users
    where lower(email) = 'janindumagamage100@gmail.com' and email_confirmed_at is not null;
  if super_user_id is null then
    raise exception 'Create and confirm janindumagamage100@gmail.com in Authentication > Users first.';
  end if;
  if exists (select 1 from public.admin_accounts where role = 'super_admin' and id <> super_user_id) then
    raise exception 'A different super admin already exists. Review it before making changes.';
  end if;
  insert into public.admin_accounts (id,email,role,permissions,active)
    values (super_user_id,'janindumagamage100@gmail.com','super_admin',array['settings','fleet','deals','gallery'],true)
    on conflict (id) do update set role = 'super_admin', active = true,
      permissions = array['settings','fleet','deals','gallery'];
end;
$$;

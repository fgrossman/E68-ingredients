-- ============================================================
-- E68 Ingredients — Supabase setup (with roles)
-- Run this in your Supabase project: SQL Editor -> New query -> Run.
-- Safe to run more than once.
-- ============================================================

-- ------------------------------------------------------------
-- 1) PRODUCTS: one record per food (two photos + optional name)
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  ingredients_path text not null,  -- photo of the ingredients list on the box
  packet_path text not null        -- photo of one individual packet
);
alter table public.products enable row level security;

-- ------------------------------------------------------------
-- 2) PROFILES: which signed-in users exist and their role
--    role is either 'admin' or 'photographer' (photo taker)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'photographer' check (role in ('admin','photographer')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Helper functions (SECURITY DEFINER so they can read profiles without
-- triggering row-level-security recursion).
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_access()
returns boolean language sql security definer stable as $$
  select exists(select 1 from public.profiles where id = auth.uid());
$$;

-- ------------------------------------------------------------
-- 3) SECURITY RULES
-- ------------------------------------------------------------

-- PRODUCTS -----------------------------------------------------
-- Anyone can VIEW (the home page is public, no login).
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

-- Only signed-in staff (admin or photographer) can ADD.
drop policy if exists "public insert products" on public.products;
drop policy if exists "staff insert products" on public.products;
create policy "staff insert products" on public.products
  for insert to authenticated with check (public.has_access());

-- Only admins can DELETE.
drop policy if exists "auth delete products" on public.products;
create policy "admin delete products" on public.products
  for delete to authenticated using (public.is_admin());

-- PROFILES -----------------------------------------------------
-- A user can read their own profile; admins can read everyone.
drop policy if exists "read own or admin" on public.profiles;
create policy "read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

-- Admins can add profiles (used when creating new users).
drop policy if exists "admin insert profiles" on public.profiles;
create policy "admin insert profiles" on public.profiles
  for insert to authenticated with check (public.is_admin());

-- Admins can change roles.
drop policy if exists "admin update profiles" on public.profiles;
create policy "admin update profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admins can remove access (delete a profile).
drop policy if exists "admin delete profiles" on public.profiles;
create policy "admin delete profiles" on public.profiles
  for delete to authenticated using (public.is_admin());

-- ------------------------------------------------------------
-- 4) STORAGE: public bucket for the photos
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ingredients', 'ingredients', true)
on conflict (id) do nothing;

-- Anyone can VIEW photos.
drop policy if exists "public read ingredients" on storage.objects;
create policy "public read ingredients" on storage.objects
  for select using (bucket_id = 'ingredients');

-- Only signed-in staff can UPLOAD.
drop policy if exists "public upload ingredients" on storage.objects;
drop policy if exists "staff upload ingredients" on storage.objects;
create policy "staff upload ingredients" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'ingredients' and public.has_access());

-- Only admins can DELETE photos.
drop policy if exists "auth delete ingredients" on storage.objects;
create policy "admin delete ingredients" on storage.objects
  for delete to authenticated
  using (bucket_id = 'ingredients' and public.is_admin());

-- ============================================================
-- 5) CREATE YOUR FIRST ADMIN
-- ------------------------------------------------------------
-- a) In the dashboard: Authentication -> Users -> Add user.
--    Enter an email + password and CHECK "Auto Confirm User".
-- b) Then run the statement below with that same email to make them an
--    admin. (Re-run any time to promote another existing user.)
--
--    insert into public.profiles (id, email, role)
--    select id, email, 'admin' from auth.users where email = 'you@example.com'
--    on conflict (id) do update set role = 'admin';
-- ============================================================

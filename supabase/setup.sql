-- ============================================================
-- E68 Ingredients — Supabase setup
-- Run this in your Supabase project: SQL Editor -> New query -> Run.
-- Safe to run more than once.
-- ============================================================

-- 1) Table that stores one record per food (two photos + optional name)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  ingredients_path text not null,  -- photo of the ingredients list on the box
  packet_path text not null        -- photo of one individual packet
);

alter table public.products enable row level security;

-- Anyone can READ the list (end users, no login)
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

-- Anyone can ADD a food (volunteers do not log in)
drop policy if exists "public insert products" on public.products;
create policy "public insert products" on public.products
  for insert with check (true);

-- Only logged-in admins can DELETE
drop policy if exists "auth delete products" on public.products;
create policy "auth delete products" on public.products
  for delete to authenticated using (true);

-- 2) Public storage bucket for the photos
insert into storage.buckets (id, name, public)
values ('ingredients', 'ingredients', true)
on conflict (id) do nothing;

-- Anyone can VIEW photos
drop policy if exists "public read ingredients" on storage.objects;
create policy "public read ingredients" on storage.objects
  for select using (bucket_id = 'ingredients');

-- Anyone can UPLOAD photos (volunteers do not log in)
drop policy if exists "public upload ingredients" on storage.objects;
create policy "public upload ingredients" on storage.objects
  for insert with check (bucket_id = 'ingredients');

-- Only logged-in admins can DELETE photos
drop policy if exists "auth delete ingredients" on storage.objects;
create policy "auth delete ingredients" on storage.objects
  for delete to authenticated using (bucket_id = 'ingredients');

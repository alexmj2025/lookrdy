-- ---------------------------------------------------------------------------
-- Lookrdy — Supabase schema.
--
-- Run once in the Supabase SQL editor (or `supabase db execute -f schema.sql`),
-- then populate the catalog with `npm run seed`.
--
-- Access model: everything is written server-side with the service-role key,
-- which bypasses RLS. RLS is enabled on every table with no public policies,
-- so the anon key cannot read or write anything. Products get one read-only
-- policy because the catalog is not sensitive.
-- ---------------------------------------------------------------------------

-- Products ------------------------------------------------------------------
create table if not exists public.products (
  id            text primary key,
  retailer      text not null,
  name          text not null,
  category      text not null check (
                  category in ('jacket','top','trousers','shoes','bag','accessory')
                ),
  color         text not null,
  style_tags    text[] not null default '{}',
  formality     smallint not null check (formality between 1 and 5),
  price         numeric(10,2) not null check (price >= 0),
  currency      text not null default 'CAD',
  image_url     text not null,
  product_url   text not null,
  countries     text[] not null default '{}',
  sizes         text[] not null default '{}',
  last_checked  date,
  tier          text not null check (tier in ('value','mid','premium')),
  created_at    timestamptz not null default now()
);

create index if not exists products_category_idx  on public.products (category);
create index if not exists products_formality_idx on public.products (formality);
create index if not exists products_price_idx     on public.products (price);
create index if not exists products_countries_idx on public.products using gin (countries);

-- Generations — drives the free-generation cap ------------------------------
create table if not exists public.generations (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  occasion    text,
  budget      numeric(10,2),
  currency    text,
  engine      text,
  created_at  timestamptz not null default now()
);

create index if not exists generations_session_idx on public.generations (session_id);

-- Optional: links a generation to a real account once Supabase Auth is in
-- use. NOT required for the "signed-in users are unlimited" rule itself —
-- that's enforced in code by checking for an authenticated session, not by
-- counting rows here. This is only the seed for a future "my looks" history.
-- Run this block once, manually, in the Supabase SQL editor.
alter table public.generations
  add column if not exists user_id uuid references auth.users(id);

create index if not exists generations_user_idx on public.generations (user_id);

drop policy if exists "users read own generations" on public.generations;
create policy "users read own generations"
  on public.generations for select
  to authenticated
  using (user_id = auth.uid());

-- Funnel events -------------------------------------------------------------
create table if not exists public.events (
  id          bigserial primary key,
  session_id  text not null,
  event       text not null,
  properties  jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists events_session_idx on public.events (session_id);
create index if not exists events_event_idx    on public.events (event);
create index if not exists events_created_idx  on public.events (created_at desc);

-- Row-level security --------------------------------------------------------
alter table public.products    enable row level security;
alter table public.generations enable row level security;
alter table public.events      enable row level security;

-- The catalog is public, read-only.
drop policy if exists "products are readable" on public.products;
create policy "products are readable"
  on public.products for select
  to anon, authenticated
  using (true);

-- No policies on generations or events: only the service-role key (used
-- exclusively on the server) can touch them.

-- Funnel view ---------------------------------------------------------------
create or replace view public.funnel_summary as
select
  event,
  count(*)                        as total,
  count(distinct session_id)      as sessions,
  min(created_at)                 as first_seen,
  max(created_at)                 as last_seen
from public.events
group by event;

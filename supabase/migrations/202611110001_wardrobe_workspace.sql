begin;

create table public.lookrdy_wardrobe (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  name text not null check (char_length(name) between 1 and 60),
  slot text not null check (slot in ('top', 'bottom', 'dress', 'shoes', 'layer')),
  image text not null check (image like 'data:image/jpeg;base64,%' and octet_length(image) <= 600000),
  swatch text not null check (swatch ~ '^#[0-9a-f]{6}$'),
  created_at timestamptz not null default now(),
  primary key (owner_id, id)
);

create table public.lookrdy_collections (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  primary key (owner_id, id)
);

create table public.lookrdy_collection_looks (
  owner_id uuid not null default auth.uid(),
  collection_id uuid not null,
  entry_key text not null,
  primary key (owner_id, collection_id, entry_key),
  foreign key (owner_id, collection_id) references public.lookrdy_collections (owner_id, id) on delete cascade,
  foreign key (owner_id, entry_key) references public.lookrdy_library (owner_id, entry_key) on delete cascade
);
create index lookrdy_collection_entry_idx on public.lookrdy_collection_looks (owner_id, entry_key);

alter table public.lookrdy_wardrobe enable row level security;
alter table public.lookrdy_collections enable row level security;
alter table public.lookrdy_collection_looks enable row level security;
revoke all on public.lookrdy_wardrobe, public.lookrdy_collections, public.lookrdy_collection_looks from anon, authenticated;
grant select, insert, update, delete on public.lookrdy_wardrobe, public.lookrdy_collections to authenticated;
grant select, insert, delete on public.lookrdy_collection_looks to authenticated;

create policy "users manage own wardrobe" on public.lookrdy_wardrobe for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "users manage own collections" on public.lookrdy_collections for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "users manage own collection memberships" on public.lookrdy_collection_looks for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

commit;

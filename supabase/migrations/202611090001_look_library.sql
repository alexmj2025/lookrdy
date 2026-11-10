-- The saved library and history are private to their owner.
create table if not exists public.lookrdy_library (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_key text not null check (char_length(entry_key) between 1 and 100),
  source text not null check (source in ('simons', 'wardrobe')),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) < 2500000),
  saved boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (owner_id, entry_key)
);
create index if not exists lookrdy_library_history_idx on public.lookrdy_library (owner_id, created_at desc);
alter table public.lookrdy_library enable row level security;
revoke all on public.lookrdy_library from anon, authenticated;
grant select, insert, update, delete on public.lookrdy_library to authenticated;
drop policy if exists "users manage own looks" on public.lookrdy_library;
create policy "users manage own looks" on public.lookrdy_library
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

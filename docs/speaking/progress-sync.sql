-- Run once in your own Supabase project's SQL Editor.
-- Stores only read/completed flags, never recordings, lesson answers or scores.
create table if not exists public.speaking_read_status (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (
    lesson_id ~ '^legacy:0[1-6]-(0[1-9]|1[0-9]|2[01])$'
    or lesson_id ~ '^(am|pm):day-(0[1-9]|[1-5][0-9]|6[0-3])$'
  ),
  completed boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.speaking_read_status enable row level security;
revoke all on public.speaking_read_status from anon;
grant select, insert, update on public.speaking_read_status to authenticated;
drop policy if exists speaking_read_status_select on public.speaking_read_status;
create policy speaking_read_status_select on public.speaking_read_status
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists speaking_read_status_insert on public.speaking_read_status;
create policy speaking_read_status_insert on public.speaking_read_status
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists speaking_read_status_update on public.speaking_read_status;
create policy speaking_read_status_update on public.speaking_read_status
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create or replace function public.speaking_read_status_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists speaking_read_status_touch on public.speaking_read_status;
create trigger speaking_read_status_touch
before update on public.speaking_read_status
for each row execute function public.speaking_read_status_touch_updated_at();

-- Confirm row-level security is ON before using the public publishable key.
-- Never publish Supabase secret/service_role keys in GitHub Pages.

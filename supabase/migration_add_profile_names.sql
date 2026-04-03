-- Spusť celý tento skript v Supabase: SQL Editor → New query → Run
-- (Dashboard → SQL Editor)

alter table public.profiles
  add column if not exists first_name text;

alter table public.profiles
  add column if not exists last_name text;

comment on column public.profiles.first_name is 'User first name — collect after email signup';
comment on column public.profiles.last_name is 'User last name';

-- Obnovení cache API (PostgREST), aby šly sloupce hned používat:
notify pgrst, 'reload schema';

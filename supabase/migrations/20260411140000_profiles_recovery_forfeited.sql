-- One-strike recovery trial: after a failed recovery session, no more /recovery until keys > 0 again.
alter table public.profiles
  add column if not exists recovery_forfeited boolean not null default false;

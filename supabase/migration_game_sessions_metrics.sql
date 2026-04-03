-- Run in Supabase SQL editor if game_sessions already exists without these columns.
alter table public.game_sessions
  add column if not exists position_score int,
  add column if not exists audio_score int,
  add column if not exists duration_seconds int,
  add column if not exists played_at_hour int;

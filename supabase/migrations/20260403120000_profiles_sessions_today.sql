-- Daily session quota (14 per UTC day)
ALTER TABLE public.profiles
  ADD COLUMN sessions_today int not null default 0,
  ADD COLUMN last_session_date date;

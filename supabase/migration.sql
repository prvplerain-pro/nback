-- ============================================================
-- N-Back full schema — run this in Supabase SQL editor
-- ============================================================

-- profiles table (extends Supabase auth.users)
create table public.profiles (
  id                      uuid references auth.users(id) on delete cascade primary key,
  email                   text not null,
  keys                    int not null default 3 check (keys >= 0 and keys <= 3),
  high_score              int not null default 1,
  consecutive_high_scores int not null default 0,
  last_played_at          timestamptz,
  streak_days             int not null default 0,
  subscription_status     text not null default 'inactive'
                            check (subscription_status in ('active', 'inactive', 'canceled')),
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  -- referral system
  referral_code           text unique,
  referred_by             uuid references public.profiles(id),
  referral_bonus_given    boolean not null default false,
  created_at              timestamptz not null default now()
);

-- game sessions log
create table public.game_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  n_level    int not null,
  score      int not null,   -- accuracy percentage 0-100
  trials     int not null,
  created_at timestamptz not null default now()
);

-- ── RLS ────────────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.game_sessions enable row level security;

create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users read own sessions"
  on public.game_sessions for select using (auth.uid() = user_id);

create policy "Users insert own sessions"
  on public.game_sessions for insert with check (auth.uid() = user_id);

-- service role bypasses RLS automatically (used in webhooks/cron)

-- ── Auto-create profile on signup ──────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, referral_code)
  values (
    new.id,
    new.email,
    upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Referral code lookup (public, no auth needed) ──────────
-- Allows checking a referral code before signup
create policy "Anyone can read referral codes"
  on public.profiles for select
  using (true);

-- Tighten: actually only expose referral_code column publicly via a view
-- Drop the broad policy above and use a secure view instead:
drop policy if exists "Anyone can read referral codes" on public.profiles;

create or replace view public.referral_codes as
  select id, referral_code from public.profiles;

-- Grant anon read access to the view only
grant select on public.referral_codes to anon, authenticated;

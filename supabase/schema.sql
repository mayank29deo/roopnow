-- Roop platform schema (idempotent — safe to re-run)
-- Run in Supabase SQL Editor: Database → SQL Editor → New Query → paste → Run.

-- ============================================================
-- 1. CORE TABLES
-- ============================================================

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null,
  phone      text,
  role       text not null default 'customer' check (role in ('customer', 'artist', 'admin')),
  created_at timestamptz not null default now()
);

-- Existing installs: widen the role check to include 'admin'.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('customer', 'artist', 'admin'));

create table if not exists public.artists (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references public.profiles(id) on delete cascade,
  display_name  text not null,
  tagline       text not null default '',
  bio           text not null default '',
  city          text not null default '',
  area          text not null default '',
  avatar_url    text not null default '',
  cover_url     text not null default '',
  specialties   text not null default '',
  years_exp     int  not null default 0,
  instagram     text,
  featured      boolean not null default false,
  verified      boolean not null default false,
  -- professional details
  experience_summary text default '',
  travel_radius_km  int default 0,
  -- payments & settlement
  upi_id            text,
  bank_account_name text,
  bank_ifsc         text,
  bank_account_no   text,
  -- cancellation policy (free text artists fill in)
  cancellation_policy text default '',
  -- declaration (boolean agreement)
  agreed_to_terms boolean default false,
  -- skin tones the artist has expertise with (comma-separated tags: Brown, Dusky, Wheatish, Light)
  skin_tone_expertise text not null default '',
  -- analytics
  profile_views int not null default 0,
  created_at    timestamptz not null default now()
);

-- Bring existing installs up to date with the new columns (no-ops if already present).
alter table public.artists add column if not exists experience_summary text default '';
alter table public.artists add column if not exists travel_radius_km int default 0;
alter table public.artists add column if not exists upi_id text;
alter table public.artists add column if not exists bank_account_name text;
alter table public.artists add column if not exists bank_ifsc text;
alter table public.artists add column if not exists bank_account_no text;
alter table public.artists add column if not exists cancellation_policy text default '';
alter table public.artists add column if not exists agreed_to_terms boolean default false;
alter table public.artists add column if not exists skin_tone_expertise text not null default '';
alter table public.artists add column if not exists profile_views int not null default 0;

create table if not exists public.portfolio_items (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references public.artists(id) on delete cascade,
  image_url  text not null,
  caption    text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.artists(id) on delete cascade,
  name        text not null,
  description text not null default '',
  duration    int  not null default 60,
  price       int  not null default 0,
  category    text not null default 'Bridal',
  created_at  timestamptz not null default now()
);

create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  artist_id   uuid not null references public.artists(id) on delete cascade,
  service_id  uuid not null references public.services(id) on delete restrict,
  date        timestamptz not null,
  time_slot   text not null,
  status      text not null default 'pending',
  total_price int  not null,
  notes       text,
  address     text,
  event_name  text,
  budget      int,
  customer_phone text,
  rejection_reason text,
  created_at  timestamptz not null default now()
);

-- Existing installs: widen the status check and add new columns.
alter table public.bookings add column if not exists event_name text;
alter table public.bookings add column if not exists budget int;
alter table public.bookings add column if not exists customer_phone text;
alter table public.bookings add column if not exists rejection_reason text;
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending','accepted','rejected','cancelled','completed'));
alter table public.bookings alter column status set default 'pending';

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  artist_id  uuid not null references public.artists(id) on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  comment    text not null default '',
  created_at timestamptz not null default now()
);

-- Artists block specific dates they're unavailable (vacation, personal).
create table if not exists public.artist_blocked_dates (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.artists(id) on delete cascade,
  blocked_date date not null,
  reason       text,
  created_at   timestamptz not null default now(),
  unique (artist_id, blocked_date)
);

-- Artists manually schedule off-platform bookings so those slots block the calendar.
create table if not exists public.artist_events (
  id             uuid primary key default gen_random_uuid(),
  artist_id      uuid not null references public.artists(id) on delete cascade,
  event_date     date not null,
  start_time     time not null,
  end_time       time not null,
  event_period   text,
  event_name     text not null default '',
  location       text,
  customer_name  text,
  customer_phone text,
  notes          text,
  created_at     timestamptz not null default now()
);

-- Monthly listing-fee subscriptions.
create table if not exists public.artist_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.artists(id) on delete cascade,
  period_month date not null,      -- first day of the billed month
  amount       int  not null default 699,
  status       text not null default 'pending' check (status in ('pending','paid','failed')),
  razorpay_order_id   text,
  razorpay_payment_id text,
  paid_at      timestamptz,
  created_at   timestamptz not null default now(),
  unique (artist_id, period_month)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================
create index if not exists idx_artists_featured on public.artists(featured);
create index if not exists idx_artists_city on public.artists(city);
create index if not exists idx_portfolio_artist on public.portfolio_items(artist_id, sort_order);
create index if not exists idx_services_artist on public.services(artist_id);
create index if not exists idx_bookings_user on public.bookings(user_id, date desc);
create index if not exists idx_bookings_artist on public.bookings(artist_id, date desc);
create index if not exists idx_bookings_artist_date on public.bookings(artist_id, date);
create index if not exists idx_reviews_artist on public.reviews(artist_id, created_at desc);
create index if not exists idx_blocked_dates_artist on public.artist_blocked_dates(artist_id, blocked_date);
create index if not exists idx_events_artist on public.artist_events(artist_id, event_date);
create index if not exists idx_subs_artist on public.artist_subscriptions(artist_id, period_month desc);

-- ============================================================
-- 3. TRIGGER: auto-create profile on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do nothing;

  if coalesce(new.raw_user_meta_data->>'role', 'customer') = 'artist' then
    insert into public.artists (user_id, display_name, tagline, bio, city, avatar_url, cover_url, specialties)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', 'New artist'),
      'New artist on Roop',
      'Tell us about your style and experience.',
      'Bengaluru',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=80',
      'Bridal,Party,Editorial'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4. AVAILABILITY VIEW (computed per-day state per artist)
-- Not strictly required (we compute in app), but handy for SQL-level queries.
-- ============================================================
create or replace view public.artist_daily_availability as
with booking_days as (
  select artist_id, date_trunc('day', date)::date as day, count(*)::int as c
  from public.bookings
  where status in ('pending','accepted','confirmed')
  group by artist_id, date_trunc('day', date)::date
),
event_days as (
  select artist_id, event_date as day, count(*)::int as c
  from public.artist_events
  group by artist_id, event_date
),
combined as (
  select artist_id, day, sum(c)::int as occupied
  from (
    select * from booking_days
    union all
    select * from event_days
  ) u
  group by artist_id, day
)
select
  c.artist_id,
  c.day,
  c.occupied,
  coalesce(b.blocked, false) as blocked,
  case
    when coalesce(b.blocked, false) then 'red'
    when c.occupied >= 3 then 'red'
    when c.occupied >= 1 then 'yellow'
    else 'green'
  end as status
from combined c
left join (
  select artist_id, blocked_date as day, true as blocked
  from public.artist_blocked_dates
) b using (artist_id, day);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles             enable row level security;
alter table public.artists              enable row level security;
alter table public.portfolio_items      enable row level security;
alter table public.services             enable row level security;
alter table public.bookings             enable row level security;
alter table public.reviews              enable row level security;
alter table public.artist_blocked_dates enable row level security;
alter table public.artist_events        enable row level security;
alter table public.artist_subscriptions enable row level security;

-- profiles
drop policy if exists "profiles_read_all" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- artists
drop policy if exists "artists_read_all" on public.artists;
drop policy if exists "artists_update_own" on public.artists;
drop policy if exists "artists_insert_own" on public.artists;
drop policy if exists "artists_delete_own" on public.artists;
create policy "artists_read_all" on public.artists for select using (true);
create policy "artists_insert_own" on public.artists for insert with check (auth.uid() = user_id);
create policy "artists_update_own" on public.artists for update using (auth.uid() = user_id);
create policy "artists_delete_own" on public.artists for delete using (auth.uid() = user_id);

-- portfolio_items
drop policy if exists "portfolio_read_all" on public.portfolio_items;
drop policy if exists "portfolio_write_own" on public.portfolio_items;
create policy "portfolio_read_all" on public.portfolio_items for select using (true);
create policy "portfolio_write_own" on public.portfolio_items for all
  using (exists (select 1 from public.artists a where a.id = portfolio_items.artist_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.artists a where a.id = portfolio_items.artist_id and a.user_id = auth.uid()));

-- services
drop policy if exists "services_read_all" on public.services;
drop policy if exists "services_write_own" on public.services;
create policy "services_read_all" on public.services for select using (true);
create policy "services_write_own" on public.services for all
  using (exists (select 1 from public.artists a where a.id = services.artist_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.artists a where a.id = services.artist_id and a.user_id = auth.uid()));

-- bookings
drop policy if exists "bookings_read_own" on public.bookings;
drop policy if exists "bookings_insert_auth" on public.bookings;
drop policy if exists "bookings_update_parties" on public.bookings;
create policy "bookings_read_own" on public.bookings for select using (
  auth.uid() = user_id
  or exists (select 1 from public.artists a where a.id = bookings.artist_id and a.user_id = auth.uid())
);
create policy "bookings_insert_auth" on public.bookings for insert with check (auth.uid() = user_id);
create policy "bookings_update_parties" on public.bookings for update using (
  auth.uid() = user_id
  or exists (select 1 from public.artists a where a.id = bookings.artist_id and a.user_id = auth.uid())
);

-- reviews
drop policy if exists "reviews_read_all" on public.reviews;
drop policy if exists "reviews_insert_auth" on public.reviews;
drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_read_all" on public.reviews for select using (true);
create policy "reviews_insert_auth" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

-- blocked dates: public read (so calendar shows red), artist-only write
drop policy if exists "blocked_read_all" on public.artist_blocked_dates;
drop policy if exists "blocked_write_own" on public.artist_blocked_dates;
create policy "blocked_read_all" on public.artist_blocked_dates for select using (true);
create policy "blocked_write_own" on public.artist_blocked_dates for all
  using (exists (select 1 from public.artists a where a.id = artist_blocked_dates.artist_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.artists a where a.id = artist_blocked_dates.artist_id and a.user_id = auth.uid()));

-- artist events: public can read only occupancy (we'll expose a safe view client-side), artist writes own
drop policy if exists "events_read_all" on public.artist_events;
drop policy if exists "events_write_own" on public.artist_events;
create policy "events_read_all" on public.artist_events for select using (true);
create policy "events_write_own" on public.artist_events for all
  using (exists (select 1 from public.artists a where a.id = artist_events.artist_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.artists a where a.id = artist_events.artist_id and a.user_id = auth.uid()));

-- subscriptions: artist reads own only; writes come from service role (webhook)
drop policy if exists "subs_read_own" on public.artist_subscriptions;
create policy "subs_read_own" on public.artist_subscriptions for select
  using (exists (select 1 from public.artists a where a.id = artist_subscriptions.artist_id and a.user_id = auth.uid()));

-- ============================================================
-- 6. HELPER: increment profile view (safe RPC callable with anon key)
-- ============================================================
create or replace function public.increment_profile_view(aid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.artists set profile_views = profile_views + 1 where id = aid;
$$;

-- ============================================================
-- 7. STORAGE BUCKETS  (artist portfolio + avatar/cover uploads)
-- ============================================================
-- Public buckets so URLs are directly fetchable from <img> tags.
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- Public read for both
drop policy if exists "storage_read_portfolio" on storage.objects;
create policy "storage_read_portfolio" on storage.objects
  for select using (bucket_id = 'portfolio');

drop policy if exists "storage_read_avatars" on storage.objects;
create policy "storage_read_avatars" on storage.objects
  for select using (bucket_id = 'avatars');

-- Authenticated artists can write/delete only inside a folder named after their auth.uid()
drop policy if exists "storage_write_portfolio_own" on storage.objects;
create policy "storage_write_portfolio_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "storage_delete_portfolio_own" on storage.objects;
create policy "storage_delete_portfolio_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "storage_write_avatars_own" on storage.objects;
create policy "storage_write_avatars_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "storage_update_avatars_own" on storage.objects;
create policy "storage_update_avatars_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "storage_delete_avatars_own" on storage.objects;
create policy "storage_delete_avatars_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create extension if not exists "uuid-ossp";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_pin_attempts (
  user_id uuid primary key references public.admin_users(user_id) on delete cascade,
  attempts integer not null default 0 check (attempts between 0 and 5),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz
);

create table if not exists public.admin_pin_ip_attempts (
  request_key text primary key,
  attempts integer not null default 0 check (attempts between 0 and 5),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz
);
create index if not exists admin_pin_ip_attempts_window_idx
on public.admin_pin_ip_attempts (window_started_at);

create table if not exists public.homepage_settings (
  id uuid primary key default uuid_generate_v4(),
  store_name text not null default 'Mobile Gallary',
  tagline text not null default 'Mobile care, made simple.',
  hero_title text not null default 'Your phone deserves better care.',
  hero_description text not null default 'Discover trusted mobile devices, thoughtful accessories, and expert repairs from your neighborhood phone specialists.',
  cta_primary text not null default 'Talk to our team',
  cta_secondary text not null default 'Explore services',
  currency_code text not null default 'INR' check (currency_code in ('INR', 'USD', 'EUR', 'GBP')),
  enable_promotions boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_settings
add column if not exists currency_code text not null default 'INR'
check (currency_code in ('INR', 'USD', 'EUR', 'GBP'));
alter table public.homepage_settings add column if not exists shop_image_url text;
alter table public.homepage_settings add column if not exists shop_image_alt text default 'Mobile Gallary shop';

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text,
  category text,
  price numeric(10,2) not null default 0 check (price >= 0),
  condition text,
  description text,
  image_url text,
  availability text not null default 'available' check (availability in ('available', 'unavailable', 'coming_soon')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products add column if not exists availability text not null default 'available';
alter table public.products drop constraint if exists products_availability_check;
alter table public.products add constraint products_availability_check check (availability in ('available', 'unavailable', 'coming_soon'));

create table if not exists public.repair_services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric(10,2) not null default 0 check (price >= 0),
  duration text,
  description text,
  featured boolean not null default false,
  image_url text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  bio text,
  image_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_details (
  id uuid primary key default uuid_generate_v4(),
  phone text,
  email text,
  address text,
  whatsapp text,
  opening_hours text,
  map_url text,
  instagram_url text,
  facebook_url text,
  shop_image_url text,
  shop_image_alt text default 'Mobile Gallary shop',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.shop_gallery (
  id uuid primary key default uuid_generate_v4(),
  page text not null check (page in ('home', 'visit')),
  image_url text not null,
  alt_text text not null default 'Mobile Gallary shop',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.shop_gallery enable row level security;
grant select on public.shop_gallery to anon, authenticated;
grant insert, update, delete on public.shop_gallery to authenticated;
drop policy if exists "Public can read shop gallery" on public.shop_gallery;
create policy "Public can read shop gallery" on public.shop_gallery for select to anon, authenticated using (true);
drop policy if exists "Admins manage shop gallery" on public.shop_gallery;
create policy "Admins manage shop gallery" on public.shop_gallery for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
alter table public.contact_details add column if not exists shop_image_url text;
alter table public.contact_details add column if not exists shop_image_alt text default 'Mobile Gallary shop';

create table if not exists public.privacy_policies (
  id uuid primary key default uuid_generate_v4(),
  title text not null default 'Privacy Policy',
  content text not null default 'Add your store privacy policy.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.terms (
  id uuid primary key default uuid_generate_v4(),
  title text not null default 'Terms and Conditions',
  content text not null default 'Add your store terms and conditions.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists homepage_settings_single_row
on public.homepage_settings ((true));
create unique index if not exists contact_details_single_row
on public.contact_details ((true));
create unique index if not exists privacy_policies_single_row
on public.privacy_policies ((true));
create unique index if not exists terms_single_row
on public.terms ((true));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.consume_admin_pin_attempt(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_row public.admin_pin_attempts%rowtype;
begin
  insert into public.admin_pin_attempts (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into attempt_row
  from public.admin_pin_attempts
  where user_id = p_user_id
  for update;

  if attempt_row.locked_until is not null and attempt_row.locked_until > pg_catalog.now() then
    return false;
  end if;

  if attempt_row.window_started_at <= pg_catalog.now() - interval '15 minutes' then
    update public.admin_pin_attempts
    set attempts = 0, window_started_at = pg_catalog.now(), locked_until = null
    where user_id = p_user_id;
    attempt_row.attempts := 0;
  end if;

  if attempt_row.attempts >= 5 then
    update public.admin_pin_attempts
    set attempts = 0, window_started_at = pg_catalog.now(),
        locked_until = pg_catalog.now() + interval '15 minutes'
    where user_id = p_user_id;
    return false;
  end if;

  update public.admin_pin_attempts
  set attempts = attempts + 1,
      locked_until = case
        when attempts + 1 >= 5 then pg_catalog.now() + interval '15 minutes'
        else null
      end
  where user_id = p_user_id;

  return true;
end;
$$;

create or replace function public.clear_admin_pin_attempts(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.admin_pin_attempts where user_id = p_user_id;
$$;

create or replace function public.consume_admin_pin_ip_attempt(p_request_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_row public.admin_pin_ip_attempts%rowtype;
begin
  insert into public.admin_pin_ip_attempts (request_key)
  values (p_request_key)
  on conflict (request_key) do nothing;

  select * into attempt_row
  from public.admin_pin_ip_attempts
  where request_key = p_request_key
  for update;

  if attempt_row.locked_until is not null and attempt_row.locked_until > pg_catalog.now() then
    return false;
  end if;

  if attempt_row.window_started_at <= pg_catalog.now() - interval '15 minutes' then
    update public.admin_pin_ip_attempts
    set attempts = 0, window_started_at = pg_catalog.now(), locked_until = null
    where request_key = p_request_key;
    attempt_row.attempts := 0;
  end if;

  if attempt_row.attempts >= 5 then
    update public.admin_pin_ip_attempts
    set attempts = 0, window_started_at = pg_catalog.now(),
        locked_until = pg_catalog.now() + interval '15 minutes'
    where request_key = p_request_key;
    return false;
  end if;

  update public.admin_pin_ip_attempts
  set attempts = attempts + 1,
      locked_until = case
        when attempts + 1 >= 5 then pg_catalog.now() + interval '15 minutes'
        else null
      end
  where request_key = p_request_key;

  return true;
end;
$$;

create or replace function public.clear_admin_pin_ip_attempts(p_request_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.admin_pin_ip_attempts where request_key = p_request_key;
$$;

revoke all on function public.consume_admin_pin_attempt(uuid) from public, anon, authenticated;
revoke all on function public.clear_admin_pin_attempts(uuid) from public, anon, authenticated;
revoke all on function public.consume_admin_pin_ip_attempt(text) from public, anon, authenticated;
revoke all on function public.clear_admin_pin_ip_attempts(text) from public, anon, authenticated;
grant execute on function public.consume_admin_pin_attempt(uuid) to service_role;
grant execute on function public.clear_admin_pin_attempts(uuid) to service_role;
grant execute on function public.consume_admin_pin_ip_attempt(text) to service_role;
grant execute on function public.clear_admin_pin_ip_attempts(text) to service_role;

drop trigger if exists homepage_settings_updated_at on public.homepage_settings;
create trigger homepage_settings_updated_at before update on public.homepage_settings
for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
for each row execute function public.set_updated_at();
drop trigger if exists repair_services_updated_at on public.repair_services;
create trigger repair_services_updated_at before update on public.repair_services
for each row execute function public.set_updated_at();
drop trigger if exists members_updated_at on public.members;
create trigger members_updated_at before update on public.members
for each row execute function public.set_updated_at();
drop trigger if exists contact_details_updated_at on public.contact_details;
create trigger contact_details_updated_at before update on public.contact_details
for each row execute function public.set_updated_at();
drop trigger if exists privacy_policies_updated_at on public.privacy_policies;
create trigger privacy_policies_updated_at before update on public.privacy_policies
for each row execute function public.set_updated_at();
drop trigger if exists terms_updated_at on public.terms;
create trigger terms_updated_at before update on public.terms
for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.admin_pin_attempts enable row level security;
alter table public.admin_pin_ip_attempts enable row level security;
revoke all on public.admin_pin_attempts, public.admin_pin_ip_attempts from public, anon, authenticated;
grant all on public.admin_pin_attempts, public.admin_pin_ip_attempts to service_role;
alter table public.homepage_settings enable row level security;
alter table public.products enable row level security;
alter table public.repair_services enable row level security;
alter table public.members enable row level security;
alter table public.contact_details enable row level security;
alter table public.privacy_policies enable row level security;
alter table public.terms enable row level security;

grant select on public.admin_users to authenticated;
revoke insert, update, delete on public.admin_users from anon, authenticated;
grant select on public.homepage_settings, public.products, public.repair_services,
  public.members, public.contact_details, public.privacy_policies, public.terms to anon, authenticated;
grant insert, update, delete on public.homepage_settings, public.products, public.repair_services,
  public.members, public.contact_details, public.privacy_policies, public.terms to authenticated;

drop policy if exists "Allow authenticated admins to manage homepage settings" on public.homepage_settings;
drop policy if exists "Allow authenticated admins to manage products" on public.products;
drop policy if exists "Allow authenticated admins to manage repair services" on public.repair_services;
drop policy if exists "Allow authenticated admins to manage members" on public.members;
drop policy if exists "Allow authenticated admins to manage contact details" on public.contact_details;
drop policy if exists "Allow authenticated admins to manage privacy policy" on public.privacy_policies;
drop policy if exists "Allow authenticated admins to manage terms" on public.terms;

drop policy if exists "Admin can read own admin row" on public.admin_users;
create policy "Admin can read own admin row" on public.admin_users
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Public can read homepage settings" on public.homepage_settings;
create policy "Public can read homepage settings" on public.homepage_settings
for select to anon, authenticated using (true);
drop policy if exists "Admin manages homepage settings" on public.homepage_settings;
create policy "Admin manages homepage settings" on public.homepage_settings
for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products
for select to anon, authenticated using (true);
drop policy if exists "Admin manages products" on public.products;
create policy "Admin manages products" on public.products
for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Public can read repair services" on public.repair_services;
create policy "Public can read repair services" on public.repair_services
for select to anon, authenticated using (true);
drop policy if exists "Admin manages repair services" on public.repair_services;
create policy "Admin manages repair services" on public.repair_services
for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Public can read members" on public.members;
create policy "Public can read members" on public.members
for select to anon, authenticated using (true);
drop policy if exists "Admin manages members" on public.members;
create policy "Admin manages members" on public.members
for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Public can read contact details" on public.contact_details;
create policy "Public can read contact details" on public.contact_details
for select to anon, authenticated using (true);
drop policy if exists "Admin manages contact details" on public.contact_details;
create policy "Admin manages contact details" on public.contact_details
for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Public can read privacy policy" on public.privacy_policies;
create policy "Public can read privacy policy" on public.privacy_policies
for select to anon, authenticated using (true);
drop policy if exists "Admin manages privacy policy" on public.privacy_policies;
create policy "Admin manages privacy policy" on public.privacy_policies
for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Public can read terms" on public.terms;
create policy "Public can read terms" on public.terms
for select to anon, authenticated using (true);
drop policy if exists "Admin manages terms" on public.terms;
create policy "Admin manages terms" on public.terms
for all to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-assets',
  'shop-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view shop assets" on storage.objects;
create policy "Public can view shop assets" on storage.objects
for select to anon, authenticated using (bucket_id = 'shop-assets');
drop policy if exists "Admins can upload shop assets" on storage.objects;
create policy "Admins can upload shop assets" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'shop-assets'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);
drop policy if exists "Admins can update shop assets" on storage.objects;
create policy "Admins can update shop assets" on storage.objects
for update to authenticated
using (bucket_id = 'shop-assets' and exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (bucket_id = 'shop-assets' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
drop policy if exists "Admins can delete shop assets" on storage.objects;
create policy "Admins can delete shop assets" on storage.objects
for delete to authenticated
using (bucket_id = 'shop-assets' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- Optional starter content for a first-time demo. These inserts are idempotent and
-- never overwrite content that an administrator has already entered.
insert into public.homepage_settings (
  store_name, tagline, hero_title, hero_description, cta_primary, cta_secondary, currency_code, enable_promotions
)
select
  'Mobile Gallary',
  'Mobile care, made simple.',
  'Your phone deserves better care.',
  'Discover trusted mobile devices, thoughtful accessories, and expert repairs from your neighborhood phone specialists.',
  'Talk to our team',
  'Explore services',
  'INR',
  true
where not exists (select 1 from public.homepage_settings);

insert into public.products (name, brand, category, price, condition, description, featured)
select *
from (values
  ('iPhone 15', 'Apple', 'Smartphone', 69999.00, 'New', 'A powerful everyday phone with a bright display and dependable camera.', true),
  ('Galaxy A55', 'Samsung', 'Smartphone', 38999.00, 'New', 'A balanced smartphone for work, photography, and daily entertainment.', true),
  ('USB-C Fast Charger', 'Mobile Gallary', 'Accessory', 1299.00, 'New', 'A compact charger for compatible phones and everyday travel.', false)
) as demo(name, brand, category, price, condition, description, featured)
where not exists (
  select 1 from public.products existing where existing.name = demo.name
);

insert into public.repair_services (name, price, duration, description, featured, icon)
select *
from (values
  ('Screen replacement', 2499.00, 'Same day', 'Careful screen replacement for common smartphone models.', true, 'screen'),
  ('Battery replacement', 1499.00, '1–2 hours', 'Restore dependable battery life with a quality replacement.', true, 'battery'),
  ('Charging port cleaning', 399.00, '30 minutes', 'Professional cleaning and inspection for charging issues.', false, 'zap')
) as demo(name, price, duration, description, featured, icon)
where not exists (
  select 1 from public.repair_services existing where existing.name = demo.name
);

insert into public.members (name, role, bio, featured)
select *
from (values
  ('Aarav Sharma', 'Founder & device specialist', 'Helping customers choose, maintain, and enjoy the right device.', true),
  ('Meera Das', 'Repair technician', 'Focused on careful diagnostics and reliable phone repairs.', true)
) as demo(name, role, bio, featured)
where not exists (
  select 1 from public.members existing where existing.name = demo.name
);

insert into public.contact_details (phone, email, address, whatsapp, opening_hours)
select
  '+91 98765 43210',
  'hello@mobilegallary.example',
  'Main Market, Your City',
  '+91 98765 43210',
  'Monday–Saturday, 10:00 AM–8:00 PM'
where not exists (select 1 from public.contact_details);

insert into public.privacy_policies (title, content)
select 'Privacy Policy', 'This demo policy can be replaced from the admin dashboard.'
where not exists (select 1 from public.privacy_policies);

insert into public.terms (title, content)
select 'Terms and Conditions', 'These demo terms can be replaced from the admin dashboard.'
where not exists (select 1 from public.terms);

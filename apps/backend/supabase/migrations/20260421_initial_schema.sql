create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  first_name text not null default '',
  last_name text not null default '',
  company text not null default '',
  job_title text not null default '',
  notes text not null default '',
  birthday date,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_emails (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  label text not null default 'other',
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_phones (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  e164_phone text not null,
  label text not null default 'other',
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_addresses (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  line_1 text not null default '',
  line_2 text not null default '',
  city text not null default '',
  region text not null default '',
  country text not null default '',
  postal_code text not null default '',
  label text not null default 'home',
  created_at timestamptz not null default now()
);

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#4f46e5',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_labels (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (contact_id, label_id)
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_emails enable row level security;
alter table public.contact_phones enable row level security;
alter table public.contact_addresses enable row level security;
alter table public.labels enable row level security;
alter table public.contact_labels enable row level security;

create policy "profiles own rows" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "contacts own rows" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contact_emails own rows" on public.contact_emails
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contact_phones own rows" on public.contact_phones
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contact_addresses own rows" on public.contact_addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "labels own rows" on public.labels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contact_labels own rows" on public.contact_labels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create index if not exists contacts_user_updated_idx
  on public.contacts (user_id, updated_at desc);

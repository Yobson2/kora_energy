-- Postgres schema for the production `Store` adapter.
--
-- The concept ships with a JSON-file adapter (app/server/store.ts). This is the
-- relational shape the same domain maps onto  app/lib/domain.ts is the
-- source of truth for field names and allowed values. Nothing above the store
-- interface changes when the adapter is swapped.

create type lead_source as enum ('quote', 'contact', 'calculator');
create type lead_status as enum ('new', 'contacted', 'site-visit', 'proposal', 'won', 'lost');

create table leads (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,                -- "KE-2610-4F7Q"
  source          lead_source not null,
  status          lead_status not null default 'new',
  contact_name    text not null,
  contact_email   text not null,
  contact_phone   text,
  contact_company text,
  -- Site and energy inputs as submitted. Kept as columns, not JSON, because
  -- the back office filters and reports on them.
  segment         text,
  location        text,
  solution        text,
  timeline        text,
  monthly_kwh     numeric,
  monthly_bill_xof numeric,
  generator_hours_per_week numeric,
  roof_area_m2    numeric,
  topic           text,
  message         text,
  -- Frozen server-side estimate at submission time (EstimateSnapshot).
  estimate        jsonb,
  consent_at      timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index leads_status_created_idx on leads (status, created_at desc);
create index leads_source_created_idx on leads (source, created_at desc);
create index leads_email_idx on leads (lower(contact_email));

create table lead_activity (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads (id) on delete cascade,
  kind       text not null check (kind in ('created', 'status', 'note')),
  text       text not null,
  author     text not null,
  created_at timestamptz not null default now()
);

create index lead_activity_lead_idx on lead_activity (lead_id, created_at);

create table projects (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  title                  text not null,
  client                 text not null,
  segment                text not null,
  location               text not null,
  area                   text not null,
  year                   int not null,
  system_kwp             numeric not null,
  battery_kwh            numeric not null default 0,
  annual_production_kwh  numeric not null,
  solar_share            numeric not null check (solar_share between 0 and 1),
  co2_tonnes_per_year    numeric not null,
  summary                text not null,
  challenge              text not null,
  approach               text not null,
  results                jsonb not null default '[]',
  roof_width_m           numeric not null,
  roof_depth_m           numeric not null,
  published              boolean not null default false,
  featured               boolean not null default false,
  updated_at             timestamptz not null default now()
);

create index projects_published_idx on projects (published, featured desc, year desc);

-- Back-office users, replacing the single env-configured account.
create table admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text not null,
  password_hash text not null,   -- "scrypt$salt$hash", see scripts/hash-password.mjs
  role          text not null default 'sales' check (role in ('admin', 'sales')),
  created_at    timestamptz not null default now()
);

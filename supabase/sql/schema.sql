-- FILOG schema (apply in Supabase SQL Editor)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create type account_type as enum ('cash','checking','credit_card','loan','brokerage');

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type account_type not null,
  currency text not null default 'USD',
  created_at timestamptz default now()
);
create index if not exists accounts_user_idx on public.accounts(user_id);

create type category_kind as enum ('income','expense');

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind category_kind not null,
  parent_id uuid null references public.categories(id) on delete set null
);
create unique index if not exists categories_unique_name_per_user on public.categories(user_id, name, kind);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_name text,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.import_rows (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  raw_json jsonb not null,
  status text not null default 'pending',
  error text
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  posted_at date not null,
  description text not null,
  amount numeric not null,
  category_id uuid null references public.categories(id) on delete set null,
  notes text,
  external_id text,
  import_job_id uuid null references public.import_jobs(id) on delete set null
);
create index if not exists transactions_user_date_idx on public.transactions(user_id, posted_at desc);
create index if not exists transactions_account_idx on public.transactions(account_id);
create unique index if not exists transactions_idempotency_idx on public.transactions(user_id, account_id, posted_at, amount, coalesce(external_id,''));

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null
);
create index if not exists budgets_user_period_idx on public.budgets(user_id, period_start, period_end);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount numeric not null
);
create unique index if not exists budget_items_unique_idx on public.budget_items(budget_id, category_id);

create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid null references public.accounts(id) on delete set null,
  symbol text not null,
  quantity numeric not null,
  cost_basis numeric null
);
create index if not exists holdings_user_idx on public.holdings(user_id);
create index if not exists holdings_symbol_idx on public.holdings(symbol);

create table if not exists public.prices (
  symbol text primary key,
  price numeric not null,
  currency text not null default 'USD',
  asof timestamptz not null default now()
);



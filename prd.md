# FILOG — Product Requirements Document (PRD)

## Overview
FILOG is a cloud‑hosted, multi‑user personal finance app focused on privacy and control. MVP emphasizes manual-first workflows with CSV imports, budgeting, transaction analysis, net worth tracking (including equities), and a clean dashboard. Authentication uses Google via Supabase. Data storage uses Supabase Postgres with strict Row Level Security (RLS). Stock prices are fetched via a Supabase Edge Function using Alpha Vantage (free tier) with database caching.

## Problem & Goals
- Problem: Individuals want a private, reliable finance tracker without forced bank connections or paid aggregators.
- Goals:
  - Simple onboarding with Google sign‑in.
  - Manual-first: fast CSV import from banks/brokerages; robust mapping and validation.
  - Clear transaction review, categorization, and budgets with progress.
  - Net worth tracking including cash, liabilities, and stock holdings with current market prices.
  - Insightful dashboard with KPIs and charts.
  - Secure, multi-tenant isolation via RLS.

## Non-Goals (MVP)
- No live bank aggregator (Plaid/TrueLayer/etc.).
- No bill pay or money movement.
- No complex multi-currency accounting (MVP assumes a single base currency per user).

## Personas & Primary Use Cases
- Individual user who wants a private, cloud‑hosted personal finance tool.
- Use cases:
  - Import transactions from CSV, map columns, validate, and ingest.
  - Categorize transactions and create monthly/weekly budgets.
  - Track net worth and stock holdings; see current prices.
  - View dashboard KPIs (spend, income, savings, budget utilization, net worth trend).

## User Stories (MVP)
- As a user, I can sign in with Google and manage only my data.
- As a user, I can create accounts (cash, credit card, loan, brokerage) and categories.
- As a user, I can import a CSV of transactions, map columns, preview, and commit.
- As a user, I can edit and categorize transactions, with filters and search.
- As a user, I can define budgets per category and see utilization.
- As a user, I can add stock holdings (symbol, quantity, cost) and see current value.
- As a user, I can see a dashboard with KPIs and charts.

## Scope
### Included (MVP)
- Google auth (Supabase Auth), basic profile.
- Accounts, categories, transactions, budgets, holdings.
- CSV import pipeline with mapping, validation, idempotency.
- Stock prices via Edge Function (Alpha Vantage), cached in DB with TTL.
- Dashboard, Transactions, Budget, Net Worth views.
- RLS for per‑user isolation and API access via Supabase client.

### Near‑Term
- CSV templates per institution; saved mappings; category rules (auto‑categorization).
- Multi‑currency (FX rates) and base‑currency selection.
- Shared budgets (household) and export reports.

### Out of Scope
- Direct bank aggregator integrations.
- Bill pay, transfers, or alerts/notifications.

## Functional Requirements
### Authentication
- Google sign‑in via Supabase. Session handled client‑side via Supabase JS.
- Sign‑out; display user avatar/email.

### Accounts & Categories
- CRUD for accounts (type: cash, checking, credit_card, loan, brokerage) and categories (income/expense, parent/child optional).

### Transactions
- Transaction model: account_id, posted_at, description, amount (signed), category_id nullable, notes, external_id (for idempotency), import_job_id.
- CSV import: upload → mapping (choose columns) → validation (date/number parsing) → preview → commit.
- Import creates `import_jobs` and `import_rows` with status; rejects duplicates via external_id/account_id/posted_at/amount hash.

### Budgets
- Budget periods (monthly by default). Category allocations and roll‑over flag.
- Views: allocation, spent, remaining, progress.

### Net Worth & Holdings
- Holdings: user_id, symbol, quantity, cost_basis, account_id optional.
- Price lookup: Edge Function `get-prices` supports multiple symbols; caches into `prices(symbol, price, currency, asof)` with TTL.
- Net worth snapshot calculation from accounts, liabilities, holdings.

### Dashboard & Reports
- KPIs: month spend, income, savings, budget utilization, net worth.
- Charts: spend over time, category breakdown, net worth trend.

## Non‑Functional Requirements
- Security: Supabase RLS on all user data tables; least‑privilege policies.
- Performance: CSV imports up to ~50k rows; price lookups batched; caching hit‑rate >80%.
- Reliability: Idempotent imports; retries for price fetch; alert logs on failures.
- Privacy: Only user can access their data; no third‑party banking integrations.

## Data Model (High‑Level)
- users (from Supabase `auth.users`) linked to `public.profiles`.
- accounts(id, user_id, name, type, currency, created_at)
- categories(id, user_id, name, type, parent_id nullable)
- transactions(id, user_id, account_id, posted_at, description, amount, category_id, notes, external_id, import_job_id)
- budgets(id, user_id, period_start, period_end)
- budget_items(id, budget_id, category_id, amount)
- holdings(id, user_id, symbol, quantity, cost_basis, account_id)
- prices(symbol PK, asof TIMESTAMP, price NUMERIC, currency TEXT)
- import_jobs(id, user_id, source_name, status, created_at)
- import_rows(id, import_job_id, raw_json, status, error)

## Integrations
- Supabase: Auth, Postgres, Storage (optional for CSV), Edge Functions.
- Alpha Vantage (free tier) via Edge Function; API key configured as secret; daily limits handled via cache and backoff.

## API & Services
- Client uses Supabase JS with RLS policies enforcing `user_id = auth.uid()`.
- Edge Function `get-prices`:
  - Input: symbols[], baseCurrency (optional).
  - Behavior: check `prices` cache (fresh within TTL); fetch missing from Alpha Vantage; upsert cache; return consolidated response.
  - Rate limiting/backoff and error propagation with safe defaults.

## Telemetry & Observability
- Basic console/edge logs for imports and price fetches; error boundary in UI.

## Acceptance Criteria (MVP)
- Google sign‑in works; user sees their data only.
- CSV import completes with mapping, preview, commit; duplicates prevented; up to 50k rows.
- Transactions view: filter by account/category/date/text; inline categorize/edit.
- Budgets view: set allocations; see utilization; period switching.
- Net Worth view: holdings CRUD; prices populate; total updates.
- Dashboard shows KPIs and charts reflecting underlying data.

## Success Metrics
- Activation: first import within 10 minutes of sign‑up.
- Import success rate >95% (non‑malformed files).
- Weekly active users; price cache hit‑rate >80%; median CSV import time <20s for 10k rows.

## Rollout & Deployment
- Frontend on Vercel; backend on Supabase (project URL, anon key in client; service role only in Edge Functions).
- Environment management via Vercel project settings and Supabase secrets.



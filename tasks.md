# FILOG — End-to-End Task List

This checklist sequences the work to deliver the MVP described in `prd.md`.

## Phase 0 — Project & Environment
- [ ] Confirm repository bootstrapped (Vite + React + TS present)
- [ ] Add environment scaffolding for Supabase keys and Alpha Vantage key

## Phase 1 — Supabase Setup
- [ ] Create Supabase project
- [ ] Enable Google provider in Supabase Auth
- [ ] Capture Project URL, anon key, service role key (server-side only)
- [ ] Create `profiles` table linked to `auth.users`

## Phase 2 — Database Schema
- [ ] Create tables: `accounts`, `categories`, `transactions`, `budgets`, `budget_items`, `holdings`, `prices`, `import_jobs`, `import_rows`
- [ ] Add indexes for common queries (transactions by date/account/category)
- [ ] Add constraints (FKs, uniqueness for idempotency on external_id hash)

## Phase 3 — RLS Policies
- [ ] Enable RLS on all user tables
- [ ] Policies for select/insert/update/delete where `user_id = auth.uid()`

## Phase 4 — Edge Function: get-prices
- [ ] Implement `get-prices` using Alpha Vantage free tier
- [ ] Batch requests, respect limits; cache into `prices` with TTL
- [ ] Expose HTTP endpoint; validate symbols; add basic rate limiting

## Phase 5 — CSV Import Pipeline
- [ ] Upload CSV (client) to either Supabase Storage or in-memory parse
- [ ] Column mapping UI (date, description, amount, debit/credit handling)
- [ ] Validation and preview (parse errors, duplicates)
- [ ] Import commit: create `import_jobs`, `import_rows`, `transactions`

## Phase 6 — Application UI
- [ ] Auth shell (sign-in/out, session guard)
- [ ] Dashboard: KPIs, charts (spend, category, net worth)
- [ ] Transactions: table, filters, inline edit, categorize, import
- [ ] Budgets: category allocations, period switching, progress
- [ ] Net Worth: accounts list, holdings CRUD, price display

## Phase 7 — Configuration & Secrets
- [ ] Wire env vars: SUPABASE_URL, SUPABASE_ANON_KEY, ALPHA_VANTAGE_KEY
- [ ] Configure service role key only in Edge Function context

## Phase 8 — Deployment
- [ ] Set up Vercel project and connect GitHub repo
- [ ] Configure environment variables in Vercel
- [ ] Configure Supabase project URL/domains for OAuth redirects
- [ ] Verify production build, domain, and auth callback

## Phase 9 — QA & Acceptance
- [ ] Validate PRD acceptance criteria end-to-end
- [ ] Import a large CSV (10k rows) smoke test
- [ ] Verify price cache hit-rate and fallback behavior

---

Notes:
- Keep service role secrets only in Edge Functions.
- For Alpha Vantage limits, prefer cached responses and staggered refresh.



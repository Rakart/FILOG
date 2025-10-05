-- Enable RLS and add per-user policies

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.budget_items enable row level security;
alter table public.holdings enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_rows enable row level security;

create policy profiles_is_owner on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy accounts_is_owner on public.accounts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy categories_is_owner on public.categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy transactions_is_owner on public.transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy budgets_is_owner on public.budgets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy budget_items_is_owner on public.budget_items
  for all using (
    exists (
      select 1 from public.budgets b
      where b.id = budget_id and b.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.budgets b
      where b.id = budget_id and b.user_id = auth.uid()
    )
  );

create policy holdings_is_owner on public.holdings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy import_jobs_is_owner on public.import_jobs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy import_rows_is_owner on public.import_rows
  for all using (
    exists (
      select 1 from public.import_jobs j
      where j.id = import_job_id and j.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.import_jobs j
      where j.id = import_job_id and j.user_id = auth.uid()
    )
  );



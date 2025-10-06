import { supabase } from "../lib/supabaseClient";

export type Budget = {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  amount?: number;
  period?: 'monthly' | 'yearly';
  created_at: string;
};

export type BudgetWithItems = Budget & {
  budget_items: Array<{
    id: string;
    category_id: string;
    amount: number;
    categories: {
      id: string;
      name: string;
      kind: string;
    };
  }>;
};

export async function listBudgets(): Promise<BudgetWithItems[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  
  const { data, error } = await supabase
    .from("budgets")
    .select(`
      id,
      user_id,
      period_start,
      period_end,
      amount,
      period,
      created_at,
      budget_items (
        id,
        category_id,
        amount,
        categories (
          id,
          name,
          kind
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BudgetWithItems[];
}

export async function createBudget(budget: {
  period_start: string;
  period_end: string;
  amount?: number;
  period?: 'monthly' | 'yearly';
}): Promise<Budget> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      period_start: budget.period_start,
      period_end: budget.period_end,
      amount: budget.amount || 0,
      period: budget.period || 'monthly',
    })
    .select("id,user_id,period_start,period_end,amount,period,created_at")
    .single();
  if (error) throw error;
  return data as Budget;
}

export async function updateBudget(id: string, updates: {
  period_start?: string;
  period_end?: string;
  amount?: number;
  period?: 'monthly' | 'yearly';
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  
  const { error } = await supabase
    .from("budgets")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteBudget(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

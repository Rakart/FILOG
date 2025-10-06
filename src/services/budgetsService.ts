import { supabase } from "../lib/supabaseClient";

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'yearly';
  created_at: string;
};

export async function listBudgets(): Promise<Budget[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("budgets")
    .select("id,user_id,category_id,amount,period,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Budget[];
}

export async function createBudget(budget: {
  category_id: string;
  amount: number;
  period: 'monthly' | 'yearly';
}): Promise<Budget> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      category_id: budget.category_id,
      amount: budget.amount,
      period: budget.period,
    })
    .select("id,user_id,category_id,amount,period,created_at")
    .single();
  if (error) throw error;
  return data as Budget;
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

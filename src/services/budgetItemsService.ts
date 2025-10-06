import { supabase } from "../lib/supabaseClient";

export type BudgetItem = {
  id: string;
  budget_id: string;
  category_id: string;
  amount: number;
};

export async function listBudgetItems(budgetId: string): Promise<BudgetItem[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  
  const { data, error } = await supabase
    .from("budget_items")
    .select("id,budget_id,category_id,amount")
    .eq("budget_id", budgetId)
    .order("amount", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BudgetItem[];
}

export async function updateBudgetItem(id: string, amount: number): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  
  const { error } = await supabase
    .from("budget_items")
    .update({ amount })
    .eq("id", id);
  if (error) throw error;
}

export async function createBudgetItem(budgetId: string, categoryId: string, amount: number): Promise<BudgetItem> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  
  const { data, error } = await supabase
    .from("budget_items")
    .insert({
      budget_id: budgetId,
      category_id: categoryId,
      amount: amount
    })
    .select("id,budget_id,category_id,amount")
    .single();
  if (error) throw error;
  return data as BudgetItem;
}

export async function deleteBudgetItem(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  
  const { error } = await supabase
    .from("budget_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

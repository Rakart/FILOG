import { supabase } from "../lib/supabaseClient";

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  posted_at: string;
  description: string;
  amount: number;
  category_id: string | null;
};

export async function listTransactions(): Promise<Transaction[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("transactions")
    .select("id,user_id,account_id,posted_at,description,amount,category_id")
    .eq("user_id", userId)
    .order("posted_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export type TransactionFilters = {
  q?: string;
  start?: string; // yyyy-mm-dd
  end?: string;   // yyyy-mm-dd
  minAmount?: number;
  maxAmount?: number;
};

export async function listTransactionsFiltered(filters: TransactionFilters): Promise<Transaction[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  let query = supabase
    .from("transactions")
    .select("id,user_id,account_id,posted_at,description,amount,category_id")
    .eq("user_id", userId);
  if (filters.start) query = query.gte('posted_at', filters.start);
  if (filters.end) query = query.lte('posted_at', filters.end);
  if (filters.minAmount !== undefined) query = query.gte('amount', filters.minAmount);
  if (filters.maxAmount !== undefined) query = query.lte('amount', filters.maxAmount);
  if (filters.q) query = query.ilike('description', `%${filters.q}%`);
  const { data, error } = await query.order('posted_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function deleteTransaction(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}



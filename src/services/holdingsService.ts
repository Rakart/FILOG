import { supabase } from "../lib/supabaseClient";

export type Holding = {
  id: string;
  user_id: string;
  account_id: string | null;
  symbol: string;
  quantity: number;
  cost_basis: number | null;
};

export async function listHoldings(): Promise<Holding[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("holdings")
    .select("id,user_id,account_id,symbol,quantity,cost_basis")
    .eq("user_id", userId)
    .order("symbol", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Holding[];
}

export async function createHolding(input: { symbol: string; quantity: number; cost_basis?: number | null; account_id?: string | null; }): Promise<Holding> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("holdings")
    .insert({ user_id: userId, symbol: input.symbol, quantity: input.quantity, cost_basis: input.cost_basis ?? null, account_id: input.account_id ?? null })
    .select("id,user_id,account_id,symbol,quantity,cost_basis")
    .single();
  if (error) throw error;
  return data as Holding;
}

export async function deleteHolding(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("holdings")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}



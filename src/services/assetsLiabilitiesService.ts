import { supabase } from "../lib/supabaseClient";

export type AssetLiability = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  type: 'asset' | 'liability';
  category: string;
  created_at: string;
};

export async function listAssetsLiabilities(): Promise<AssetLiability[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("assets_liabilities")
    .select("id,user_id,name,amount,type,category,created_at")
    .eq("user_id", userId)
    .order("type", { ascending: true })
    .order("amount", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AssetLiability[];
}

export async function createAssetLiability(item: {
  name: string;
  amount: number;
  type: 'asset' | 'liability';
  category: string;
}): Promise<AssetLiability> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("assets_liabilities")
    .insert({
      user_id: userId,
      name: item.name,
      amount: item.amount,
      type: item.type,
      category: item.category,
    })
    .select("id,user_id,name,amount,type,category,created_at")
    .single();
  if (error) throw error;
  return data as AssetLiability;
}

export async function deleteAssetLiability(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("assets_liabilities")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

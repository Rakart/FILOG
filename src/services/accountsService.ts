import { supabase } from "../lib/supabaseClient";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: 'cash' | 'checking' | 'credit_card' | 'loan' | 'brokerage';
  currency: string;
  created_at: string;
};

export async function listAccounts(): Promise<Account[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from('accounts')
    .select('id,user_id,name,type,currency,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Account[];
}

export async function createAccount(input: { name: string; type: Account['type']; currency?: string }): Promise<Account> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from('accounts')
    .insert({ user_id: userId, name: input.name, type: input.type, currency: input.currency ?? 'USD' })
    .select('id,user_id,name,type,currency,created_at')
    .single();
  if (error) throw error;
  return data as Account;
}

export async function deleteAccount(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}



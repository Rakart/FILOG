import { supabase } from "../lib/supabaseClient";

export interface ParsedTransactionRow {
  posted_at: string; // ISO date string
  description: string;
  amount: number; // signed
  external_id?: string;
  account_id: string; // uuid of accounts.id
}

export async function createImportJob(sourceName: string) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("import_jobs")
    .insert({ user_id: userId, source_name: sourceName, status: "pending" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function commitTransactions(importJobId: string, rows: ParsedTransactionRow[]) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const chunkSize = 300;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize).map((r) => ({
      user_id: userId,
      account_id: r.account_id,
      posted_at: r.posted_at,
      description: r.description,
      amount: r.amount,
      external_id: r.external_id ?? null,
      import_job_id: importJobId,
    }));
    const { error } = await supabase.from("transactions").insert(chunk, { count: "exact" });
    if (error) throw error;
  }
}

export async function listAccounts() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("accounts")
    .select("id,name,type,currency")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}



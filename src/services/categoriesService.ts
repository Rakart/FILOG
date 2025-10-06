import { supabase } from "../lib/supabaseClient";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  kind: "income" | "expense";
  parent_id: string | null;
};

export async function listCategories(): Promise<Category[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("categories")
    .select("id,user_id,name,kind,parent_id")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function createCategory(input: { name: string; kind: "income" | "expense"; parent_id?: string | null; }): Promise<Category> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: userId, name: input.name, kind: input.kind, parent_id: input.parent_id ?? null })
    .select("id,user_id,name,kind,parent_id")
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}



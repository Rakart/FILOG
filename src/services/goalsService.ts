import { supabase } from "../lib/supabaseClient";

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
};

export async function listGoals(): Promise<Goal[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("goals")
    .select("id,user_id,name,target_amount,current_amount,deadline,priority,created_at")
    .eq("user_id", userId)
    .order("priority", { ascending: true })
    .order("deadline", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Goal[];
}

export async function createGoal(goal: {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}): Promise<Goal> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      deadline: goal.deadline,
      priority: goal.priority,
    })
    .select("id,user_id,name,target_amount,current_amount,deadline,priority,created_at")
    .single();
  if (error) throw error;
  return data as Goal;
}

export async function updateGoal(id: string, updates: {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteGoal(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

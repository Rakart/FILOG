import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Trash2, Plus } from "lucide-react";
import { listBudgets, createBudget, deleteBudget, type Budget } from "../services/budgetsService";
import { listGoals, createGoal, deleteGoal, type Goal } from "../services/goalsService";
import { listCategories } from "../services/categoriesService";

export function BudgetView() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPeriod, setNewPeriod] = useState<"monthly" | "yearly">("monthly");
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"high" | "medium" | "low">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBudgets = async () => {
    try {
      setError(null);
      const data = await listBudgets();
      setBudgets(data);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const refreshGoals = async () => {
    try {
      const data = await listGoals();
      setGoals(data);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const refreshCategories = async () => {
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  useEffect(() => {
    void refreshBudgets();
    void refreshGoals();
    void refreshCategories();
  }, []);

  const onAddBudget = async () => {
    if (!newCategory || !newAmount) return;
    setLoading(true);
    try {
      await createBudget({
        category_id: newCategory,
        amount: Number(newAmount),
        period: newPeriod
      });
      setNewCategory("");
      setNewAmount("");
      setNewPeriod("monthly");
      await refreshBudgets();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteBudget = async (id: string) => {
    setLoading(true);
    try {
      await deleteBudget(id);
      await refreshBudgets();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onAddGoal = async () => {
    if (!newGoalName || !newGoalTarget) return;
    setLoading(true);
    try {
      await createGoal({
        name: newGoalName,
        target_amount: Number(newGoalTarget),
        current_amount: Number(newGoalCurrent) || 0,
        deadline: newGoalDeadline,
        priority: newGoalPriority
      });
      setNewGoalName("");
      setNewGoalTarget("");
      setNewGoalCurrent("");
      setNewGoalDeadline("");
      setNewGoalPriority("medium");
      await refreshGoals();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteGoal = async (id: string) => {
    setLoading(true);
    try {
      await deleteGoal(id);
      await refreshGoals();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="p-6 space-y-6 w-full h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Budget & Goals</h2>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Budgets Section */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Set Budgets</CardTitle>
          <p className="text-sm text-muted-foreground">Create spending limits for each category</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 items-center">
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="Amount" 
              value={newAmount} 
              onChange={(e) => setNewAmount(e.target.value)} 
            />
            <Select value={newPeriod} onValueChange={(v: any) => setNewPeriod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={onAddBudget} 
            disabled={loading || !newCategory || !newAmount}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
          
          <div className="border-t border-border pt-4 space-y-2">
            {budgets.map((budget) => (
              <div key={budget.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{getCategoryName(budget.category_id)}</span>
                  <Badge variant="outline">{budget.period}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-sm" 
                  onClick={() => onDeleteBudget(budget.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            ))}
            {!budgets.length && (
              <div className="text-sm text-muted-foreground">No budgets set yet. Create one above.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Goals Section */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Financial Goals</CardTitle>
          <p className="text-sm text-muted-foreground">Set and track your financial objectives</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Input 
              placeholder="Goal name" 
              value={newGoalName} 
              onChange={(e) => setNewGoalName(e.target.value)} 
            />
            <Input 
              type="number" 
              step="0.01" 
              placeholder="Target amount" 
              value={newGoalTarget} 
              onChange={(e) => setNewGoalTarget(e.target.value)} 
            />
            <Input 
              type="number" 
              step="0.01" 
              placeholder="Current amount" 
              value={newGoalCurrent} 
              onChange={(e) => setNewGoalCurrent(e.target.value)} 
            />
            <Input 
              type="date" 
              placeholder="Deadline" 
              value={newGoalDeadline} 
              onChange={(e) => setNewGoalDeadline(e.target.value)} 
            />
            <Select value={newGoalPriority} onValueChange={(v: any) => setNewGoalPriority(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={onAddGoal} 
            disabled={loading || !newGoalName || !newGoalTarget}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
          
          <div className="border-t border-border pt-4 space-y-2">
            {goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <div key={goal.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                        {goal.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)} 
                      ({progress.toFixed(1)}%)
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-sm ml-4" 
                    onClick={() => onDeleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              );
            })}
            {!goals.length && (
              <div className="text-sm text-muted-foreground">No goals set yet. Create one above.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
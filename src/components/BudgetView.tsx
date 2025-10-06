import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Trash2, Plus } from "lucide-react";
import { listBudgets, createBudget, deleteBudget, updateBudget, type BudgetWithItems } from "../services/budgetsService";
import { listGoals, createGoal, deleteGoal, type Goal } from "../services/goalsService";
import { listCategories, createCategory } from "../services/categoriesService";
import { updateBudgetItem } from "../services/budgetItemsService";

export function BudgetView() {
  const [budgets, setBudgets] = useState<BudgetWithItems[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalCurrent, setNewGoalCurrent] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"high" | "medium" | "low">("medium");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryKind, setNewCategoryKind] = useState<"income" | "expense" | "">("");
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

  const onAddCategory = async () => {
    if (!newCategoryName || !newCategoryKind) return;
    setLoading(true);
    try {
      await createCategory({ name: newCategoryName, kind: newCategoryKind });
      setNewCategoryName("");
      setNewCategoryKind("");
      await refreshCategories();
      await refreshBudgets(); // Refresh budgets since a new one will be created automatically
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onUpdateBudgetItem = async (budgetItemId: string, amount: number) => {
    setLoading(true);
    try {
      await updateBudgetItem(budgetItemId, amount);
      await refreshBudgets();
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

      {/* Categories Section */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Categories & Budgets</CardTitle>
          <p className="text-sm text-muted-foreground">Create categories and automatically get budgets for each one</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Category name" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
            />
            <Select value={newCategoryKind} onValueChange={(v: any) => setNewCategoryKind(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Kind" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={onAddCategory} 
              disabled={loading || !newCategoryName || !newCategoryKind}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            When you create a category, a budget will be automatically created for it.
          </div>
        </CardContent>
      </Card>

      {/* Budgets Section */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
          <p className="text-sm text-muted-foreground">Set spending limits for each category</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">
                    Budget Period: {new Date(budget.period_start).toLocaleDateString()} - {new Date(budget.period_end).toLocaleDateString()}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {budget.period || 'monthly'} budget
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-sm" 
                  onClick={() => onDeleteBudget(budget.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Budget
                </Button>
              </div>
              
              <div className="space-y-2">
                {budget.budget_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.categories.name}</span>
                      <Badge variant={item.categories.kind === 'income' ? 'default' : 'destructive'}>
                        {item.categories.kind}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={item.amount} 
                        onChange={(e) => onUpdateBudgetItem(item.id, Number(e.target.value))}
                        className="w-24 h-8"
                      />
                      <span className="text-xs text-muted-foreground">USD</span>
                    </div>
                  </div>
                ))}
                {!budget.budget_items?.length && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    No budget items yet. Create categories to automatically get budget items.
                  </div>
                )}
              </div>
            </div>
          ))}
          {!budgets.length && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No budgets yet. Create categories to automatically get budgets.
            </div>
          )}
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
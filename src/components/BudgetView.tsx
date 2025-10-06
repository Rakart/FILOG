import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Target, DollarSign, Home, Car, Plane, GraduationCap } from "lucide-react";
import { formatDate } from "./utils/dateUtils";

// Mock budget data
const budgetCategories = [
  { category: 'Housing', spent: 2100, budget: 2200, icon: Home, color: 'bg-blue-500' },
  { category: 'Transportation', spent: 450, budget: 600, icon: Car, color: 'bg-green-500' },
  { category: 'Food & Dining', spent: 680, budget: 800, icon: DollarSign, color: 'bg-yellow-500' },
  { category: 'Entertainment', spent: 320, budget: 400, icon: Plane, color: 'bg-purple-500' },
  { category: 'Shopping', spent: 540, budget: 500, icon: DollarSign, color: 'bg-red-500' },
  { category: 'Education', spent: 150, budget: 300, icon: GraduationCap, color: 'bg-indigo-500' },
];

type Goal = { name: string; target: number; current: number; deadline: string; priority: 'High' | 'Medium' | 'Low'; color: string };

export function BudgetView() {
  const [financialGoals, setFinancialGoals] = useState<Goal[]>([
    { name: 'Emergency Fund', target: 15000, current: 8500, deadline: '2024-12-31', priority: 'High', color: 'bg-red-500' },
    { name: 'Vacation to Europe', target: 5000, current: 2800, deadline: '2025-06-01', priority: 'Medium', color: 'bg-blue-500' },
    { name: 'Down Payment', target: 50000, current: 12000, deadline: '2026-01-01', priority: 'High', color: 'bg-green-500' },
    { name: 'New Car', target: 25000, current: 18500, deadline: '2025-03-01', priority: 'Low', color: 'bg-yellow-500' },
  ]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6 w-full h-full">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl">{formatCurrency(totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl text-red-400">{formatCurrency(totalSpent)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl text-green-400">{formatCurrency(remainingBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Budget Tracker */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>October 2024 Budget</CardTitle>
          <p className="text-sm text-muted-foreground">Track your spending across categories</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgetCategories.map((category, index) => {
              const percentage = (category.spent / category.budget) * 100;
              const isOverBudget = category.spent > category.budget;
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-sm ${category.color}`}>
                        <category.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-foreground'}`}>
                        {formatCurrency(category.spent)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of {formatCurrency(category.budget)}
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2 bg-progress-background"
                    style={{
                      background: isOverBudget ? '#3f1f1f' : undefined
                    }}
                  />
                  <div className="flex justify-between text-sm">
                    <span className={percentage > 90 ? 'text-red-400' : 'text-muted-foreground'}>
                      {percentage.toFixed(0)}% used
                    </span>
                    <span className={isOverBudget ? 'text-red-400' : 'text-green-400'}>
                      {isOverBudget ? 'Over budget' : `${formatCurrency(category.budget - category.spent)} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Financial Goals */}
      <Card className="rounded-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Financial Goals
            </CardTitle>
            <p className="text-sm text-muted-foreground">Track progress toward your savings goals</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-sm">
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {financialGoals.map((goal, index) => {
              const percentage = (goal.current / goal.target) * 100;
              const remaining = goal.target - goal.current;
              const daysUntilDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={index} className="p-4 bg-muted/30 rounded-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{goal.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Target: {formatCurrency(goal.target)} by {formatDate(goal.deadline)}
                      </p>
                    </div>
                    <Badge variant="outline" className={`${getPriorityColor(goal.priority)} text-white rounded-sm`}>
                      {goal.priority}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                    </div>
                    <Progress value={percentage} className="h-3 bg-progress-background" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{percentage.toFixed(1)}% complete</span>
                      <span>{daysUntilDeadline} days left</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Remaining: </span>
                      <span className="font-medium text-blue-400">{formatCurrency(remaining)}</span>
                    </p>
                    {daysUntilDeadline > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Save {formatCurrency(remaining / daysUntilDeadline)} per day to reach goal
                      </p>
                    )}
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" className="rounded-sm" onClick={() => setFinancialGoals(prev => prev.filter((_, i) => i !== index))}>Delete Goal</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
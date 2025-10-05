import { useState, useEffect } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import { FinanceSidebar } from "./components/FinanceSidebar";
import { FinanceHeader } from "./components/FinanceHeader";
import { DashboardView } from "./components/DashboardView";
import { NetWorthView } from "./components/NetWorthView";
import { BudgetView } from "./components/BudgetView";
import { TransactionsView } from "./components/TransactionsView";
import { Card } from "./components/ui/card";
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { listCategories, createCategory, deleteCategory } from './services/categoriesService';

// Mock data for header
const mockHeaderData = {
  totalNetWorth: 152400,
  dailyChange: 2850,
  dailyChangePercent: 1.9,
};

// Simple placeholder views for remaining screens
function ReportsView() {
  return (
    <div className="p-6 w-full h-full">
      <Card className="p-8 text-center rounded-sm w-full">
        <h2 className="text-2xl mb-4">Reports & Analytics</h2>
        <p className="text-muted-foreground">Detailed financial reports and insights coming soon...</p>
      </Card>
    </div>
  );
}

function SettingsView() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<"income" | "expense" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setError(null);
      const data = await listCategories();
      setCategories(data);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  useEffect(() => { void refresh(); }, []);

  const onAdd = async () => {
    if (!newName || !newKind) return;
    setLoading(true);
    try {
      await createCategory({ name: newName, kind: newKind });
      setNewName("");
      setNewKind("");
      await refresh();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteCategory(id);
      await refresh();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full h-full space-y-6">
      <Card className="p-6 rounded-sm w-full space-y-4">
        <h2 className="text-xl">Categories</h2>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="flex gap-2 items-center">
          <Input placeholder="Category name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Select value={newKind} onValueChange={(v: any) => setNewKind(v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Kind" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onAdd} disabled={loading || !newName || !newKind}>Add</Button>
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div className="text-sm">{c.name} <span className="text-muted-foreground">({c.kind})</span></div>
              <Button variant="outline" size="sm" className="rounded-sm" onClick={() => onDelete(c.id)}>Delete</Button>
            </div>
          ))}
          {!categories.length && (
            <div className="text-sm text-muted-foreground">No categories yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  
  // Set page title
  if (typeof document !== 'undefined') {
    document.title = 'FILOG - Financial Logs Dashboard';
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'networth':
        return <NetWorthView />;
      case 'budget':
        return <BudgetView />;
      case 'transactions':
        return <TransactionsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <FinanceSidebar 
            activeView={activeView} 
            onViewChange={setActiveView} 
          />
          
          <div className="flex-1 flex flex-col min-w-0 w-full">
            <FinanceHeader
              totalNetWorth={mockHeaderData.totalNetWorth}
              dailyChange={mockHeaderData.dailyChange}
              dailyChangePercent={mockHeaderData.dailyChangePercent}
            />
            
            <main className="flex-1 overflow-auto">
              <div className="w-full h-full">
                {renderActiveView()}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
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
import { listAccounts, createAccount, deleteAccount } from './services/accountsService';
import { listTransactions, createTransaction, deleteTransaction } from './services/transactionsService';

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
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState<"income" | "expense" | "">("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<"cash" | "checking" | "credit_card" | "loan" | "brokerage" | "">("");
  const [newTransactionAccount, setNewTransactionAccount] = useState("");
  const [newTransactionDate, setNewTransactionDate] = useState("");
  const [newTransactionDescription, setNewTransactionDescription] = useState("");
  const [newTransactionAmount, setNewTransactionAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = async () => {
    try {
      setError(null);
      const data = await listCategories();
      setCategories(data);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const refreshAccounts = async () => {
    try {
      setError(null);
      const data = await listAccounts();
      setAccounts(data);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const refreshTransactions = async () => {
    try {
      setError(null);
      const data = await listTransactions();
      setTransactions(data);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  useEffect(() => { 
    void refreshCategories(); 
    void refreshAccounts();
    void refreshTransactions();
  }, []);

  const onAddCategory = async () => {
    if (!newName || !newKind) return;
    setLoading(true);
    try {
      await createCategory({ name: newName, kind: newKind });
      setNewName("");
      setNewKind("");
      await refreshCategories();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteCategory = async (id: string) => {
    setLoading(true);
    try {
      await deleteCategory(id);
      await refreshCategories();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onAddAccount = async () => {
    if (!newAccountName || !newAccountType) return;
    setLoading(true);
    try {
      await createAccount({ name: newAccountName, type: newAccountType });
      setNewAccountName("");
      setNewAccountType("");
      await refreshAccounts();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAccount = async (id: string) => {
    setLoading(true);
    try {
      await deleteAccount(id);
      await refreshAccounts();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onAddTransaction = async () => {
    if (!newTransactionAccount || !newTransactionDate || !newTransactionDescription || !newTransactionAmount) return;
    setLoading(true);
    try {
      await createTransaction({
        account_id: newTransactionAccount,
        posted_at: newTransactionDate,
        description: newTransactionDescription,
        amount: Number(newTransactionAmount)
      });
      setNewTransactionAccount("");
      setNewTransactionDate("");
      setNewTransactionDescription("");
      setNewTransactionAmount("");
      await refreshTransactions();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteTransaction = async (id: string) => {
    setLoading(true);
    try {
      await deleteTransaction(id);
      await refreshTransactions();
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
          <Button onClick={onAddCategory} disabled={loading || !newName || !newKind}>Add</Button>
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div className="text-sm">{c.name} <span className="text-muted-foreground">({c.kind})</span></div>
              <Button variant="outline" size="sm" className="rounded-sm" onClick={() => onDeleteCategory(c.id)}>Delete</Button>
            </div>
          ))}
          {!categories.length && (
            <div className="text-sm text-muted-foreground">No categories yet.</div>
          )}
        </div>
      </Card>

      <Card className="p-6 rounded-sm w-full space-y-4">
        <h2 className="text-xl">Accounts</h2>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="flex gap-2 items-center">
          <Input placeholder="Account name" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} />
          <Select value={newAccountType} onValueChange={(v: any) => setNewAccountType(v)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="checking">Checking</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="brokerage">Brokerage</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onAddAccount} disabled={loading || !newAccountName || !newAccountType}>Add</Button>
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between">
              <div className="text-sm">{a.name} <span className="text-muted-foreground">({a.type})</span></div>
              <Button variant="outline" size="sm" className="rounded-sm" onClick={() => onDeleteAccount(a.id)}>Delete</Button>
            </div>
          ))}
          {!accounts.length && (
            <div className="text-sm text-muted-foreground">No accounts yet. Create one to use Import CSV and Add Transaction.</div>
          )}
        </div>
      </Card>

      <Card className="p-6 rounded-sm w-full space-y-4">
        <h2 className="text-xl">Transactions</h2>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="grid grid-cols-2 gap-2 items-center">
          <Select value={newTransactionAccount} onValueChange={setNewTransactionAccount}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input 
            type="date" 
            value={newTransactionDate} 
            onChange={(e) => setNewTransactionDate(e.target.value)} 
            placeholder="Date"
          />
          <Input 
            placeholder="Description" 
            value={newTransactionDescription} 
            onChange={(e) => setNewTransactionDescription(e.target.value)} 
          />
          <Input 
            type="number" 
            step="0.01" 
            placeholder="Amount" 
            value={newTransactionAmount} 
            onChange={(e) => setNewTransactionAmount(e.target.value)} 
          />
        </div>
        <Button 
          onClick={onAddTransaction} 
          disabled={loading || !newTransactionAccount || !newTransactionDate || !newTransactionDescription || !newTransactionAmount}
        >
          Add Transaction
        </Button>
        <div className="border-t border-border pt-4 space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div className="text-sm">
                {t.description} - ${t.amount} ({new Date(t.posted_at).toLocaleDateString()})
              </div>
              <Button variant="outline" size="sm" className="rounded-sm" onClick={() => onDeleteTransaction(t.id)}>Delete</Button>
            </div>
          ))}
          {!transactions.length && (
            <div className="text-sm text-muted-foreground">No transactions yet. Create one above.</div>
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
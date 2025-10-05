import { useState } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import { FinanceSidebar } from "./components/FinanceSidebar";
import { FinanceHeader } from "./components/FinanceHeader";
import { DashboardView } from "./components/DashboardView";
import { NetWorthView } from "./components/NetWorthView";
import { BudgetView } from "./components/BudgetView";
import { TransactionsView } from "./components/TransactionsView";
import { Card } from "./components/ui/card";

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
  return (
    <div className="p-6 w-full h-full">
      <Card className="p-8 text-center rounded-sm w-full">
        <h2 className="text-2xl mb-4">Settings & Automation</h2>
        <p className="text-muted-foreground">Account connections, data sync, and automation settings coming soon...</p>
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
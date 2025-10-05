import { 
  BarChart3, 
  TrendingUp, 
  CreditCard, 
  Target, 
  FileText, 
  Settings,
  Wallet,
  PieChart
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import filogLogo from 'figma:asset/56a54f418496b7ea0b36bfd06f6e443227d280e8.png';

interface FinanceSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'networth', label: 'Net Worth', icon: TrendingUp },
  { id: 'budget', label: 'Budget & Goals', icon: Target },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function FinanceSidebar({ activeView, onViewChange }: FinanceSidebarProps) {
  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center">
            <img 
              src={filogLogo} 
              alt="FILOG" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg tracking-tight">FILOG</h2>
            <p className="text-sm text-muted-foreground">Financial Logs</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onViewChange(item.id)}
                isActive={activeView === item.id}
                className="w-full justify-start gap-3 px-4 py-3 rounded-sm hover:bg-accent"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowUpRight, ArrowDownRight, CreditCard, Banknote, Building2, Download } from "lucide-react";
import { formatDate, formatChartDate } from "./utils/dateUtils";
import { listTransactions, type Transaction } from "../services/transactionsService";
import { downloadCsv } from "./utils/csvUtils";

// Mock data for portfolio performance
const portfolioData = [
  { date: 'Jan-24', value: 125000 },
  { date: 'Feb-24', value: 128500 },
  { date: 'Mar-24', value: 124200 },
  { date: 'Apr-24', value: 132800 },
  { date: 'May-24', value: 138900 },
  { date: 'Jun-24', value: 142300 },
  { date: 'Jul-24', value: 139800 },
  { date: 'Aug-24', value: 145600 },
  { date: 'Sep-24', value: 148200 },
  { date: 'Oct-24', value: 152400 },
];

// Mock asset allocation data
const assetAllocation = [
  { name: 'Stocks', value: 85000, color: '#3b82f6' },
  { name: 'Crypto', value: 35000, color: '#f59e0b' },
  { name: 'Cash', value: 25000, color: '#10b981' },
  { name: 'Real Estate', value: 45000, color: '#8b5cf6' },
  { name: 'Bonds', value: 15000, color: '#ef4444' },
];

export function DashboardView() {
  const [recent, setRecent] = useState<Transaction[]>([]);
  useEffect(() => { (async () => {
    try {
      const data = await listTransactions();
      setRecent(data.slice(0, 6));
    } catch {}
  })(); }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  return (
    <div className="p-6 space-y-6 w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Performance Chart */}
        <Card className="lg:col-span-2 rounded-sm">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Total portfolio value over the past year</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#portfolioGradient)"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown by asset class</p>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <defs>
                    {assetAllocation.map((entry, index) => (
                      <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {assetAllocation.map((asset, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: asset.color }}></div>
                    <span>{asset.name}</span>
                  </div>
                  <span>{formatCurrency(asset.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <p className="text-sm text-muted-foreground">Latest financial activity</p>
          <div className="flex justify-end">
            <button
              className="text-sm underline"
              onClick={() => {
                const rows = recent.map(r => ({ id: r.id, date: r.posted_at, description: r.description, amount: r.amount, account_id: r.account_id, category_id: r.category_id ?? '' }));
                downloadCsv('transactions_export.csv', rows);
              }}
            >
              <span className="inline-flex items-center gap-1"><Download className="h-4 w-4" /> Export</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recent.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-sm ${
                    transaction.amount >= 0 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                  }`}>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.posted_at)}</p>
                  </div>
                </div>
                <div className={`text-right ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <p className="font-medium">
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
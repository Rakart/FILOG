import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Download, Plus, Filter } from "lucide-react";
import { formatDate } from "./utils/dateUtils";

// Mock transaction data with cost basis info
const transactions = [
  { 
    id: 1, 
    date: '2024-10-01', 
    description: 'AAPL Stock Purchase', 
    category: 'Investment', 
    amount: -1500, 
    costBasis: 150.00,
    shares: 10,
    symbol: 'AAPL'
  },
  { 
    id: 2, 
    date: '2024-09-30', 
    description: 'Salary Deposit', 
    category: 'Income', 
    amount: 5200, 
    costBasis: null,
    shares: null,
    symbol: null
  },
  { 
    id: 3, 
    date: '2024-09-29', 
    description: 'TSLA Stock Purchase', 
    category: 'Investment', 
    amount: -2400, 
    costBasis: 240.00,
    shares: 10,
    symbol: 'TSLA'
  },
  { 
    id: 4, 
    date: '2024-09-28', 
    description: 'Rent Payment', 
    category: 'Housing', 
    amount: -2100, 
    costBasis: null,
    shares: null,
    symbol: null
  },
  { 
    id: 5, 
    date: '2024-09-27', 
    description: 'Bitcoin Purchase', 
    category: 'Crypto', 
    amount: -800, 
    costBasis: 26500.00,
    shares: 0.0302,
    symbol: 'BTC'
  },
  { 
    id: 6, 
    date: '2024-09-26', 
    description: 'Dividend - MSFT', 
    category: 'Income', 
    amount: 85, 
    costBasis: null,
    shares: null,
    symbol: 'MSFT'
  },
];

// Mock holdings with cost basis
const holdings = [
  { symbol: 'AAPL', shares: 25, avgCostBasis: 145.60, currentPrice: 175.20, totalValue: 4380 },
  { symbol: 'TSLA', shares: 15, avgCostBasis: 235.80, currentPrice: 248.50, totalValue: 3727.50 },
  { symbol: 'MSFT', shares: 20, avgCostBasis: 285.40, currentPrice: 310.75, totalValue: 6215 },
  { symbol: 'BTC', shares: 0.1524, avgCostBasis: 26200.00, currentPrice: 28500.00, totalValue: 4343.40 },
];

export function TransactionsView() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Investment': return 'bg-blue-500';
      case 'Income': return 'bg-green-500';
      case 'Housing': return 'bg-purple-500';
      case 'Crypto': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6 w-full h-full">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Transactions & Reports</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="rounded-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="rounded-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Tax Lots / Cost Basis Display */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Current Holdings & Cost Basis</CardTitle>
          <p className="text-sm text-muted-foreground">Cost basis information for tax reporting</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Avg Cost Basis</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Unrealized P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding, index) => {
                const unrealizedPL = holding.totalValue - (holding.shares * holding.avgCostBasis);
                const plPercentage = (unrealizedPL / (holding.shares * holding.avgCostBasis)) * 100;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{holding.symbol}</TableCell>
                    <TableCell>{holding.shares}</TableCell>
                    <TableCell>{formatCurrency(holding.avgCostBasis)}</TableCell>
                    <TableCell>{formatCurrency(holding.currentPrice)}</TableCell>
                    <TableCell>{formatCurrency(holding.totalValue)}</TableCell>
                    <TableCell className={unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {unrealizedPL >= 0 ? '+' : ''}{formatCurrency(unrealizedPL)}
                      <div className="text-xs text-muted-foreground">
                        ({plPercentage >= 0 ? '+' : ''}{plPercentage.toFixed(1)}%)
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <p className="text-sm text-muted-foreground">Complete record of all financial transactions</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Cost Basis</TableHead>
                <TableHead>Shares</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                    {transaction.symbol && (
                      <div className="text-xs text-muted-foreground">{transaction.symbol}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${getCategoryColor(transaction.category)} text-white rounded-sm`}>
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    {transaction.costBasis ? formatCurrency(transaction.costBasis) : '-'}
                  </TableCell>
                  <TableCell>
                    {transaction.shares ? transaction.shares.toString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Download Reports */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Tax Reports</CardTitle>
          <p className="text-sm text-muted-foreground">Generate reports for tax filing and record keeping</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="rounded-sm h-20 flex flex-col gap-2">
              <Download className="h-5 w-5" />
              <span>2024 Tax Summary</span>
            </Button>
            <Button variant="outline" className="rounded-sm h-20 flex flex-col gap-2">
              <Download className="h-5 w-5" />
              <span>Cost Basis Report</span>
            </Button>
            <Button variant="outline" className="rounded-sm h-20 flex flex-col gap-2">
              <Download className="h-5 w-5" />
              <span>Transaction Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Download, Plus, Filter, Upload, Trash2 } from "lucide-react";
import { formatDate } from "./utils/dateUtils";
import { ImportCsvDialog } from "./ImportCsvDialog";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { listTransactions, deleteTransaction, type Transaction, listTransactionsFiltered, type TransactionFilters } from "../services/transactionsService";
import { TransactionsFilterDialog, type TransactionsFilter } from "./TransactionsFilterDialog";
import { downloadCsv } from "./utils/csvUtils";

export function TransactionsView() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = Object.keys(filters).length ? await listTransactionsFiltered(filters) : await listTransactions();
      setRows(data);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [filters]);

// Mock holdings with cost basis
const holdings = [
  { symbol: 'AAPL', shares: 25, avgCostBasis: 145.60, currentPrice: 175.20, totalValue: 4380 },
  { symbol: 'TSLA', shares: 15, avgCostBasis: 235.80, currentPrice: 248.50, totalValue: 3727.50 },
  { symbol: 'MSFT', shares: 20, avgCostBasis: 285.40, currentPrice: 310.75, totalValue: 6215 },
  { symbol: 'BTC', shares: 0.1524, avgCostBasis: 26200.00, currentPrice: 28500.00, totalValue: 4343.40 },
];

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
          <TransactionsFilterDialog
            initial={filters as TransactionsFilter}
            onApply={(f) => { setFilters(f); void refresh(); }}
            trigger={
              <Button variant="outline" size="sm" className="rounded-sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            }
          />
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm"
            onClick={() => {
              const csvRows = rows.map(r => ({ id: r.id, date: r.posted_at, description: r.description, amount: r.amount, account_id: r.account_id, category_id: r.category_id ?? '' }));
              downloadCsv('transactions_export.csv', csvRows);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <ImportCsvDialog
            trigger={
              <Button variant="outline" size="sm" className="rounded-sm">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            }
            // refresh after commit
            // @ts-ignore - extend component to accept onComplete if needed
            onComplete={() => { void refresh(); }}
          />
          <AddTransactionDialog
            onCreated={refresh}
            trigger={
              <Button size="sm" className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            }
          />
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
              {rows.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{formatDate(tx.posted_at)}</TableCell>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-sm">{tx.category_id ? 'Categorized' : 'Uncategorized'}</Badge>
                  </TableCell>
                  <TableCell className={tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="rounded-sm" onClick={async () => { await deleteTransaction(tx.id); await refresh(); }}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={6}>{loading ? 'Loading…' : (error ? error : 'No transactions yet.')}</TableCell>
                </TableRow>
              )}
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
            <Button
              variant="outline"
              className="rounded-sm h-20 flex flex-col gap-2"
              onClick={() => {
                const year = new Date().getFullYear();
                const rowsCsv = rows
                  .filter(r => (r.posted_at || '').startsWith(String(year)))
                  .map(r => ({ date: r.posted_at, description: r.description, amount: r.amount, category_kind: r.amount >= 0 ? 'income' : 'expense', category_name: r.category_id ? 'Categorized' : 'Uncategorized' }));
                downloadCsv(`${year}_tax_summary.csv`, rowsCsv);
              }}
            >
              <Download className="h-5 w-5" />
              <span>2024 Tax Summary</span>
            </Button>
            <Button
              variant="outline"
              className="rounded-sm h-20 flex flex-col gap-2"
              onClick={() => {
                // Cost basis from holdings table
                // For MVP, export transactions as a proxy; deeper cost basis needs lot tracking
                const rowsCsv = rows.map(r => ({ symbol: '', quantity: '', cost_basis: '', total_cost: '', description: r.description, date: r.posted_at }));
                downloadCsv('cost_basis_report.csv', rowsCsv);
              }}
            >
              <Download className="h-5 w-5" />
              <span>Cost Basis Report</span>
            </Button>
            <Button
              variant="outline"
              className="rounded-sm h-20 flex flex-col gap-2"
              onClick={() => {
                const rowsCsv = rows.map(r => ({ id: r.id, date: r.posted_at, description: r.description, amount: r.amount, account_id: r.account_id, category_id: r.category_id ?? '' }));
                downloadCsv('transactions_export.csv', rowsCsv);
              }}
            >
              <Download className="h-5 w-5" />
              <span>Transaction Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
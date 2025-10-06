import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TrendingUp, TrendingDown, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { createHolding, deleteHolding, listHoldings, type Holding } from "../services/holdingsService";
import { listAssetsLiabilities, createAssetLiability, deleteAssetLiability, type AssetLiability } from "../services/assetsLiabilitiesService";
import { formatDate } from "./utils/dateUtils";

// Mock net worth history data
const netWorthHistory = [
  { date: 'Jan-24', assets: 180000, liabilities: 55000, netWorth: 125000 },
  { date: 'Feb-24', assets: 185000, liabilities: 56500, netWorth: 128500 },
  { date: 'Mar-24', assets: 182000, liabilities: 57800, netWorth: 124200 },
  { date: 'Apr-24', assets: 192000, liabilities: 59200, netWorth: 132800 },
  { date: 'May-24', assets: 200000, liabilities: 61100, netWorth: 138900 },
  { date: 'Jun-24', assets: 205000, liabilities: 62700, netWorth: 142300 },
  { date: 'Jul-24', assets: 203000, liabilities: 63200, netWorth: 139800 },
  { date: 'Aug-24', assets: 210000, liabilities: 64400, netWorth: 145600 },
  { date: 'Sep-24', assets: 214000, liabilities: 65800, netWorth: 148200 },
  { date: 'Oct-24', assets: 220000, liabilities: 67600, netWorth: 152400 },
];

// Mock asset breakdown
const assets = [
  { category: 'Investment Accounts', amount: 125000, change: 8.5, accounts: '401k, IRA, Brokerage' },
  { category: 'Cash & Savings', amount: 35000, change: 2.1, accounts: 'Checking, Savings, Money Market' },
  { category: 'Real Estate', amount: 45000, change: 12.3, accounts: 'Primary Residence Equity' },
  { category: 'Cryptocurrency', amount: 15000, change: -5.2, accounts: 'Bitcoin, Ethereum' },
];

// Mock liability breakdown
const liabilities = [
  { category: 'Mortgage', amount: 45000, change: -2.5, accounts: 'Primary Residence' },
  { category: 'Student Loans', amount: 15000, change: -8.1, accounts: 'Federal, Private' },
  { category: 'Credit Cards', amount: 5600, change: 15.2, accounts: 'Visa, Mastercard' },
  { category: 'Auto Loan', amount: 12000, change: -12.4, accounts: '2022 Honda Civic' },
];

export function NetWorthView() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [assetsLiabilities, setAssetsLiabilities] = useState<AssetLiability[]>([]);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [costBasis, setCostBasis] = useState<string>("");
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetAmount, setNewAssetAmount] = useState<string>("");
  const [newAssetCategory, setNewAssetCategory] = useState("");
  const [newLiabilityName, setNewLiabilityName] = useState("");
  const [newLiabilityAmount, setNewLiabilityAmount] = useState<string>("");
  const [newLiabilityCategory, setNewLiabilityCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    try {
      const holdingsData = await listHoldings();
      setHoldings(holdingsData);
      const assetsData = await listAssetsLiabilities();
      setAssetsLiabilities(assetsData);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  useEffect(() => { void refresh(); }, []);

  const onAddHolding = async () => {
    if (!symbol || !quantity) return;
    setLoading(true);
    try {
      await createHolding({ symbol: symbol.toUpperCase(), quantity: Number(quantity), cost_basis: costBasis ? Number(costBasis) : null });
      setSymbol("");
      setQuantity("");
      setCostBasis("");
      await refresh();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onAddAsset = async () => {
    if (!newAssetName || !newAssetAmount) return;
    setLoading(true);
    try {
      await createAssetLiability({
        name: newAssetName,
        amount: Number(newAssetAmount),
        type: 'asset',
        category: newAssetCategory || 'Other'
      });
      setNewAssetName("");
      setNewAssetAmount("");
      setNewAssetCategory("");
      await refresh();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onAddLiability = async () => {
    if (!newLiabilityName || !newLiabilityAmount) return;
    setLoading(true);
    try {
      await createAssetLiability({
        name: newLiabilityName,
        amount: Number(newLiabilityAmount),
        type: 'liability',
        category: newLiabilityCategory || 'Other'
      });
      setNewLiabilityName("");
      setNewLiabilityAmount("");
      setNewLiabilityCategory("");
      await refresh();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAssetLiability = async (id: string) => {
    setLoading(true);
    try {
      await deleteAssetLiability(id);
      await refresh();
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

  const totalAssets = assets.reduce((sum, asset) => sum + asset.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);

  return (
    <div className="p-6 space-y-6 w-full h-full">
      <Card className="rounded-sm p-4">
        <CardHeader>
          <CardTitle>Assets & Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
          <div className="flex gap-2 items-center mb-4">
            <Input placeholder="Symbol (e.g., AAPL)" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-40" />
            <Input placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-32" />
            <Input placeholder="Cost basis (optional)" value={costBasis} onChange={(e) => setCostBasis(e.target.value)} className="w-44" />
            <Button size="sm" className="rounded-sm" onClick={onAddHolding} disabled={loading || !symbol || !quantity}>
              <Plus className="h-4 w-4 mr-2" /> Add Asset
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Cost Basis</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map(h => (
                <TableRow key={h.id}>
                  <TableCell>{h.symbol}</TableCell>
                  <TableCell>{h.quantity}</TableCell>
                  <TableCell>{h.cost_basis ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="rounded-sm" onClick={async () => { await deleteHolding(h.id); await refresh(); }}>
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!holdings.length && (
                <TableRow>
                  <TableCell colSpan={4}>
                    No assets yet. Add your first one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assets & Liabilities Management */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Assets & Liabilities</CardTitle>
          <p className="text-sm text-muted-foreground">Manage your assets and liabilities</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Asset */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Add Asset</h4>
            <div className="grid grid-cols-3 gap-2 items-center">
              <Input 
                placeholder="Asset name" 
                value={newAssetName} 
                onChange={(e) => setNewAssetName(e.target.value)} 
              />
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Amount" 
                value={newAssetAmount} 
                onChange={(e) => setNewAssetAmount(e.target.value)} 
              />
              <Input 
                placeholder="Category" 
                value={newAssetCategory} 
                onChange={(e) => setNewAssetCategory(e.target.value)} 
              />
            </div>
            <Button 
              onClick={onAddAsset} 
              disabled={loading || !newAssetName || !newAssetAmount}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>

          {/* Add Liability */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Add Liability</h4>
            <div className="grid grid-cols-3 gap-2 items-center">
              <Input 
                placeholder="Liability name" 
                value={newLiabilityName} 
                onChange={(e) => setNewLiabilityName(e.target.value)} 
              />
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Amount" 
                value={newLiabilityAmount} 
                onChange={(e) => setNewLiabilityAmount(e.target.value)} 
              />
              <Input 
                placeholder="Category" 
                value={newLiabilityCategory} 
                onChange={(e) => setNewLiabilityCategory(e.target.value)} 
              />
            </div>
            <Button 
              onClick={onAddLiability} 
              disabled={loading || !newLiabilityName || !newLiabilityAmount}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Liability
            </Button>
          </div>

          {/* Assets & Liabilities List */}
          <div className="border-t border-border pt-4 space-y-2">
            {assetsLiabilities.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${item.type === 'asset' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.type}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({item.category})
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-sm" 
                  onClick={() => onDeleteAssetLiability(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            ))}
            {!assetsLiabilities.length && (
              <div className="text-sm text-muted-foreground">No assets or liabilities yet. Add some above.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Net Worth History Chart */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Net Worth History</CardTitle>
          <p className="text-sm text-muted-foreground">Assets, liabilities, and net worth over time</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthHistory}>
                <defs>
                  <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="liabilitiesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Area 
                  type="monotone" 
                  dataKey="assets" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="url(#assetsGradient)"
                />
                <Area 
                  type="monotone" 
                  dataKey="liabilities" 
                  stackId="2"
                  stroke="#ef4444" 
                  fill="url(#liabilitiesGradient)"
                />
                <Area 
                  type="monotone" 
                  dataKey="netWorth" 
                  stackId="3"
                  stroke="#3b82f6" 
                  fill="url(#netWorthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Breakdown */}
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <TrendingUp className="h-5 w-5" />
              Assets
            </CardTitle>
            <div className="text-2xl">{formatCurrency(totalAssets)}</div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{asset.category}</p>
                        <p className="text-xs text-muted-foreground">{asset.accounts}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(asset.amount)}</TableCell>
                    <TableCell className={asset.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Liabilities Breakdown */}
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <TrendingDown className="h-5 w-5" />
              Liabilities
            </CardTitle>
            <div className="text-2xl">{formatCurrency(totalLiabilities)}</div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liabilities.map((liability, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{liability.category}</p>
                        <p className="text-xs text-muted-foreground">{liability.accounts}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(liability.amount)}</TableCell>
                    <TableCell className={liability.change >= 0 ? 'text-red-400' : 'text-green-400'}>
                      {liability.change >= 0 ? '+' : ''}{liability.change.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Asset vs Liability Comparison Chart */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Assets vs Liabilities Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Monthly comparison over the past year</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={netWorthHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Bar dataKey="assets" fill="#10b981" name="Assets" />
                <Bar dataKey="liabilities" fill="#ef4444" name="Liabilities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
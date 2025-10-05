import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "./ui/card";

interface FinanceHeaderProps {
  totalNetWorth: number;
  dailyChange: number;
  dailyChangePercent: number;
}

export function FinanceHeader({ totalNetWorth, dailyChange, dailyChangePercent }: FinanceHeaderProps) {
  const isPositive = dailyChange >= 0;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border w-full">
      <Card className="mx-6 my-4 p-6 rounded-sm bg-gradient-to-r from-card to-muted/20 w-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Net Worth</p>
            <h1 className="text-3xl">{formatCurrency(totalNetWorth)}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">24h Change</p>
            <div className={`flex items-center gap-2 text-2xl ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              <span>{formatCurrency(Math.abs(dailyChange))}</span>
              <span className="text-lg">({Math.abs(dailyChangePercent).toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
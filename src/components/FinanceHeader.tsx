import { TrendingUp, TrendingDown, LogOut } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "../lib/supabaseClient";

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
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">24h Change</p>
              <div className={`flex items-center gap-2 text-2xl ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                <span>{formatCurrency(Math.abs(dailyChange))}</span>
                <span className="text-lg">({Math.abs(dailyChangePercent).toFixed(2)}%)</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
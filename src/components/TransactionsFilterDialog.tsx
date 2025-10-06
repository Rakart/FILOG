import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface TransactionsFilter {
  q?: string;
  start?: string;
  end?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface TransactionsFilterDialogProps {
  trigger: React.ReactNode;
  initial?: TransactionsFilter;
  onApply: (f: TransactionsFilter) => void;
}

export function TransactionsFilterDialog({ trigger, initial, onApply }: TransactionsFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(initial?.q ?? "");
  const [start, setStart] = useState(initial?.start ?? "");
  const [end, setEnd] = useState(initial?.end ?? "");
  const [minAmount, setMinAmount] = useState(initial?.minAmount?.toString() ?? "");
  const [maxAmount, setMaxAmount] = useState(initial?.maxAmount?.toString() ?? "");

  const apply = () => {
    onApply({
      q: q || undefined,
      start: start || undefined,
      end: end || undefined,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Transactions</DialogTitle>
          <DialogDescription>
            Filter your transactions by search terms, date range, and amount.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor="filter-search" className="text-sm">Search</label>
            <Input 
              id="filter-search"
              name="search"
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="description contains..." 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="filter-start-date" className="text-sm">Start date</label>
              <Input 
                id="filter-start-date"
                name="startDate"
                type="date" 
                value={start} 
                onChange={(e) => setStart(e.target.value)} 
              />
            </div>
            <div>
              <label htmlFor="filter-end-date" className="text-sm">End date</label>
              <Input 
                id="filter-end-date"
                name="endDate"
                type="date" 
                value={end} 
                onChange={(e) => setEnd(e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="filter-min-amount" className="text-sm">Min amount</label>
              <Input 
                id="filter-min-amount"
                name="minAmount"
                type="number" 
                step="0.01" 
                value={minAmount} 
                onChange={(e) => setMinAmount(e.target.value)} 
              />
            </div>
            <div>
              <label htmlFor="filter-max-amount" className="text-sm">Max amount</label>
              <Input 
                id="filter-max-amount"
                name="maxAmount"
                type="number" 
                step="0.01" 
                value={maxAmount} 
                onChange={(e) => setMaxAmount(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={apply}>Apply</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
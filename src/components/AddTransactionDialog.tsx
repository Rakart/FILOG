import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { listAccounts } from "../services/importsService";
import { supabase } from "../lib/supabaseClient";

interface AddTransactionDialogProps {
  trigger: React.ReactNode;
  onCreated?: () => void;
}

export function AddTransactionDialog({ trigger, onCreated }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setError(null);
        const list = await listAccounts();
        setAccounts(list.map((a: any) => ({ id: a.id, name: a.name })));
      } catch (e: any) {
        setError(e.message || String(e));
      }
    })();
  }, [open]);

  const handleCreate = async () => {
    if (!accountId || !date || !description || !amount) return;
    setLoading(true);
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        account_id: accountId,
        posted_at: date,
        description,
        amount: Number(amount),
      });
      if (error) throw error;
      setOpen(false);
      setAccountId("");
      setDate("");
      setDescription("");
      setAmount("");
      onCreated?.();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction by filling in the details below.
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="space-y-3">
          <div>
            <label htmlFor="add-transaction-account" className="text-sm">Account</label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger id="add-transaction-account" className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="add-transaction-date" className="text-sm">Date</label>
            <Input 
              id="add-transaction-date"
              name="date"
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor="add-transaction-description" className="text-sm">Description</label>
            <Input 
              id="add-transaction-description"
              name="description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Description" 
            />
          </div>
          <div>
            <label htmlFor="add-transaction-amount" className="text-sm">Amount</label>
            <Input 
              id="add-transaction-amount"
              name="amount"
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="e.g. -25.50" 
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={loading || !accountId || !date || !description || !amount}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { listAccounts, createImportJob, commitTransactions, ParsedTransactionRow } from "../services/importsService";

interface ImportCsvDialogProps {
  trigger: React.ReactNode;
}

export function ImportCsvDialog({ trigger }: ImportCsvDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [mapDate, setMapDate] = useState<string>("");
  const [mapDesc, setMapDesc] = useState<string>("");
  const [mapAmount, setMapAmount] = useState<string>("");
  const [mapExternal, setMapExternal] = useState<string>("");
  const [stage, setStage] = useState<"select" | "map" | "preview" | "done">("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedRows: ParsedTransactionRow[] = useMemo(() => {
    if (!headers.length) return [];
    const idxDate = headers.indexOf(mapDate);
    const idxDesc = headers.indexOf(mapDesc);
    const idxAmt = headers.indexOf(mapAmount);
    const idxExt = mapExternal ? headers.indexOf(mapExternal) : -1;
    if (idxDate < 0 || idxDesc < 0 || idxAmt < 0 || !accountId) return [];
    const out: ParsedTransactionRow[] = [];
    for (const r of rows) {
      const dateStr = r[idxDate];
      const desc = r[idxDesc];
      const amt = parseFloat((r[idxAmt] || "0").replace(/[,]/g, ""));
      if (!dateStr || !desc || !Number.isFinite(amt)) continue;
      const iso = new Date(dateStr).toISOString().slice(0, 10);
      out.push({ posted_at: iso, description: desc, amount: amt, external_id: idxExt >= 0 ? r[idxExt] : undefined, account_id: accountId });
    }
    return out;
  }, [headers, rows, mapDate, mapDesc, mapAmount, mapExternal, accountId]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setError(null);
    if (!f) return;
    const text = await f.text();
    // simple CSV parse (no quoted commas support). For MVP; can replace with PapaParse later
    const lines = text.split(/\r?\n/).filter(Boolean);
    const hdrs = lines[0].split(",").map((h) => h.trim());
    const body = lines.slice(1).map((ln) => ln.split(","));
    setHeaders(hdrs);
    setRows(body);
    setStage("map");
  };

  const loadAccounts = async () => {
    try {
      const list = await listAccounts();
      setAccounts(list.map((a: any) => ({ id: a.id, name: a.name })));
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const startOpen = async () => {
    setOpen(true);
    setStage("select");
    setFile(null);
    setHeaders([]);
    setRows([]);
    setAccountId("");
    setMapDate("");
    setMapDesc("");
    setMapAmount("");
    setMapExternal("");
    await loadAccounts();
  };

  const handleCommit = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobId = await createImportJob(file?.name || "csv");
      await commitTransactions(jobId, parsedRows);
      setStage("done");
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={startOpen}>{trigger}</div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
        </DialogHeader>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {stage === "select" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm">Account</label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">CSV File</label>
              <Input type="file" accept=".csv,text/csv" onChange={onFileChange} />
            </div>
          </div>
        )}

        {stage === "map" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Date column</label>
                <Select value={mapDate} onValueChange={setMapDate}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select column" /></SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Description column</label>
                <Select value={mapDesc} onValueChange={setMapDesc}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select column" /></SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Amount column</label>
                <Select value={mapAmount} onValueChange={setMapAmount}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select column" /></SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">External ID column (optional)</label>
                <Select value={mapExternal} onValueChange={setMapExternal}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select column" /></SelectTrigger>
                  <SelectContent>
                    {["", ...headers].map((h, i) => (<SelectItem key={i} value={h}>{h || "(none)"}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStage("select")}>Back</Button>
              <Button onClick={() => setStage("preview")} disabled={!parsedRows.length}>Preview</Button>
            </div>
          </div>
        )}

        {stage === "preview" && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Ready to import {parsedRows.length} rows.</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStage("map")}>Back</Button>
              <Button onClick={handleCommit} disabled={loading || !parsedRows.length}>{loading ? "Importing…" : "Import"}</Button>
            </div>
          </div>
        )}

        {stage === "done" && (
          <div className="space-y-4">
            <div className="text-sm">Import complete.</div>
            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}



import { supabase } from "../lib/supabaseClient";

export async function fetchPrices(symbols: string[]): Promise<Record<string, { price: number; currency: string; asof: string }>> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-prices`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}` },
    body: JSON.stringify({ symbols }),
  });
  if (!res.ok) throw new Error(`get-prices failed: ${res.status}`);
  const json = await res.json();
  return json.prices || {};
}



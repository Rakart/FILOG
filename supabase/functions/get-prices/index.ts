// Supabase Edge Function: get-prices
// Fetches stock prices using Alpha Vantage; caches into public.prices

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ALPHA_VANTAGE_KEY = Deno.env.get("ALPHA_VANTAGE_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!ALPHA_VANTAGE_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing required environment variables");
}

interface PricesRequestBody {
  symbols: string[];
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    const body = (await req.json()) as PricesRequestBody;
    const symbols = Array.from(new Set((body.symbols || []).map((s) => s.trim().toUpperCase()))).slice(0, 50);
    if (!symbols.length) return new Response(JSON.stringify({ prices: {} }), { headers: { "content-type": "application/json" } });

    // Query cache first
    const cached = await fetch(`${SUPABASE_URL}/rest/v1/prices?select=symbol,price,currency,asof&symbol=in.(${symbols.join(',')})`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    }).then((r) => r.json());

    const cacheMap = new Map<string, any>();
    for (const row of cached as any[]) cacheMap.set(row.symbol.toUpperCase(), row);

    const missing = symbols.filter((s) => !cacheMap.has(s));
    const fetched: Record<string, { price: number; currency: string; asof: string }> = {};

    for (const symbol of missing) {
      // Alpha Vantage GLOBAL_QUOTE endpoint
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_KEY}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const quote = json?.["Global Quote"];
      const priceNum = parseFloat(quote?.["05. price"] ?? "");
      if (Number.isFinite(priceNum)) {
        fetched[symbol] = { price: priceNum, currency: "USD", asof: new Date().toISOString() };
      }
      // Be gentle with AV free tier
      await new Promise((r) => setTimeout(r, 250));
    }

    const upserts = Object.entries(fetched).map(([symbol, v]) => ({ symbol, price: v.price, currency: v.currency, asof: v.asof }));
    if (upserts.length) {
      await fetch(`${SUPABASE_URL}/rest/v1/prices`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "content-type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify(upserts),
      });
    }

    const result: Record<string, { price: number; currency: string; asof: string }> = {};
    for (const s of symbols) {
      const row = fetched[s] || cacheMap.get(s);
      if (row) result[s] = { price: Number(row.price), currency: row.currency || "USD", asof: row.asof };
    }

    return new Response(JSON.stringify({ prices: result }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { "content-type": "application/json" } });
  }
});



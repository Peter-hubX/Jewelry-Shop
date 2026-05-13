// src/lib/goldPrices.ts
import { db } from '@/lib/db';
import { calculateDynamicPrice } from '@/lib/pricing';

const TROY_OUNCE_GRAMS = 31.1035;
const FALLBACK_PRICES = { gram24k: 8617, gram21k: 7540, gram18k: 6463 };

export interface LivePrices {
  gram24k: number;
  gram21k: number;
  gram18k: number;
  source: string;
}

// ─── External API fetchers ────────────────────────────────────────────────────

async function fetchFromGoldAPI(): Promise<LivePrices | null> {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://www.goldapi.io/api/XAU/EGP', {
      headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) { console.warn(`GoldAPI: ${res.status}`); return null; }

    const data = await res.json();
    if (!data.price_gram_24k || !data.price_gram_21k || !data.price_gram_18k) return null;

    return {
      gram24k: Math.round(data.price_gram_24k),
      gram21k: Math.round(data.price_gram_21k),
      gram18k: Math.round(data.price_gram_18k),
      source: 'goldapi',
    };
  } catch (error) {
    console.warn('GoldAPI failed:', error);
    return null;
  }
}

async function fetchFromMetalpriceAPI(): Promise<LivePrices | null> {
  const apiKey = process.env.METALPRICEAPI_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=XAU&currencies=EGP`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) { console.warn(`MetalpriceAPI: ${res.status}`); return null; }

    const data = await res.json();
    const pricePerOz = data?.rates?.EGP;
    if (!pricePerOz || pricePerOz <= 0) return null;

    const gram24k = Math.round(pricePerOz / TROY_OUNCE_GRAMS);
    return {
      gram24k,
      gram21k: Math.round(gram24k * (21 / 24)),
      gram18k: Math.round(gram24k * (18 / 24)),
      source: 'metalpriceapi',
    };
  } catch (error) {
    console.warn('MetalpriceAPI failed:', error);
    return null;
  }
}

// ─── Strategy chain ───────────────────────────────────────────────────────────
// Each strategy is tried in order; the first non-null result wins (REFACTOR-01).

type PriceStrategy = () => Promise<LivePrices | null>;

function makeOverrideStrategy(): PriceStrategy {
  return async () => {
    const override = process.env.GOLD_BASE_PRICE_OVERRIDE;
    if (!override) return null;
    const v = Number.parseFloat(override);
    if (Number.isNaN(v) || v <= 0) return null;
    return {
      gram24k: Math.round(v),
      gram21k: Math.round(v * (21 / 24)),
      gram18k: Math.round(v * (18 / 24)),
      source: 'override',
    };
  };
}

const strategies: PriceStrategy[] = [
  makeOverrideStrategy(),
  fetchFromGoldAPI,
  fetchFromMetalpriceAPI,
];

export async function fetchLiveGoldPrices(): Promise<LivePrices | null> {
  for (const strategy of strategies) {
    const result = await strategy();
    if (result) return result;
  }
  return null;
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export async function getLiveGram24kPrice(): Promise<{ gram24k: number; gram21k: number; gram18k: number }> {
  try {
    // 1. Try to get cached price from DB first (instant)
    const cached = await db.goldPriceSetting.findUnique({ where: { id: 'canonical' } });
    
    // If we have a cached price and it's less than 10 minutes old, use it immediately
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
    if (cached && cached.lastFetchedAt && (Date.now() - new Date(cached.lastFetchedAt).getTime() < CACHE_TTL)) {
      const gram24k = Math.round(cached.basePricePerGram);
      return {
        gram24k,
        gram21k: Math.round(gram24k * (21 / 24)),
        gram18k: Math.round(gram24k * (18 / 24)),
      };
    }
  } catch (err) {
    console.warn('DB Cache read failed:', err);
  }

  // 2. If no cache or stale, fetch live (might take 1-2 seconds)
  const live = await fetchLiveGoldPrices();
  if (live) {
    // Update DB with fresh price in the background (don't await to keep response fast)
    updateGoldPricesInDb(live).catch(err => console.error('Background price update failed:', err));
    
    return { gram24k: live.gram24k, gram21k: live.gram21k, gram18k: live.gram18k };
  }

  // 3. Last resort fallback from DB (even if stale) or hardcoded defaults
  try {
    const setting = await db.goldPriceSetting.findUnique({ where: { id: 'canonical' } });
    if (setting && setting.basePricePerGram > 0) {
      const gram24k = Math.round(setting.basePricePerGram);
      return {
        gram24k,
        gram21k: Math.round(gram24k * (21 / 24)),
        gram18k: Math.round(gram24k * (18 / 24)),
      };
    }
  } catch {
    // ignore
  }

  return { ...FALLBACK_PRICES };
}

// ─── Bulk price update ────────────────────────────────────────────────────────
// SPAGHETTI-02 fix: replaced 3 sequential findMany() calls with a single query.
// All products are fetched in one round-trip and partitioned in memory (O(N)).

export async function updateGoldPricesInDb(live: LivePrices | null) {
  const prices = live ?? { ...FALLBACK_PRICES, source: 'fallback' };

  // ── Single query instead of 3 sequential scans ────────────────────────────
  const allProducts = await db.product.findMany({
    where: { karat: { in: [18, 21, 24] } },
    select: { id: true, nameAr: true, weight: true, karat: true, productType: true },
  });

  const updatedBars: { id: string; name: string; weight: number; newPrice: number }[] = [];

  const updates = allProducts
    .filter(p => p.weight && p.weight > 0)
    .map(p => {
      const goldPrices = {
        gram24k: prices.gram24k,
        gram21k: prices.gram21k,
        gram18k: prices.gram18k,
      };
      const newPrice = calculateDynamicPrice(p.weight, p.karat, p.productType, goldPrices);
      if (newPrice === null) return null;

      if (p.karat === 24 && p.productType === 'bar') {
        updatedBars.push({ id: p.id, name: p.nameAr, weight: p.weight!, newPrice });
      }

      return db.product.update({
        where: { id: p.id },
        data: { price: newPrice, updatedAt: new Date() },
      });
    })
    .filter((u): u is NonNullable<typeof u> => u !== null);

  await db.$transaction(updates);

  await db.goldPriceSetting.upsert({
    where: { id: 'canonical' },
    create: { id: 'canonical', basePricePerGram: prices.gram24k, usdRate: 0, source: prices.source },
    update: { basePricePerGram: prices.gram24k, usdRate: 0, source: prices.source, lastFetchedAt: new Date() },
  });

  return {
    karat24Price: prices.gram24k,
    karat21Price: prices.gram21k,
    karat18Price: prices.gram18k,
    source: prices.source,
    updatedBars,
    totalProductsUpdated: updates.length,
    lastUpdated: new Date().toISOString(),
  };
}

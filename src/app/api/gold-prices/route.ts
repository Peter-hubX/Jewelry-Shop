import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/** Hardcoded fallback prices (EGP per gram) — update periodically */
const FALLBACK_PRICES = { gram24k: 8617, gram21k: 7540, gram18k: 6463 };
const TROY_OUNCE_GRAMS = 31.1035;

interface LivePrices {
  gram24k: number;
  gram21k: number;
  gram18k: number;
  source: string;
}

// ─── Source 1: GoldAPI (preferred — returns exact EGP per gram per karat) ────

async function fetchFromGoldAPI(): Promise<LivePrices | null> {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://www.goldapi.io/api/XAU/EGP', {
      headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) { console.warn(`GoldAPI: ${res.status}`); return null; }
    const data = await res.json();
    if (!data.price_gram_24k || !data.price_gram_21k || !data.price_gram_18k) return null;
    console.log(`GoldAPI — 24K: ${data.price_gram_24k} | 21K: ${data.price_gram_21k} | 18K: ${data.price_gram_18k} EGP/g`);
    return {
      gram24k: Math.round(data.price_gram_24k),
      gram21k: Math.round(data.price_gram_21k),
      gram18k: Math.round(data.price_gram_18k),
      source: 'goldapi',
    };
  } catch (e) {
    console.warn('GoldAPI failed:', e);
    return null;
  }
}

// ─── Source 2: MetalpriceAPI (fallback — returns XAU/EGP per troy ounce) ─────

async function fetchFromMetalpriceAPI(): Promise<LivePrices | null> {
  const apiKey = process.env.METALPRICEAPI_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=XAU&currencies=EGP`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) { console.warn(`MetalpriceAPI: ${res.status}`); return null; }
    const data = await res.json();
    // Response: { rates: { EGP: <price per troy oz in EGP> } }
    const pricePerOz = data?.rates?.EGP;
    if (!pricePerOz || pricePerOz <= 0) return null;
    const gram24k = Math.round(pricePerOz / TROY_OUNCE_GRAMS);
    const gram21k = Math.round(gram24k * (21 / 24));
    const gram18k = Math.round(gram24k * (18 / 24));
    console.log(`MetalpriceAPI — 24K: ${gram24k} | 21K: ${gram21k} | 18K: ${gram18k} EGP/g`);
    return { gram24k, gram21k, gram18k, source: 'metalpriceapi' };
  } catch (e) {
    console.warn('MetalpriceAPI failed:', e);
    return null;
  }
}

// ─── Master fetch: override → GoldAPI → MetalpriceAPI → DB cache → fallback ──

async function fetchLiveGoldPrices(): Promise<LivePrices | null> {
  // Manual override takes highest priority
  const override = process.env.GOLD_BASE_PRICE_OVERRIDE;
  if (override) {
    const v = Number.parseFloat(override);
    if (!Number.isNaN(v) && v > 0) {
      return { gram24k: Math.round(v), gram21k: Math.round(v * 21 / 24), gram18k: Math.round(v * 18 / 24), source: 'override' };
    }
  }
  return (await fetchFromGoldAPI()) ?? (await fetchFromMetalpriceAPI());
}

// ─── POST: update all product prices in DB ────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.GOLD_PRICE_UPDATE_SECRET || 'dev-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const live = await fetchLiveGoldPrices();
    const prices = live ?? { ...FALLBACK_PRICES, source: 'fallback' };

    console.log(`Updating prices — 24K: ${prices.gram24k} | 21K: ${prices.gram21k} | 18K: ${prices.gram18k} EGP/g (${prices.source})`);

    const goldBars = await db.product.findMany({ where: { karat: 24, productType: 'bar' } });
    const updatedBars = [];
    for (const bar of goldBars) {
      if (!bar.weight || bar.weight <= 0) continue;
      const premium = bar.weight >= 10 ? 1.02 : 1.05;
      const totalPrice = Math.round(bar.weight * prices.gram24k * premium);
      await db.product.update({ where: { id: bar.id }, data: { price: totalPrice, updatedAt: new Date() } });
      updatedBars.push({ id: bar.id, name: bar.nameAr, weight: bar.weight, newPrice: totalPrice });
    }

    const products21K = await db.product.findMany({ where: { karat: 21 } });
    for (const p of products21K) {
      if (!p.weight || p.weight <= 0) continue;
      const premium = p.productType === 'bar' ? 1.08 : 1.20;
      await db.product.update({ where: { id: p.id }, data: { price: Math.round(p.weight * prices.gram21k * premium), updatedAt: new Date() } });
    }

    const products18K = await db.product.findMany({ where: { karat: 18 } });
    for (const p of products18K) {
      if (!p.weight || p.weight <= 0) continue;
      const premium = p.productType === 'bar' ? 1.10 : 1.25;
      await db.product.update({ where: { id: p.id }, data: { price: Math.round(p.weight * prices.gram18k * premium), updatedAt: new Date() } });
    }

    await db.goldPriceSetting.upsert({
      where: { id: 'canonical' },
      create: { id: 'canonical', basePricePerGram: prices.gram24k, usdRate: 0, source: prices.source },
      update: { basePricePerGram: prices.gram24k, usdRate: 0, source: prices.source, lastFetchedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Gold prices updated successfully',
      data: {
        karat24Price: prices.gram24k,
        karat21Price: prices.gram21k,
        karat18Price: prices.gram18k,
        source: prices.source,
        updatedBars,
        totalProductsUpdated: updatedBars.length + products21K.length + products18K.length,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating gold prices:', error);
    return NextResponse.json({ success: false, error: 'Failed to update gold prices', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// ─── GET: return current prices ───────────────────────────────────────────────

export async function GET() {
  try {
    const live = await fetchLiveGoldPrices();
    if (live) {
      db.goldPriceSetting.upsert({
        where: { id: 'canonical' },
        create: { id: 'canonical', basePricePerGram: live.gram24k, usdRate: 0, source: live.source },
        update: { basePricePerGram: live.gram24k, usdRate: 0, source: live.source, lastFetchedAt: new Date() },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        data: { karat24Price: live.gram24k, karat21Price: live.gram21k, karat18Price: live.gram18k, basePricePerGram: live.gram24k, source: live.source, lastUpdated: new Date().toISOString() },
      });
    }

    // DB cache fallback
    const setting = await db.goldPriceSetting.findUnique({ where: { id: 'canonical' } });
    if (setting && setting.basePricePerGram > 0) {
      const base = Math.round(setting.basePricePerGram);
      return NextResponse.json({
        success: true,
        data: { karat24Price: base, karat21Price: Math.round(base * 21 / 24), karat18Price: Math.round(base * 18 / 24), basePricePerGram: base, source: setting.source + ' (cached)', lastUpdated: (setting.lastFetchedAt ?? setting.lastUpdatedAt).toISOString() },
      });
    }

    // Hardcoded last resort
    return NextResponse.json({
      success: true,
      data: { karat24Price: FALLBACK_PRICES.gram24k, karat21Price: FALLBACK_PRICES.gram21k, karat18Price: FALLBACK_PRICES.gram18k, basePricePerGram: FALLBACK_PRICES.gram24k, source: 'fallback', lastUpdated: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch gold prices', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

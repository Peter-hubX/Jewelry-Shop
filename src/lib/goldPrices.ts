import { db } from '@/lib/db';

const TROY_OUNCE_GRAMS = 31.1035;
const FALLBACK_PRICES = { gram24k: 8617, gram21k: 7540, gram18k: 6463 };

export interface LivePrices {
  gram24k: number;
  gram21k: number;
  gram18k: number;
  source: string;
}

async function fetchFromGoldAPI(): Promise<LivePrices | null> {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://www.goldapi.io/api/XAU/EGP', {
      headers: { 'x-access-token': apiKey, 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`GoldAPI: ${res.status}`);
      return null;
    }

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
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) {
      console.warn(`MetalpriceAPI: ${res.status}`);
      return null;
    }

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

export async function fetchLiveGoldPrices(): Promise<LivePrices | null> {
  const override = process.env.GOLD_BASE_PRICE_OVERRIDE;
  if (override) {
    const v = Number.parseFloat(override);
    if (!Number.isNaN(v) && v > 0) {
      return {
        gram24k: Math.round(v),
        gram21k: Math.round(v * (21 / 24)),
        gram18k: Math.round(v * (18 / 24)),
        source: 'override',
      };
    }
  }

  return (await fetchFromGoldAPI()) ?? (await fetchFromMetalpriceAPI());
}

export async function getLiveGram24kPrice(): Promise<{ gram24k: number; gram21k: number; gram18k: number }> {
  const live = await fetchLiveGoldPrices();
  if (live) {
    return {
      gram24k: live.gram24k,
      gram21k: live.gram21k,
      gram18k: live.gram18k,
    };
  }

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
    // ignore and fall back
  }

  return {
    gram24k: FALLBACK_PRICES.gram24k,
    gram21k: FALLBACK_PRICES.gram21k,
    gram18k: FALLBACK_PRICES.gram18k,
  };
}

export async function updateGoldPricesInDb(live: LivePrices | null) {
  const prices = live ?? { ...FALLBACK_PRICES, source: 'fallback' };

  const goldBars = await db.product.findMany({ where: { karat: 24, productType: 'bar' } });
  const updatedBars: { id: string; name: string; weight: number; newPrice: number }[] = [];

  const validBars = goldBars.filter((b) => b.weight && b.weight > 0);
  const barUpdates = validBars.map((bar) => {
    const premium = bar.weight! >= 10 ? 1.02 : 1.05;
    const totalPrice = Math.round(bar.weight! * prices.gram24k * premium);
    updatedBars.push({ id: bar.id, name: bar.nameAr, weight: bar.weight!, newPrice: totalPrice });
    return db.product.update({ where: { id: bar.id }, data: { price: totalPrice, updatedAt: new Date() } });
  });

  const products21K = await db.product.findMany({ where: { karat: 21 } });
  const p21Updates = products21K.filter(p => p.weight && p.weight > 0).map((p) => {
    const premium = p.productType === 'bar' ? 1.08 : 1.2;
    return db.product.update({ where: { id: p.id }, data: { price: Math.round(p.weight! * prices.gram21k * premium), updatedAt: new Date() } });
  });

  const products18K = await db.product.findMany({ where: { karat: 18 } });
  const p18Updates = products18K.filter(p => p.weight && p.weight > 0).map((p) => {
    const premium = p.productType === 'bar' ? 1.1 : 1.25;
    return db.product.update({ where: { id: p.id }, data: { price: Math.round(p.weight! * prices.gram18k * premium), updatedAt: new Date() } });
  });

  await db.$transaction([...barUpdates, ...p21Updates, ...p18Updates]);

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
    totalProductsUpdated: updatedBars.length + products21K.length + products18K.length,
    lastUpdated: new Date().toISOString(),
  };
}

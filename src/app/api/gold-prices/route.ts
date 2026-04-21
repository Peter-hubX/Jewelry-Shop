import { db } from '@/lib/db';
import { fetchLiveGoldPrices, updateGoldPricesInDb } from '@/lib/goldPrices';
import { NextRequest, NextResponse } from 'next/server';

/** Hardcoded fallback prices (EGP per gram) — update periodically */
const FALLBACK_PRICES = { gram24k: 8617, gram21k: 7540, gram18k: 6463 };

// ─── POST: update all product prices in DB ────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.GOLD_PRICE_UPDATE_SECRET;
    if (!secret) throw new Error('GOLD_PRICE_UPDATE_SECRET is not configured');
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const live = await fetchLiveGoldPrices();
    const data = await updateGoldPricesInDb(live);

    return NextResponse.json({
      success: true,
      message: 'Gold prices updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error updating gold prices:', error);
    return NextResponse.json({ success: false, error: 'Failed to update gold prices', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// ─── GET: return current prices ───────────────────────────────────────────────

export async function GET() {
  const applyCORS = (res: NextResponse) => {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  };

  try {
    const live = await fetchLiveGoldPrices();
    if (live) {
      db.goldPriceSetting.upsert({
        where: { id: 'canonical' },
        create: { id: 'canonical', basePricePerGram: live.gram24k, usdRate: 0, source: live.source },
        update: { basePricePerGram: live.gram24k, usdRate: 0, source: live.source, lastFetchedAt: new Date() },
      }).catch((e) => console.error('DB cache update failed:', e));

      return applyCORS(NextResponse.json({
        success: true,
        data: {
          karat24Price: live.gram24k,
          karat21Price: live.gram21k,
          karat18Price: live.gram18k,
          basePricePerGram: live.gram24k,
          source: live.source,
          lastUpdated: new Date().toISOString()
        },
      }));
    }

    // DB cache fallback
    const setting = await db.goldPriceSetting.findUnique({ where: { id: 'canonical' } });
    if (setting && setting.basePricePerGram > 0) {
      const base = Math.round(setting.basePricePerGram);
      return applyCORS(NextResponse.json({
        success: true,
        data: {
          karat24Price: base,
          karat21Price: Math.round(base * 21 / 24),
          karat18Price: Math.round(base * 18 / 24),
          basePricePerGram: base,
          source: setting.source + ' (cached)',
          lastUpdated: (setting.lastFetchedAt ?? setting.lastUpdatedAt).toISOString()
        },
      }));
    }

    // Hardcoded last resort
    return applyCORS(NextResponse.json({
      success: true,
      data: {
        karat24Price: FALLBACK_PRICES.gram24k,
        karat21Price: FALLBACK_PRICES.gram21k,
        karat18Price: FALLBACK_PRICES.gram18k,
        basePricePerGram: FALLBACK_PRICES.gram24k,
        source: 'fallback',
        lastUpdated: new Date().toISOString()
      },
    }));
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return applyCORS(NextResponse.json({
      success: false,
      error: 'Failed to fetch gold prices',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 }));
  }
}

// Add OPTIONS handler for this specific route
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

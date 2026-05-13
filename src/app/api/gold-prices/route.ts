// src/app/api/gold-prices/route.ts
import { requireAdminSecret } from '@/lib/auth';
import { err, ok, preflight } from '@/lib/apiResponse';
import { fetchLiveGoldPrices, updateGoldPricesInDb } from '@/lib/goldPrices';
import { db } from '@/lib/db';

/** Hardcoded fallback prices (EGP per gram) — update periodically */
const FALLBACK_PRICES = { gram24k: 8617, gram21k: 7540, gram18k: 6463 };

// ─── POST: update all product prices in DB (admin only) ──────────────────────

export async function POST(request: Request) {
  try {
    const authError = requireAdminSecret(request as Parameters<typeof requireAdminSecret>[0], 'GOLD_PRICE_UPDATE_SECRET');
    if (authError) return authError;

    const live = await fetchLiveGoldPrices();
    const data = await updateGoldPricesInDb(live);

    return ok({ success: true, message: 'Gold prices updated successfully', data });
  } catch (error) {
    console.error('Error updating gold prices:', error);
    return err('Failed to update gold prices', 500, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ─── GET: return current prices (public) ─────────────────────────────────────

export async function GET() {
  try {
    const live = await fetchLiveGoldPrices();

    if (live) {
      // Fire-and-forget cache update — don't block the response
      db.goldPriceSetting.upsert({
        where: { id: 'canonical' },
        create: { id: 'canonical', basePricePerGram: live.gram24k, usdRate: 0, source: live.source },
        update: { basePricePerGram: live.gram24k, usdRate: 0, source: live.source, lastFetchedAt: new Date() },
      }).catch(e => console.error('DB cache update failed:', e));

      return ok({
        success: true,
        data: {
          karat24Price: live.gram24k,
          karat21Price: live.gram21k,
          karat18Price: live.gram18k,
          basePricePerGram: live.gram24k,
          source: live.source,
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    // DB cache fallback
    const setting = await db.goldPriceSetting.findUnique({ where: { id: 'canonical' } });
    if (setting && setting.basePricePerGram > 0) {
      const base = Math.round(setting.basePricePerGram);
      return ok({
        success: true,
        data: {
          karat24Price: base,
          karat21Price: Math.round(base * 21 / 24),
          karat18Price: Math.round(base * 18 / 24),
          basePricePerGram: base,
          source: setting.source + ' (cached)',
          lastUpdated: (setting.lastFetchedAt ?? setting.lastUpdatedAt).toISOString(),
        },
      });
    }

    // Hardcoded last resort
    return ok({
      success: true,
      data: {
        karat24Price: FALLBACK_PRICES.gram24k,
        karat21Price: FALLBACK_PRICES.gram21k,
        karat18Price: FALLBACK_PRICES.gram18k,
        basePricePerGram: FALLBACK_PRICES.gram24k,
        source: 'fallback',
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    return err('Failed to fetch gold prices', 500, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ─── OPTIONS: preflight ───────────────────────────────────────────────────────

export async function OPTIONS() {
  return preflight();
}

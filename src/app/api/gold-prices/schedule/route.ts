import { fetchLiveGoldPrices, updateGoldPricesInDb } from '@/lib/goldPrices';
import { NextRequest, NextResponse } from 'next/server';

// This endpoint can be called by a cron job service to update prices automatically
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.GOLD_PRICE_UPDATE_SECRET;
    if (!secret) throw new Error('GOLD_PRICE_UPDATE_SECRET is not configured');
    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const live = await fetchLiveGoldPrices();
    const data = await updateGoldPricesInDb(live);

    console.log('Scheduled gold price update completed:', data);

    return NextResponse.json({
      success: true,
      message: 'Scheduled price update completed successfully',
      data,
    });

  } catch (error) {
    console.error('Scheduled price update failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Scheduled price update failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
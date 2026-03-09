import { NextRequest, NextResponse } from 'next/server';

// This endpoint can be called by a cron job service to update prices automatically
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source (you can add authentication here)
    const authHeader = request.headers.get('authorization');
    const secret = process.env.GOLD_PRICE_UPDATE_SECRET;
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the gold price update API — must forward the Authorization header
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gold-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
      },
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update gold prices');
    }

    const result = await updateResponse.json();

    // Log the update for audit purposes
    console.log('Scheduled gold price update completed:', result);

    return NextResponse.json({
      success: true,
      message: 'Scheduled price update completed successfully',
      data: result.data
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
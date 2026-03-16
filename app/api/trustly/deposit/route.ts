import { NextRequest, NextResponse } from 'next/server';
import { initiateDeposit } from '@/lib/trustly/client';

/**
 * POST /api/trustly/deposit — initiate a Trustly instant bank deposit
 * Body: { userId, amount, currency?, orderId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, currency, orderId } = body;

    if (!userId || !amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, orderId' },
        { status: 400 },
      );
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
    const result = await initiateDeposit({
      EndUserID:       String(userId),
      MessageID:       String(orderId),
      Amount:          String(amount),
      Currency:        currency ?? 'SEK',
      Locale:          'sv_SE',
      Country:         'SE',
      NotificationURL: `${base}/api/trustly/callback`,
      SuccessURL:      `${base}/payment/success`,
      FailURL:         `${base}/payment/failed`,
    });

    console.log(`[Trustly] Deposit initiated — orderId: ${orderId}`);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Trustly POST deposit]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

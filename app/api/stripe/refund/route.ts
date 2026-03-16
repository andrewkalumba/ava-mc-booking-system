import { NextRequest, NextResponse } from 'next/server';
import { refundPayment } from '@/lib/stripe/client';

/** POST /api/stripe/refund — Body: { paymentIntentId, amount? } */
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, amount } = await req.json();
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId is required' }, { status: 400 });
    }

    const result = await refundPayment({ payment_intent: paymentIntentId, amount });
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Stripe POST refund]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

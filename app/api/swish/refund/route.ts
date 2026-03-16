import { NextRequest, NextResponse } from 'next/server';
import { createRefund } from '@/lib/swish/client';

/** POST /api/swish/refund — initiate a Swish refund
 * Body: { originalPaymentId, amount, message? }
 */
export async function POST(req: NextRequest) {
  try {
    const { originalPaymentId, amount, message } = await req.json();
    if (!originalPaymentId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: originalPaymentId, amount' },
        { status: 400 },
      );
    }

    const refundId = await createRefund({
      originalPaymentReference: originalPaymentId,
      amount:      String(amount),
      currency:    'SEK',
      message:     message ?? 'Refund',
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/swish/callback`,
    });

    return NextResponse.json({ refundId });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Swish POST refund]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

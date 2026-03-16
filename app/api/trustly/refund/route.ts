import { NextRequest, NextResponse } from 'next/server';
import { refundDeposit } from '@/lib/trustly/client';

/** POST /api/trustly/refund — Body: { orderId, amount } */
export async function POST(req: NextRequest) {
  try {
    const { orderId, amount } = await req.json();
    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount' },
        { status: 400 },
      );
    }

    const result = await refundDeposit({
      OrderID:  String(orderId),
      Amount:   String(amount),
      Currency: 'SEK',
    });
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Trustly POST refund]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

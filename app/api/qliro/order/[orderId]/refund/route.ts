import { NextRequest, NextResponse } from 'next/server';
import { refundOrder } from '@/lib/qliro/client';

/** POST /api/qliro/order/[orderId]/refund
 * Body: { refundItems: Array<{ MerchantReference, Quantity, PricePerItem }> }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const { refundItems } = await req.json();
    if (!refundItems) {
      return NextResponse.json({ error: 'refundItems is required' }, { status: 400 });
    }

    const result = await refundOrder({ OrderId: Number(orderId), RefundItems: refundItems });
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Qliro refund]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

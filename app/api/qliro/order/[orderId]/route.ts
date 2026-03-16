import { NextRequest, NextResponse } from 'next/server';
import { getOrderStatus } from '@/lib/qliro/client';

/** GET /api/qliro/order/[orderId] — get order status */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const result = await getOrderStatus(Number(orderId));
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Qliro GET order]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

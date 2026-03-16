import { NextRequest, NextResponse } from 'next/server';
import { cancelOrder } from '@/lib/qliro/client';

/** POST /api/qliro/order/[orderId]/cancel */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    await cancelOrder(Number(orderId));
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Qliro cancel]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

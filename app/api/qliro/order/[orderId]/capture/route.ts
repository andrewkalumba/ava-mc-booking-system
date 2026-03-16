import { NextRequest, NextResponse } from 'next/server';
import { captureOrder } from '@/lib/qliro/client';

/** POST /api/qliro/order/[orderId]/capture */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const result = await captureOrder(Number(orderId));
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Qliro capture]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

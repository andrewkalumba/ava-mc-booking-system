import { NextRequest, NextResponse } from 'next/server';
import { createCheckout, QliroOrderItem } from '@/lib/qliro/client';

/** POST /api/qliro/checkout — create a Qliro One checkout */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderLines, currency, country, merchantOrderId, customer } = body;

    if (!orderLines || !merchantOrderId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderLines, merchantOrderId' },
        { status: 400 },
      );
    }

    const orderItems: QliroOrderItem[] = orderLines;
    const totalPrice = orderItems.reduce(
      (sum: number, item: QliroOrderItem) => sum + item.PricePerItemIncVat * item.Quantity,
      0,
    );
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

    const result = await createCheckout({
      MerchantOrderId:         merchantOrderId,
      MerchantReference:       merchantOrderId,
      Currency:                currency ?? 'SEK',
      Country:                 country  ?? 'SE',
      Language:                'sv-SE',
      OrderItems:              orderItems,
      TotalPrice:              totalPrice,
      Customer:                customer,
      MerchantConfirmationUrl: `${baseUrl}/payment/success`,
      MerchantNotificationUrl: `${baseUrl}/api/qliro/callback`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Qliro POST checkout]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

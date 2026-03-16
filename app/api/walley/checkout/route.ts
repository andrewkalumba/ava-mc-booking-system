import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@/lib/walley/client';

/** POST /api/walley/checkout — create a Walley checkout session
 * Body: { reference, items, customer?, currency? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, items, customer, currency } = body;

    if (!reference || !items) {
      return NextResponse.json(
        { error: 'Missing required fields: reference, items' },
        { status: 400 },
      );
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
    const result = await createCheckout({
      storeId:          process.env.WALLEY_STORE_ID ?? '',
      countryCode:      'SE',
      currency:         currency ?? 'SEK',
      reference,
      items,
      customer,
      redirectPageUri:  `${base}/payment/success`,
      merchantTermsUri: `${base}/terms`,
      notificationUri:  `${base}/api/walley/callback`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Walley POST checkout]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { initiateSign } from '@/lib/bankid_pay/client';

/**
 * POST /api/bankid-pay/sign — initiate BankID signing for a payment
 * Body: { personalNumber?, endUserIp, userVisibleData, userNonVisibleData? }
 */
export async function POST(req: NextRequest) {
  try {
    const { endUserIp, userVisibleData, userNonVisibleData } = await req.json();
    const ip = endUserIp ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';

    if (!userVisibleData) {
      return NextResponse.json({ error: 'userVisibleData is required' }, { status: 400 });
    }

    // initiateSign(endUserIp, userVisibleData, extraParams?)
    const result = await initiateSign(ip, userVisibleData, userNonVisibleData ? { userNonVisibleData } : undefined);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[BankID Pay sign]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

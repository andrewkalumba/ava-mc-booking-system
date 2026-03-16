import { NextRequest, NextResponse } from 'next/server';
import { initiateAuth } from '@/lib/bankid_pay/client';

/**
 * POST /api/bankid-pay/auth — start BankID payment authentication
 * Body: { personalNumber?, endUserIp }
 */
export async function POST(req: NextRequest) {
  try {
    const { endUserIp } = await req.json();
    const ip = endUserIp ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';

    // BankID v6.0 removed personalNumber from auth requests
    const result = await initiateAuth(ip);
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[BankID Pay auth]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

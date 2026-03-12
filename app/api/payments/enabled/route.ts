import { NextRequest, NextResponse } from 'next/server';
import { getStoredConfig } from '@/lib/payments/config-store';
import { getDealerConfig } from '@/lib/payments/dealer-config';
import { getProvider } from '@/lib/payments/registry';

/**
 * GET /api/payments/enabled?dealerId=ava-mc
 *
 * Returns the display info (name, icon, description, category) for all payment
 * providers the dealer has enabled in their Settings → Payment Providers.
 * No credentials are ever returned.
 *
 * Priority:
 *   1. Admin-saved config from data/payment-configs.json (via settings page)
 *   2. Hardcoded default from lib/payments/dealer-config.ts
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get('dealerId');

  if (!dealerId) {
    return NextResponse.json({ error: 'dealerId is required' }, { status: 400 });
  }

  try {
    // 1. Prefer the admin-saved config (Settings → Payments)
    const stored = getStoredConfig(dealerId);
    const providerIds: string[] =
      stored?.enabledProviders?.length
        ? stored.enabledProviders
        // 2. Fall back to hardcoded defaults so payment options always show
        : getDealerConfig(dealerId).enabledProviders;

    const enabledProviders = providerIds
      .map((pid) => getProvider(pid))
      .filter(Boolean)
      .map((p) => ({
        id:           p!.id,
        name:         p!.name,
        icon:         p!.icon,
        description:  p!.description,
        category:     p!.category,
        capabilities: p!.capabilities,
        currencies:   p!.currencies,
      }));

    return NextResponse.json({ enabledProviders });
  } catch (error: any) {
    console.error('[GET /api/payments/enabled]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

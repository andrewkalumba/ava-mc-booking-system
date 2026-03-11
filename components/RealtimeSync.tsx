'use client';

import { useEffect } from 'react';
import { startSupabaseSync } from '@/lib/realtime';
import { getDealershipId } from '@/lib/tenant';

/**
 * Invisible client component that opens a single Supabase Realtime channel
 * for the current dealer. Mounted once in the root layout so all pages stay
 * live across devices without any per-page wiring.
 */
export default function RealtimeSync() {
  useEffect(() => {
    const id = getDealershipId();
    if (!id) return;
    return startSupabaseSync(id);
  }, []);

  return null;
}

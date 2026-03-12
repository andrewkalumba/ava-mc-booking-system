'use client';

import { useEffect, useRef } from 'react';
import { startSupabaseSync } from '@/lib/realtime';
import { getDealershipId } from '@/lib/tenant';

/**
 * Invisible component mounted once in the root layout.
 * Opens a single Supabase Realtime WebSocket channel for the current dealer,
 * bridging Postgres change events → BroadcastChannel → all useAutoRefresh hooks.
 *
 * Polls every second until a dealershipId appears in localStorage (after login),
 * so it works whether the user is already logged in or logs in later in the same tab.
 */
export default function RealtimeSync() {
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    function tryStart() {
      if (stopRef.current) return; // already running
      const id = getDealershipId();
      if (!id) return;
      stopRef.current = startSupabaseSync(id);
    }

    // Try immediately (user already logged in)
    tryStart();
    if (stopRef.current) return; // started — no polling needed

    // Poll every second until the user logs in.
    // localStorage.setItem() doesn't fire storage events on the same tab,
    // so we must poll rather than listen for 'storage'.
    const interval = setInterval(tryStart, 1000);
    return () => {
      clearInterval(interval);
      stopRef.current?.();
      stopRef.current = null;
    };
  }, []);

  return null;
}

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Single browser singleton — all browser code shares this one instance ──────
let _browser: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (!_browser) _browser = createClient(url, key);
  return _browser;
}

// ── Named export for convenience — same instance as getSupabaseBrowser() ──────
export const supabase = getSupabaseBrowser();

// ── Server / API-route client (anon key) ─────────────────────────────────────
export function getSupabaseServer() {
  return createClient(url, key);
}

// ── Service-role client — bypasses RLS, server-side only ─────────────────────
// Use ONLY in API routes that have their own auth (e.g. webhook secret check).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
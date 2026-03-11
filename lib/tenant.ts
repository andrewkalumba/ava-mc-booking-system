// ── Tenant context ─────────────────────────────────────────────────────────────
// Every dealership that registers gets a unique UUID written to
// localStorage['user'].dealershipId at signup time (and retrieved from
// Supabase on every subsequent login).
//
// All Supabase queries must call .eq('dealership_id', getDealershipId()) so
// that dealers can never read or write each other's data.

export function getDealershipId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return (user.dealershipId as string) || null;
  } catch {
    return null;
  }
}

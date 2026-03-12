
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useAutoRefresh } from '@/lib/realtime';

interface AuditEntry {
  id:        string;
  action:    string;
  entity:    string;
  entityId:  string | null;
  details:   string | null;
  ipAddress: string | null;
  createdAt: string;
  source:    'audit' | 'webhook';
}

const ACTION_COLORS: Record<string, string> = {
  BANKID_AUTH:            'bg-[#235971]/10 text-[#235971]',
  CUSTOMER_CREATED:       'bg-green-100 text-green-700',
  CUSTOMER_UPDATED:       'bg-blue-100 text-blue-700',
  BOOKING_CREATED:        'bg-orange-100 text-orange-700',
  BOOKING_STATUS_CHANGED: 'bg-amber-100 text-amber-700',
  LEAD_CREATED:           'bg-green-100 text-green-700',
  LEAD_UPDATED:           'bg-blue-100 text-blue-700',
  INVOICE_CREATED:        'bg-purple-100 text-purple-700',
  AUTHORISATION:          'bg-[#FF6B2C]/10 text-[#FF6B2C]',
  PAID:                   'bg-green-100 text-green-700',
};

function actionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find(k =>
    action.toUpperCase().includes(k)
  );
  return key ? ACTION_COLORS[key] : 'bg-slate-100 text-slate-600';
}

function entityIcon(entity: string, source: AuditEntry['source']): string {
  if (source === 'webhook') return '🔔';
  const e = entity.toLowerCase();
  if (e.includes('customer'))  return '👤';
  if (e.includes('booking'))   return '📅';
  if (e.includes('lead'))      return '🎯';
  if (e.includes('invoice'))   return '🧾';
  return '📋';
}

export default function AuditLogPage() {
  const t      = useTranslations('pages');
  const router = useRouter();

  const [entries,  setEntries]  = useState<AuditEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [wsLive,   setWsLive]   = useState(false);
  const channelRef = useRef<ReturnType<typeof getSupabaseBrowser> | null>(null);

  const loadEntries = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = getSupabaseBrowser() as any;

    const [auditRes, webhookRes] = await Promise.all([
      sb.from('AuditLog')
        .select('id, action, entity, "entityId", details, "ipAddress", "createdAt"')
        .order('createdAt', { ascending: false })
        .limit(300),
      sb.from('webhook_events')
        .select('id, provider, event_type, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

    const audit: AuditEntry[] = (auditRes.data ?? []).map((r: any) => ({
      id:        r.id,
      action:    r.action,
      entity:    r.entity,
      entityId:  r.entityId ?? null,
      details:   r.details ?? null,
      ipAddress: r.ipAddress ?? null,
      createdAt: r.createdAt,
      source:    'audit' as const,
    }));

    const webhooks: AuditEntry[] = (webhookRes.data ?? []).map((r: any) => ({
      id:        String(r.id),
      action:    r.event_type,
      entity:    r.provider,
      entityId:  null,
      details:   typeof r.payload === 'object'
                   ? JSON.stringify(r.payload).slice(0, 120)
                   : String(r.payload ?? '—'),
      ipAddress: null,
      createdAt: r.created_at,
      source:    'webhook' as const,
    }));

    const combined = [...audit, ...webhooks].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setEntries(combined);
    setLoading(false);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { router.replace('/auth/login'); return; }
    const u = JSON.parse(raw);
    if (u.role !== 'admin') {
      toast.error('Audit Log is only available to administrators.');
      router.replace('/dashboard');
      return;
    }

    loadEntries();

    // ── Direct Supabase Realtime WebSocket for webhook_events ─────────────────
    // webhook_events has Realtime enabled in supabase-setup.sql
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = getSupabaseBrowser() as any;
    const ch = sb
      .channel('audit-log-live')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'webhook_events' },
        (payload: any) => {
          const r = payload.new;
          const newEntry: AuditEntry = {
            id:        String(r.id),
            action:    r.event_type,
            entity:    r.provider,
            entityId:  null,
            details:   typeof r.payload === 'object'
                         ? JSON.stringify(r.payload).slice(0, 120)
                         : String(r.payload ?? '—'),
            ipAddress: null,
            createdAt: r.created_at,
            source:    'webhook',
          };
          setEntries(prev => [newEntry, ...prev]);
          toast.success(`Webhook: ${r.event_type} (${r.provider})`);
        })
      .subscribe((status: string) => {
        setWsLive(status === 'SUBSCRIBED');
      });

    channelRef.current = ch;
    return () => {
      sb.removeChannel(ch);
      channelRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload on any BroadcastChannel data:refresh event
  useAutoRefresh(loadEntries);

  const filtered = filter
    ? entries.filter(e =>
        e.action.toLowerCase().includes(filter.toLowerCase()) ||
        e.entity.toLowerCase().includes(filter.toLowerCase()) ||
        (e.entityId ?? '').toLowerCase().includes(filter.toLowerCase()) ||
        (e.details  ?? '').toLowerCase().includes(filter.toLowerCase())
      )
    : entries;

  const auditCount   = entries.filter(e => e.source === 'audit').length;
  const webhookCount = entries.filter(e => e.source === 'webhook').length;

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <div className="brand-top-bar" />

        {/* Header */}
        <div className="px-5 md:px-8 py-6 bg-white border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-black text-[#0b1524]">
                📜 {t('auditLog.title')}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{t('auditLog.desc')}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* WebSocket status */}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${wsLive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${wsLive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                {wsLive ? 'WebSocket Live' : 'Connecting…'}
              </span>
              <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                {auditCount} audit · {webhookCount} webhooks
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Sök åtgärd, entitet eller ID…"
              className="w-72 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B2C]/30 focus:border-[#FF6B2C]"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                Rensa
              </button>
            )}
            <span className="text-xs text-slate-400 ml-auto">
              {filtered.length} poster visas
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="px-5 md:px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-[#FF6B2C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <div className="text-4xl mb-3">📜</div>
              <p className="text-sm font-medium">Inga poster hittades.</p>
              {filter && <p className="text-xs mt-1 text-slate-300">Prova att rensa sökningen.</p>}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {['Tidpunkt', 'Källa', 'Åtgärd', 'Entitet', 'ID', 'Detaljer', 'IP'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e, i) => (
                      <tr
                        key={e.id + i}
                        className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap font-mono">
                          {new Date(e.createdAt).toLocaleString('sv-SE')}
                        </td>
                        <td className="px-5 py-3">
                          {e.source === 'webhook' ? (
                            <span className="text-[10px] bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded">
                              webhook
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                              system
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${actionColor(e.action)}`}>
                            {e.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600 font-medium whitespace-nowrap">
                          <span className="mr-1">{entityIcon(e.entity, e.source)}</span>
                          {e.entity}
                        </td>
                        <td className="px-5 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                          {e.entityId ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 max-w-[260px] truncate" title={e.details ?? ''}>
                          {e.details ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-xs font-mono text-slate-300">
                          {e.ipAddress ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

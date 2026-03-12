'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getLeads, type Lead } from '@/lib/leads';
import { useAutoRefresh } from '@/lib/realtime';

type Status = Lead['status'];
type Stage  = Lead['stage'];

const STATUS_STYLE: Record<Status, { dot: string; text: string; bg: string }> = {
  hot:  { dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50' },
  warm: { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50' },
  cold: { dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50' },
};

function LeadCard({ lead, statusLabel }: { lead: Lead; statusLabel: string }) {
  const s = STATUS_STYLE[lead.status];
  return (
    <Link href={`/sales/leads/${lead.id}/agreement`} className="kanban-card bg-white rounded-xl border border-slate-100 p-4 block">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0b1524] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {lead.initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 truncate">{lead.name}</span>
              {lead.verified && (
                <span className="text-[9px] bg-[#0b1524] text-white px-1.5 py-0.5 rounded font-bold tracking-wide shrink-0">
                  BankID
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{lead.bike}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${s.bg} ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot} ${lead.status === 'hot' ? 'animate-pulse-dot' : ''}`} />
          {statusLabel}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#0b1524]">{lead.value}</span>
        <span className="text-[11px] text-slate-400">{lead.time}</span>
      </div>
    </Link>
  );
}

export default function PipelinePage() {
  const router = useRouter();
  const t = useTranslations('leads');
  const [ready, setReady] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');

  const COLUMNS: { id: Stage; label: string; color: string; bg: string }[] = [
    { id: 'new',         label: t('columns.new'),         color: '#FF6B2C', bg: '#fff5f0' },
    { id: 'contacted',   label: t('columns.contacted'),   color: '#f59e0b', bg: '#fffbeb' },
    { id: 'testride',    label: t('columns.testRide'),    color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'negotiating', label: t('columns.negotiating'), color: '#3b82f6', bg: '#eff6ff' },
    { id: 'closed',      label: t('columns.closed'),      color: '#10b981', bg: '#f0fdf4' },
  ];

  const STATUS_LABELS: Record<Status, string> = {
    hot:  t('status.hot'),
    warm: t('status.warm'),
    cold: t('status.cold'),
  };

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { router.replace('/auth/login'); return; }
    const u = JSON.parse(raw);
    if (u.role === 'service') {
      toast.error('The Sales Pipeline is not available for Service users.');
      router.replace('/dashboard');
      return;
    }
    getLeads().then(data => { setLeads(data); setReady(true); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutoRefresh(() => { getLeads().then(setLeads); });

  if (!ready) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
      <div className="w-10 h-10 border-4 border-[#FF6B2C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const filtered = leads.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.bike.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = leads
    .filter(l => l.stage !== 'closed')
    .reduce((sum, l) => sum + parseInt(l.value.replace(/\D/g, '')) * 1000, 0);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <div className="brand-top-bar" />

        {/* Page header */}
        <div className="px-5 md:px-8 py-6 bg-white border-b border-slate-100 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">{t('breadcrumb.sales')}</p>
              <h1 className="text-2xl font-bold text-slate-900">{t('breadcrumb.pipeline')}</h1>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C] outline-none w-48"
              />
              <Link
                href="/sales/leads/new"
                className="flex items-center gap-2 bg-[#FF6B2C] hover:bg-[#e55a1f] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
              >
                {t('newLead')}
              </Link>
            </div>
          </div>

          {/* Summary bar */}
          <div className="flex flex-wrap gap-6 mt-5">
            {COLUMNS.map(col => {
              const count = filtered.filter(l => l.stage === col.id).length;
              return (
                <div key={col.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }} />
                  <span className="text-xs text-slate-500">{col.label}</span>
                  <span className="text-xs font-bold text-slate-900">{count}</span>
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-2 text-xs">
              <span className="text-slate-400">{t('pipelineValue')}</span>
              <span className="font-bold text-slate-900">
                {(totalValue / 1_000_000).toFixed(1)}M kr
              </span>
            </div>
          </div>
        </div>

        {/* Kanban board — horizontal scroll */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-5 md:p-8 min-w-max">
            {COLUMNS.map(col => {
              const colLeads = filtered.filter(l => l.stage === col.id);
              const colValue = colLeads.reduce(
                (sum, l) => sum + parseInt(l.value.replace(/\D/g, '')) * 1000, 0
              );
              return (
                <div key={col.id} className="w-72 flex flex-col gap-3 animate-fade-up">
                  {/* Column header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: col.color }}
                      />
                      <span className="text-sm font-bold text-slate-700">{col.label}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: col.bg, color: col.color }}
                      >
                        {colLeads.length}
                      </span>
                    </div>
                    {colValue > 0 && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {(colValue / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>

                  {/* Column accent bar */}
                  <div className="h-1 rounded-full" style={{ background: col.color, opacity: 0.3 }} />

                  {/* Cards */}
                  <div className="flex flex-col gap-2.5">
                    {colLeads.length === 0 ? (
                      <div className="h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <span className="text-xs text-slate-300">{t('noLeads')}</span>
                      </div>
                    ) : (
                      colLeads.map(lead => (
                        <LeadCard key={lead.id} lead={lead} statusLabel={STATUS_LABELS[lead.status]} />
                      ))
                    )}
                  </div>

                  {/* Add button */}
                  {col.id === 'new' && (
                    <Link
                      href="/sales/leads/new"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-400 hover:border-[#FF6B2C] hover:text-[#FF6B2C] transition-colors"
                    >
                      {t('addLead')}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

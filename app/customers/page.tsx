'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Sidebar from '@/components/Sidebar';

type Tag = 'VIP' | 'Active' | 'New' | 'Inactive';
type Source = 'BankID' | 'Manual';
type Tab = 'all' | 'active' | 'vip' | 'bankid' | 'inactive';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  personnummer: string;
  email: string;
  phone: string;
  source: Source;
  vehicles: number;
  lifetimeValue: number;
  lastActivity: string;
  tag: Tag;
  bankidVerified: boolean;
  protectedIdentity: boolean;
  address: string;
  gender: 'Man' | 'Kvinna';
  birthDate: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: 1, firstName: 'Anna', lastName: 'Svensson', personnummer: '19850612-XXXX', email: 'anna@svensson.se', phone: '070-555 1234', source: 'BankID', vehicles: 3, lifetimeValue: 445000, lastActivity: 'Feb 8', tag: 'VIP', bankidVerified: true, protectedIdentity: false, address: 'Vasagatan 8, 111 20 Stockholm', gender: 'Kvinna', birthDate: '1985-06-12' },
  { id: 2, firstName: 'Erik', lastName: 'Lindgren', personnummer: '19900315-XXXX', email: 'erik@lindgren.se', phone: '073-888 9012', source: 'BankID', vehicles: 2, lifetimeValue: 256400, lastActivity: 'Feb 6', tag: 'Active', bankidVerified: true, protectedIdentity: false, address: 'Storgatan 12, 115 41 Stockholm', gender: 'Man', birthDate: '1990-03-15' },
  { id: 3, firstName: 'Lars', lastName: 'Bergman', personnummer: '', email: 'lars@gmail.com', phone: '076-123 4567', source: 'Manual', vehicles: 1, lifetimeValue: 133280, lastActivity: 'Today', tag: 'New', bankidVerified: false, protectedIdentity: false, address: 'Björkvägen 3, 172 34 Sundbyberg', gender: 'Man', birthDate: '' },
  { id: 4, firstName: 'Anders', lastName: 'Nilsson', personnummer: '19780824-XXXX', email: 'anders@email.se', phone: '070-111 2222', source: 'BankID', vehicles: 1, lifetimeValue: 89900, lastActivity: 'Feb 3', tag: 'Active', bankidVerified: true, protectedIdentity: true, address: '', gender: 'Man', birthDate: '1978-08-24' },
  { id: 5, firstName: 'Maria', lastName: 'Dahl', personnummer: '', email: 'maria.d@hotmail.com', phone: '076-444 5678', source: 'Manual', vehicles: 1, lifetimeValue: 89900, lastActivity: 'Feb 3', tag: 'Active', bankidVerified: false, protectedIdentity: false, address: 'Parkgatan 7, 211 21 Malmö', gender: 'Kvinna', birthDate: '' },
  { id: 6, firstName: 'Karl', lastName: 'Eriksson', personnummer: '19950101-XXXX', email: 'karl.e@live.se', phone: '076-999 3344', source: 'BankID', vehicles: 0, lifetimeValue: 0, lastActivity: 'Jan 28', tag: 'New', bankidVerified: true, protectedIdentity: false, address: 'Nygatan 22, 582 22 Linköping', gender: 'Man', birthDate: '1995-01-01' },
  { id: 7, firstName: 'Sofia', lastName: 'Holm', personnummer: '19881115-XXXX', email: 'sofia.holm@gmail.com', phone: '073-222 8899', source: 'BankID', vehicles: 2, lifetimeValue: 198500, lastActivity: 'Jan 20', tag: 'Active', bankidVerified: true, protectedIdentity: false, address: 'Drottninggatan 45, 411 07 Göteborg', gender: 'Kvinna', birthDate: '1988-11-15' },
  { id: 8, firstName: 'Jonas', lastName: 'Berg', personnummer: '', email: 'jonas.b@telia.com', phone: '070-777 3311', source: 'Manual', vehicles: 0, lifetimeValue: 0, lastActivity: 'Jan 15', tag: 'Inactive', bankidVerified: false, protectedIdentity: false, address: 'Kyrkogatan 8, 722 15 Västerås', gender: 'Man', birthDate: '' },
  { id: 9, firstName: 'Petra', lastName: 'Johansson', personnummer: '19720304-XXXX', email: 'petra.j@hotmail.com', phone: '076-555 7788', source: 'BankID', vehicles: 4, lifetimeValue: 612000, lastActivity: 'Jan 10', tag: 'VIP', bankidVerified: true, protectedIdentity: false, address: 'Strandvägen 100, 114 51 Stockholm', gender: 'Kvinna', birthDate: '1972-03-04' },
  { id: 10, firstName: 'Marcus', lastName: 'Lindqvist', personnummer: '', email: 'm.lindqvist@gmail.com', phone: '073-666 0011', source: 'Manual', vehicles: 1, lifetimeValue: 74900, lastActivity: 'Dec 28', tag: 'Inactive', bankidVerified: false, protectedIdentity: false, address: 'Ringvägen 15, 118 60 Stockholm', gender: 'Man', birthDate: '' },
];

const TAG_STYLES: Record<Tag, string> = {
  VIP:      'bg-amber-100 text-amber-700',
  Active:   'bg-green-100 text-green-700',
  New:      'bg-blue-100 text-blue-700',
  Inactive: 'bg-slate-100 text-slate-500',
};


function filterByTab(customers: Customer[], tab: Tab): Customer[] {
  switch (tab) {
    case 'active':   return customers.filter(c => c.tag === 'Active' || c.tag === 'VIP');
    case 'vip':      return customers.filter(c => c.tag === 'VIP');
    case 'bankid':   return customers.filter(c => c.bankidVerified);
    case 'inactive': return customers.filter(c => c.tag === 'Inactive');
    default:         return customers;
  }
}

export default function CustomersPage() {
  const router = useRouter();
  const t = useTranslations('customers');
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: 'all',      label: t('tabs.all'),      count: 342 },
    { id: 'active',   label: t('tabs.active'),   count: 156 },
    { id: 'vip',      label: t('tabs.vip'),      count: 23  },
    { id: 'bankid',   label: t('tabs.bankid'),   count: 89  },
    { id: 'inactive', label: t('tabs.inactive'), count: 163 },
  ];

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { router.push('/auth/login'); return; }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
      <div className="w-10 h-10 border-4 border-[#FF6B2C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabFiltered = filterByTab(MOCK_CUSTOMERS, tab);
  const displayed = tabFiltered.filter(c =>
    !search ||
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const bankidCount  = MOCK_CUSTOMERS.filter(c => c.bankidVerified).length;
  const protectedCount = MOCK_CUSTOMERS.filter(c => c.protectedIdentity).length;
  const unverifiedCount = MOCK_CUSTOMERS.filter(c => !c.bankidVerified).length;
  const bankidPct = Math.round((bankidCount / MOCK_CUSTOMERS.length) * 100);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <div className="brand-top-bar" />

        {/* Page header */}
        <div className="px-5 md:px-8 py-6 bg-white border-b border-slate-100 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">CRM</p>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                👥 {t('title')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C] outline-none w-48"
              />
              <Link
                href="/customers/new"
                className="flex items-center gap-2 bg-[#235971] hover:bg-[#1a4557] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
              >
                {t('addWithBankID')}
              </Link>
              <Link
                href="/customers/new"
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center text-lg transition-colors"
                title={t('addManuallyTitle')}
              >
                ＋
              </Link>
              <button className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">
                {t('export')}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mt-5 border-b border-slate-100 -mb-6">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-[#FF6B2C] text-[#FF6B2C]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.id ? 'bg-[#FF6B2C]/10 text-[#FF6B2C]' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 px-5 md:px-8 py-6 animate-fade-up overflow-x-auto">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {[t('table.name'), t('table.email'), t('table.phone'), t('table.source'), t('table.vehicles'), t('table.lifetimeValue'), t('table.lastActivity'), t('table.tags')].map(col => (
                    <th key={col} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3.5">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((c, i) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/customers/${c.id}`)}
                    className={`border-b border-slate-50 hover:bg-[#FF6B2C]/5 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0b1524] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-900">{c.firstName} {c.lastName}</span>
                            {c.protectedIdentity && <span title={t('stats.protected')}>🛡️</span>}
                          </div>
                          {c.personnummer && (
                            <div className="text-[11px] text-slate-400">{c.personnummer}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-5 py-3.5 text-sm text-slate-600">{c.email}</td>
                    {/* Phone */}
                    <td className="px-5 py-3.5 text-sm text-slate-600">{c.phone}</td>
                    {/* Source */}
                    <td className="px-5 py-3.5">
                      {c.source === 'BankID' ? (
                        <span className="inline-flex items-center gap-1 bg-[#235971] text-white text-[11px] font-bold px-2 py-1 rounded">
                          BankID
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-slate-100 text-slate-500 text-[11px] font-semibold px-2 py-1 rounded">
                          {t('sourceBadge.manual')}
                        </span>
                      )}
                    </td>
                    {/* Vehicles */}
                    <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">{c.vehicles}</td>
                    {/* Lifetime Value */}
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">
                      {c.lifetimeValue > 0 ? `${c.lifetimeValue.toLocaleString('sv-SE')} kr` : '—'}
                    </td>
                    {/* Last Activity */}
                    <td className="px-5 py-3.5 text-sm text-slate-500">{c.lastActivity}</td>
                    {/* Tag */}
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${TAG_STYLES[c.tag]}`}>
                        {c.tag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {displayed.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">
                {t('table.noResults')}
              </div>
            )}

            {/* Pagination hint */}
            <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
              {t('table.showing', { count: displayed.length })} &nbsp;•&nbsp; ← 1 2 3 … 57 →
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="bg-white border-t border-slate-100 px-5 md:px-8 py-4">
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">342</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('stats.totalCustomers')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#235971]">{bankidCount}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('stats.bankidVerified')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{bankidPct}%</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('stats.bankidShare')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{protectedCount}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('stats.protected')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FF6B2C]">{unverifiedCount}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('stats.unverified')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

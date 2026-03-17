
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Sidebar from '@/components/Sidebar';
import BankIDModal from '@/components/bankIdModel';
import type { BankIDResult } from '@/types';

type VerifyTab = 'bankid' | 'personnummer' | 'email';

// ─── helpers ──────────────────────────────────────────────────────────────────

function normPnr(s: string) { return (s ?? '').replace(/\D/g, '').slice(-10); }

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations('settings');

  // ── verification state ────────────────────────────────────────────────────
  const [verified,     setVerified]     = useState(false);
  const [verifyTab,    setVerifyTab]    = useState<VerifyTab>('bankid');
  const [showBankID,   setShowBankID]   = useState(false);
  const [pnrInput,     setPnrInput]     = useState('');
  const [emailInput,   setEmailInput]   = useState('');
  const [verifyError,  setVerifyError]  = useState('');

  // ── app state ─────────────────────────────────────────────────────────────
  const [userRole,     setUserRole]     = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [storedUser,   setStoredUser]   = useState<any>(null);

  const ADMIN_ONLY_IDS = ['payments', 'integrations', 'users', 'billing'];

  const SETTINGS_SECTIONS = [
    { id: 'payments',      icon: '💳', title: t('sections.payments.title'),      desc: t('sections.payments.desc'),      href: '/settings/payments',      live: true,  badge: t('sections.payments.badge'),      badgeCls: 'bg-green-100 text-green-700' },
    { id: 'profile',       icon: '🏢', title: t('sections.profile.title'),       desc: t('sections.profile.desc'),       href: '/settings/profile',       live: true,  badge: t('sections.profile.badge'),       badgeCls: 'bg-green-100 text-green-700' },
    { id: 'users',         icon: '👥', title: t('sections.users.title'),         desc: t('sections.users.desc'),         href: '/settings/users',         live: true,  badge: t('sections.users.badge'),         badgeCls: 'bg-green-100 text-green-700' },
    { id: 'notifications', icon: '🔔', title: t('sections.notifications.title'), desc: t('sections.notifications.desc'), href: '/settings/notifications', live: true,  badge: t('sections.notifications.badge'), badgeCls: 'bg-orange-100 text-orange-700' },
    { id: 'integrations',  icon: '🔌', title: t('sections.integrations.title'),  desc: t('sections.integrations.desc'),  href: '/settings/integrations',  live: true,  badge: t('sections.integrations.badge'),  badgeCls: 'bg-green-100 text-green-700' },
    { id: 'billing',       icon: '📄', title: t('sections.billing.title'),       desc: t('sections.billing.desc'),       href: '/settings/billing',       live: true,  badge: t('sections.billing.badge'),       badgeCls: 'bg-green-100 text-green-700' },
  ];

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) { router.push('/auth/login'); return; }
    const u = JSON.parse(raw);
    setUserRole(u.role ?? 'sales');
    setStoredUser(u);
    if (sessionStorage.getItem('settings_verified') === '1') setVerified(true);
  }, [router]);

  // ── verification helpers ──────────────────────────────────────────────────

  function unlock() {
    sessionStorage.setItem('settings_verified', '1');
    setVerified(true);
    setVerifyError('');
  }

  function handleBankIDComplete(result: BankIDResult) {
    setShowBankID(false);
    const inputPnr  = normPnr(result.user.personalNumber);
    const storedPnr = normPnr(storedUser?.personalNumber ?? storedUser?.personnummer ?? '');
    // If we have a stored PNR, verify it matches; otherwise just trust BankID auth
    if (storedPnr && inputPnr !== storedPnr) {
      setVerifyError(t('verify.errorMismatch'));
      return;
    }
    unlock();
  }

  function handlePnrVerify() {
    const storedPnr = normPnr(storedUser?.personalNumber ?? storedUser?.personnummer ?? '');
    if (!storedPnr) { setVerifyError(t('verify.errorNoData')); return; }
    if (normPnr(pnrInput) !== storedPnr) { setVerifyError(t('verify.errorMismatch')); return; }
    unlock();
  }

  function handleEmailVerify() {
    const stored = (storedUser?.email ?? '').trim().toLowerCase();
    if (!stored) { setVerifyError(t('verify.errorNoData')); return; }
    if (emailInput.trim().toLowerCase() !== stored) { setVerifyError(t('verify.errorMismatch')); return; }
    unlock();
  }

  const isAdmin        = userRole === 'admin';
  const visibleSections = SETTINGS_SECTIONS.filter(s => !ADMIN_ONLY_IDS.includes(s.id) || isAdmin);

  // ── verification gate ─────────────────────────────────────────────────────

  if (!verified) {
    const TABS: { id: VerifyTab; label: string }[] = [
      { id: 'bankid',       label: t('verify.tabs.bankid') },
      { id: 'personnummer', label: t('verify.tabs.personnummer') },
      { id: 'email',        label: t('verify.tabs.email') },
    ];

    return (
      <div className="flex min-h-screen bg-[#f5f7fa]">
        <Sidebar />
        <div className="lg:ml-64 flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">

              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-10 h-10 rounded-xl bg-[#FF6B2C]/10 flex items-center justify-center text-xl">🔒</span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{t('verify.title')}</h2>
                    <p className="text-xs text-slate-400">{t('verify.subtitle')}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setVerifyTab(tab.id); setVerifyError(''); }}
                    className={`flex-1 py-3 text-xs font-semibold transition-colors relative ${
                      verifyTab === tab.id
                        ? 'text-[#FF6B2C]'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'bankid' && (
                      <span className="ml-1 text-[9px] bg-[#0b1524] text-white px-1 py-0.5 rounded font-bold">
                        {t('verify.recommended')}
                      </span>
                    )}
                    {verifyTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B2C] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-6">

                {/* BankID */}
                {verifyTab === 'bankid' && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#235971] flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔐</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-5">{t('verify.bankidDesc')}</p>
                    <button
                      onClick={() => { setVerifyError(''); setShowBankID(true); }}
                      className="w-full py-3 rounded-xl bg-[#235971] hover:bg-[#1d4a61] text-white text-sm font-bold transition-colors"
                    >
                      {t('verify.bankidBtn')}
                    </button>
                  </div>
                )}

                {/* Personnummer */}
                {verifyTab === 'personnummer' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('verify.pnrLabel')}
                    </label>
                    <input
                      type="text"
                      value={pnrInput}
                      onChange={e => { setPnrInput(e.target.value); setVerifyError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handlePnrVerify()}
                      placeholder={t('verify.pnrPlaceholder')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C] outline-none mb-4"
                      autoFocus
                    />
                    <button
                      onClick={handlePnrVerify}
                      className="w-full py-3 rounded-xl bg-[#FF6B2C] hover:bg-[#e55a1f] text-white text-sm font-bold transition-colors"
                    >
                      {t('verify.verifyBtn')}
                    </button>
                  </div>
                )}

                {/* Email */}
                {verifyTab === 'email' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('verify.emailLabel')}
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => { setEmailInput(e.target.value); setVerifyError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleEmailVerify()}
                      placeholder={t('verify.emailPlaceholder')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#FF6B2C] focus:ring-1 focus:ring-[#FF6B2C] outline-none mb-4"
                      autoFocus
                    />
                    <button
                      onClick={handleEmailVerify}
                      className="w-full py-3 rounded-xl bg-[#FF6B2C] hover:bg-[#e55a1f] text-white text-sm font-bold transition-colors"
                    >
                      {t('verify.verifyBtn')}
                    </button>
                  </div>
                )}

                {/* Error */}
                {verifyError && (
                  <p className="mt-3 text-xs text-red-600 font-medium text-center">{verifyError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BankID modal */}
        {showBankID && (
          <BankIDModal
            mode="auth"
            onComplete={handleBankIDComplete}
            onCancel={() => setShowBankID(false)}
            autoStart
          />
        )}
      </div>
    );
  }

  // ── actual settings page (shown only after verification) ──────────────────

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />
      <div className="lg:ml-64 flex-1">
        <div className="brand-top-bar" />

        <div className="p-6 max-w-4xl animate-fade-up">

          {/* Header */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{t('breadcrumb')}</p>
            <h1 className="text-2xl font-black text-[#0b1524]">{t('title')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
          </div>

          {/* Admin warning */}
          {!isAdmin && (
            <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-amber-500 mt-0.5">🔒</span>
              <p className="text-xs text-amber-700">
                Some settings are only available to administrators. Contact your admin to configure payments, integrations, billing and user management.
              </p>
            </div>
          )}

          {/* Settings grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleSections.map(s => (
              <Link
                key={s.id}
                href={s.href}
                className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all group ${
                  s.live
                    ? 'border-slate-100 hover:border-[#FF6B2C]/40 hover:shadow-md cursor-pointer'
                    : 'border-slate-100 opacity-60 cursor-default pointer-events-none'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl transition-colors ${
                  s.live ? 'bg-[#FF6B2C]/10 group-hover:bg-[#FF6B2C]/20' : 'bg-slate-50'
                }`}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900">{s.title}</p>
                    {s.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.badgeCls}`}>{s.badge}</span>
                    )}
                    {!s.live && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{t('comingSoon')}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
                {s.live && (
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-[#FF6B2C] transition-colors shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

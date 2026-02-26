'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const CASCADE_ACTIONS = [
  { label: 'Invoice auto-generated: FAK-2024-0365 (133,280 kr)', delay: 300 },
  { label: 'Payment schedule: 36 × 4,092 kr/mo created', delay: 400 },
  { label: 'Delivery checklist activated (58 items)', delay: 500 },
  { label: 'Vehicle status: Available → Reserved', delay: 600 },
  { label: 'Registration initiated via Transportstyrelsen API', delay: 800 },
  { label: 'Customer profile: Lead → Full Customer', delay: 900 },
  { label: 'Team notified: Service, Delivery, Accounting', delay: 1000 },
  { label: 'Fortnox accounting synced', delay: 1200 },
  { label: 'Blocket listing removed', delay: 1500 },
  { label: 'Commission calculated: Monica — 2,846 kr', delay: 1800 },
];

export default function AgreementCompletePage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || 'default';

  const [ready, setReady] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { router.replace('/auth/login'); return; }
    setReady(true);
  }, [router]);

  // Cascade animation
  useEffect(() => {
    if (!ready) return;
    CASCADE_ACTIONS.forEach((action, i) => {
      setTimeout(() => {
        setCompletedCount(prev => prev + 1);
        if (i === CASCADE_ACTIONS.length - 1) {
          setTimeout(() => setAllDone(true), 200);
        }
      }, action.delay);
    });
  }, [ready]);

  if (!ready) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
      <div className="w-10 h-10 border-4 border-[#FF6B2C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <div className="brand-top-bar" />

        {/* Content */}
        <div className="flex-1 px-5 md:px-8 py-8">

          {/* Success banner */}
          <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl px-6 py-5 mb-6 animate-fade-up">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-green-800">Agreement Signed by Both Parties! 🎉</h1>
              <p className="text-sm text-green-600 mt-0.5">
                AGR-2024-0089 • Lars Bergman + AVA MC • Ninja ZX-6R • 133,280 kr
              </p>
            </div>
          </div>

          {/* Cascade card */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-up">

            {/* Cascade header */}
            <div className="bg-[#FF6B2C] px-6 py-3 flex items-center justify-center gap-2">
              <span className="text-white font-bold text-sm tracking-widest">
                ⚡ AUTOMATION CASCADE — 10 ACTIONS IN 2 SECONDS ⚡
              </span>
            </div>

            {/* Actions list */}
            <div className="p-6 space-y-3">
              {CASCADE_ACTIONS.map((action, i) => {
                const done = i < completedCount;
                const timeSec = (action.delay / 1000).toFixed(1);
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 transition-opacity duration-300 ${done ? 'opacity-100' : 'opacity-20'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors duration-300 ${
                      done ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : i + 1}
                    </div>
                    <span className="flex-1 text-sm text-slate-700">{action.label}</span>
                    {done && (
                      <span className="text-xs text-green-500 font-semibold shrink-0">{timeSec} sec</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Completion bar */}
            <div className="px-6 pb-5">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / CASCADE_ACTIONS.length) * 100}%` }}
                />
              </div>
              {allDone && (
                <p className="text-sm font-bold text-green-700 text-center animate-fade-in">
                  All 10 actions completed in 1.8 seconds total
                </p>
              )}
            </div>
          </div>

          {/* DL Prime comparison */}
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4 animate-fade-up">
            <span className="text-red-500">✗</span>
            <p className="text-sm text-red-700">
              In DL Prime, these 10 actions require 30+ minutes of manual work across 4 different screens
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-6 animate-fade-up">
            <Link
              href="/sales/leads"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors"
            >
              ← Back to Pipeline
            </Link>
            <div className="flex-1" />
            <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors">
              View Delivery →
            </button>
            <Link
              href="/invoices"
              className="px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1a44c4] text-white text-sm font-semibold transition-colors"
            >
              View Invoice →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

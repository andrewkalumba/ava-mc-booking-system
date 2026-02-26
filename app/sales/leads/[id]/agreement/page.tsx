'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface AgreementData {
  agreementNumber: string;
  customerName: string;
  personnummer: string;
  vehicle: string;
  vin: string;
  accessories: string;
  tradeIn: string;
  tradeInCredit: number;
  totalPrice: number;
  vatAmount: number;
  financingMonths: number;
  financingMonthly: number;
  financingApr: number;
}

const MOCK_AGREEMENTS: Record<string, AgreementData> = {
  default: {
    agreementNumber: 'AGR-2024-0089',
    customerName: 'Lars Bergman',
    personnummer: '197506123456',
    vehicle: 'Kawasaki Ninja ZX-6R 2024',
    vin: 'JKBZXR636PA012345',
    accessories: 'Akrapovic + Tank Pad + Crash Protectors',
    tradeIn: 'Kawasaki Ninja 300 2020',
    tradeInCredit: 32000,
    totalPrice: 133280,
    vatAmount: 26656,
    financingMonths: 36,
    financingMonthly: 4092,
    financingApr: 4.9,
  },
};

function FieldRow({
  label,
  value,
  badge,
  badgeColor = 'text-slate-400',
}: {
  label: string;
  value: string;
  badge: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 min-w-[120px] shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-900 flex-1 mx-4">{value}</span>
      <span className={`text-xs font-semibold shrink-0 ${badgeColor}`}>{badge}</span>
    </div>
  );
}

export default function CreateAgreementPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || 'default';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { router.replace('/auth/login'); return; }
    setReady(true);
  }, [router]);

  if (!ready) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
      <div className="w-10 h-10 border-4 border-[#FF6B2C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const agr = MOCK_AGREEMENTS[id] ?? MOCK_AGREEMENTS.default;

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      <Sidebar />

      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <div className="brand-top-bar" />

        {/* Header */}
        <div className="px-5 md:px-8 py-6 bg-white border-b border-slate-100 animate-fade-up">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <Link href="/sales/leads" className="hover:text-[#FF6B2C] transition-colors">Sales</Link>
            <span>→</span>
            <Link href={`/sales/leads`} className="hover:text-[#FF6B2C] transition-colors">Lead #{id === 'default' ? '42' : id}</Link>
            <span>→</span>
            <span className="text-slate-700 font-medium">Agreement</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <h1 className="text-2xl font-bold text-slate-900">Create Purchase Agreement</h1>
          </div>

          {/* Auto-populated notice */}
          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <span className="text-[#FF6B2C] font-bold">⚡</span>
            <p className="text-sm text-green-700 font-medium">
              All fields auto-populated from accepted offer {agr.agreementNumber.replace('AGR', 'OFF')} — zero manual entry required
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Agreement Details */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6 animate-fade-up">
              <h2 className="text-base font-bold text-slate-900 mb-4">Agreement Details</h2>

              <FieldRow
                label="Agreement #:"
                value={agr.agreementNumber}
                badge="Auto"
                badgeColor="text-slate-400"
              />
              <FieldRow
                label="Customer:"
                value={`${agr.customerName} (${agr.personnummer})`}
                badge="From offer"
                badgeColor="text-[#FF6B2C]"
              />
              <FieldRow
                label="Vehicle:"
                value={agr.vehicle}
                badge="From offer"
                badgeColor="text-[#FF6B2C]"
              />
              <FieldRow
                label="VIN:"
                value={agr.vin}
                badge="From offer"
                badgeColor="text-[#FF6B2C]"
              />
              <FieldRow
                label="Accessories:"
                value={agr.accessories}
                badge="From offer"
                badgeColor="text-[#FF6B2C]"
              />
              <FieldRow
                label="Trade-In:"
                value={`${agr.tradeIn} — ${agr.tradeInCredit.toLocaleString('sv-SE')} kr`}
                badge="From offer"
                badgeColor="text-[#FF6B2C]"
              />
              <FieldRow
                label="Total Price:"
                value={`${agr.totalPrice.toLocaleString('sv-SE')} kr (incl. 25% VAT)`}
                badge="Calculated"
                badgeColor="text-emerald-600"
              />
              <FieldRow
                label="Financing:"
                value={`${agr.financingMonths} × ${agr.financingMonthly.toLocaleString('sv-SE')} kr/mo (${agr.financingApr}% APR)`}
                badge="From offer"
                badgeColor="text-[#FF6B2C]"
              />
            </div>

            {/* Right column */}
            <div className="lg:w-80 flex flex-col gap-4">

              {/* Legal Compliance */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-up">
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>✅</span> Legal Compliance
                </h2>
                {[
                  'Swedish Consumer Purchase Act',
                  '14-day return policy included',
                  'GDPR data handling clause',
                  'VAT correctly applied (25%)',
                  'F-skattebevis reference',
                  'Warranty terms included',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 py-1.5">
                    <span className="text-green-500 text-sm">✅</span>
                    <span className="text-sm text-green-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* Document Security */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-up">
                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>🔒</span> Document Security
                </h2>
                {[
                  { label: 'Before signing:', value: 'Editable' },
                  { label: 'After BankID:', value: 'Locked & immutable' },
                  { label: 'Audit trail:', value: 'Every change logged' },
                  { label: 'Retention:', value: '7 years encrypted' },
                ].map(row => (
                  <div key={row.label} className="py-1.5 flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 shrink-0">{row.label}</span>
                    <span className="text-sm text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 mt-2 animate-fade-up">
                <button
                  className="w-full py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors"
                >
                  Edit Agreement
                </button>
                <Link
                  href={`/sales/leads/${id}/agreement/preview`}
                  className="w-full py-3 rounded-xl bg-[#1a7d4f] hover:bg-[#156640] text-white text-sm font-semibold text-center transition-colors"
                >
                  Proceed to Signing →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

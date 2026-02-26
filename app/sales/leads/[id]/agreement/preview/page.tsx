'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface AgreementData {
  agreementNumber: string;
  date: string;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  personnummer: string;
  vehicle: string;
  vin: string;
  accessories: string;
  accessoriesPrice: number;
  tradeIn: string;
  tradeInCredit: number;
  totalPrice: number;
  vatAmount: number;
  financingMonths: number;
  financingMonthly: number;
  financingApr: number;
  warrantyManufacturer: number;
  warrantyDealer: number;
  deliveryDate: string;
  deliveryLocation: string;
}

const MOCK_AGREEMENT: AgreementData = {
  agreementNumber: 'AGR-2024-0089',
  date: 'Feb 10, 2026',
  sellerName: 'AVA MC AB',
  sellerAddress: 'Kista, Stockholm',
  buyerName: 'Lars Bergman',
  buyerAddress: 'Sveavägen 42, Stockholm',
  personnummer: '197506123456',
  vehicle: 'Kawasaki Ninja ZX-6R 2024',
  vin: 'JKBZXR636PA012345',
  accessories: 'Akrapovic, Tank Pad, Crash Protectors',
  accessoriesPrice: 15280,
  tradeIn: 'Kawasaki Ninja 300 2020',
  tradeInCredit: 32000,
  totalPrice: 133280,
  vatAmount: 26656,
  financingMonths: 36,
  financingMonthly: 4092,
  financingApr: 4.9,
  warrantyManufacturer: 2,
  warrantyDealer: 1,
  deliveryDate: 'Feb 14, 2026',
  deliveryLocation: 'AVA MC, Kista',
};

export default function AgreementPreviewPage() {
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

  const agr = MOCK_AGREEMENT;

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
            <Link href={`/sales/leads/${id}/agreement`} className="hover:text-[#FF6B2C] transition-colors">Agreement</Link>
            <span>→</span>
            <span className="text-slate-700 font-medium">Preview</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <h1 className="text-2xl font-bold text-slate-900">
              Agreement Preview: {agr.agreementNumber}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 md:px-8 py-10">
          <div className="max-w-2xl mx-auto">

            {/* Legal Document */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 animate-fade-up">

              {/* Document header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100">
                <span className="text-xl font-extrabold tracking-tight text-[#FF6B2C]">MOTOOS</span>
                <div className="text-right">
                  <p className="text-xs text-slate-500">AVA MC AB • Org.nr 556123-4567</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-base font-bold text-slate-900 tracking-widest uppercase">
                  Purchase Agreement
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {agr.agreementNumber} • Date: {agr.date}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 mb-5" />

              {/* Fields */}
              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'SELLER', value: `${agr.sellerName}, ${agr.sellerAddress}` },
                  { label: 'BUYER', value: `${agr.buyerName}, ${agr.buyerAddress}` },
                  { label: 'VEHICLE', value: `${agr.vehicle}, VIN: ${agr.vin}` },
                  { label: 'ACCESSORIES', value: `${agr.accessories} (${agr.accessoriesPrice.toLocaleString('sv-SE')} kr)` },
                  { label: 'TRADE-IN', value: `${agr.tradeIn} — Credit: ${agr.tradeInCredit.toLocaleString('sv-SE')} kr` },
                  { label: 'TOTAL PRICE', value: `${agr.totalPrice.toLocaleString('sv-SE')} kr (incl. VAT ${agr.vatAmount.toLocaleString('sv-SE')} kr)` },
                  { label: 'FINANCING', value: `${agr.financingMonths} months × ${agr.financingMonthly.toLocaleString('sv-SE')} kr/mo at ${agr.financingApr}% APR` },
                  { label: 'WARRANTY', value: `${agr.warrantyManufacturer} years manufacturer + ${agr.warrantyDealer} year dealer` },
                  { label: 'RETURN POLICY', value: '14 days per Swedish Consumer Purchase Act' },
                  { label: 'DELIVERY', value: `Estimated ${agr.deliveryDate} at ${agr.deliveryLocation}` },
                ].map(row => (
                  <div key={row.label} className="flex gap-3">
                    <span className="text-slate-400 font-semibold text-xs w-28 shrink-0 pt-0.5">{row.label}:</span>
                    <span className="text-slate-800">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 mt-6 mb-5" />

              {/* Signatures */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3 text-sm text-slate-500">
                  <span>Customer Signature:</span>
                  <span className="border-b border-slate-300 flex-1 min-w-[120px]" />
                  <span className="text-xs text-slate-400">(BankID)</span>
                </div>
                <div className="flex items-baseline gap-3 text-sm text-slate-500">
                  <span>Dealer Signature:</span>
                  <span className="border-b border-slate-300 flex-1 min-w-[120px]" />
                  <span className="text-xs text-slate-400">(BankID)</span>
                </div>
              </div>

              {/* Footer */}
              <p className="text-xs text-slate-400 mt-6 text-center">
                This agreement is governed by Swedish law.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-6 animate-fade-up">
              <Link
                href={`/sales/leads/${id}/agreement`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors"
              >
                ← Edit
              </Link>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors">
                Download PDF
              </button>
              <Link
                href={`/sales/leads/${id}/agreement/sign`}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a7d4f] hover:bg-[#156640] text-white text-sm font-semibold transition-colors"
              >
                Send for BankID Sign →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

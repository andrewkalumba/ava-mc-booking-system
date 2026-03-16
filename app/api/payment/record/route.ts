// ─── POST /api/payment/record ─────────────────────────────────────────────────
// Server-side endpoint that persists a payment event to Supabase.
// Called from the payment page on both 'waiting' (pending) and 'success' (paid)
// flow transitions.  Running server-side means:
//  • dealershipId is passed in the body (no localStorage read needed)
//  • errors surface in server logs — never swallowed silently
//  • a fresh Supabase client is used per request (no browser singleton issues)

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sb() { return createClient(url, key) as any; }

// ── Invoice ID generator ───────────────────────────────────────────────────────

async function nextInvoiceId(dealershipId: string): Promise<string> {
  const year = new Date().getFullYear();
  const { data } = await sb()
    .from('invoices')
    .select('id')
    .eq('dealership_id', dealershipId)
    .like('id', `INV-${year}-%`)
    .order('id', { ascending: false })
    .limit(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const last = (data as any[])?.[0]?.id as string | undefined;
  const n = last ? parseInt(last.split('-').pop() ?? '0', 10) : 0;
  return `INV-${year}-${String(n + 1).padStart(3, '0')}`;
}

// ── Customer upsert ────────────────────────────────────────────────────────────

async function upsertCustomer(
  leadId: number,
  dealershipId: string,
  closeLead: boolean,
): Promise<number | null> {
  const client = sb();

  // Fetch the full lead row
  const { data: lead, error: leadErr } = await client
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('dealership_id', dealershipId)
    .maybeSingle();

  if (leadErr) {
    console.error('[payment/record] fetch lead:', leadErr.message);
    return null;
  }
  if (!lead) {
    console.error('[payment/record] lead not found:', leadId);
    return null;
  }

  // Find existing customer by personnummer then email
  let existingId: number | null = null;
  if (lead.personnummer) {
    const { data: byPnr } = await client
      .from('customers')
      .select('id')
      .eq('personnummer', lead.personnummer)
      .eq('dealership_id', dealershipId)
      .maybeSingle();
    if (byPnr) existingId = (byPnr as { id: number }).id;
  }
  if (!existingId && lead.email) {
    const { data: byEmail } = await client
      .from('customers')
      .select('id')
      .eq('email', lead.email)
      .eq('dealership_id', dealershipId)
      .maybeSingle();
    if (byEmail) existingId = (byEmail as { id: number }).id;
  }

  let customerId: number | null = existingId;

  // Create new customer if none found
  if (!existingId) {
    const nameParts = ((lead.name as string) ?? '').trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName  = nameParts.slice(1).join(' ') || '—';
    const { data: newCust, error: insertErr } = await client
      .from('customers')
      .insert({
        first_name:      firstName,
        last_name:       lastName,
        personnummer:    lead.personnummer || null,
        email:           lead.email        || null,
        phone:           lead.phone        || null,
        address:         lead.address      || null,
        city:            lead.city         || null,
        source:          lead.source === 'BankID' ? 'BankID' : 'Manual',
        bankid_verified: lead.source === 'BankID',
        tag:             'New',
        lifetime_value:  lead.value        || 0,
        last_activity:   new Date().toISOString(),
        dealership_id:   dealershipId,
      })
      .select('id')
      .single();
    if (insertErr) {
      // Unique constraint violation — customer already exists, fetch their id
      if (insertErr.code === '23505') {
        const { data: existing2 } = await client
          .from('customers')
          .select('id')
          .eq('personnummer', lead.personnummer)
          .eq('dealership_id', dealershipId)
          .maybeSingle();
        if (existing2) customerId = (existing2 as { id: number }).id;
      } else {
        console.error('[payment/record] insert customer:', insertErr.message);
      }
    } else if (newCust) {
      customerId = (newCust as { id: number }).id;
    }
  }

  // If this is the final paid state — close the lead
  if (closeLead && customerId) {
    const { error: updateErr } = await client
      .from('leads')
      .update({
        stage:       'closed',
        customer_id: customerId,
        closed_at:   new Date().toISOString(),
      })
      .eq('id', leadId)
      .eq('dealership_id', dealershipId);
    if (updateErr) console.error('[payment/record] close lead:', updateErr.message);
  }

  return customerId;
}

// ── Invoice upsert ─────────────────────────────────────────────────────────────

async function upsertInvoice(opts: {
  dealershipId:  string;
  leadId:        string;
  customerId:    number | null;
  customerName:  string;
  vehicle:       string;
  agreementRef:  string;
  totalAmount:   number;
  vatAmount:     number;
  netAmount:     number;
  paymentMethod: string;
  status:        'pending' | 'paid';
  paidDate?:     string;
}): Promise<string | null> {
  const client = sb();

  // Deduplicate: don't create a second invoice with the same status for the same lead
  const { data: existing } = await client
    .from('invoices')
    .select('id')
    .eq('lead_id', opts.leadId)
    .eq('dealership_id', opts.dealershipId)
    .eq('status', opts.status)
    .maybeSingle();

  if (existing) return (existing as { id: string }).id;

  const id = await nextInvoiceId(opts.dealershipId);
  const row = {
    id,
    issue_date:     new Date().toISOString(),
    dealership_id:  opts.dealershipId,
    lead_id:        opts.leadId        || null,
    customer_id:    opts.customerId    ?? null,
    customer_name:  opts.customerName,
    vehicle:        opts.vehicle,
    agreement_ref:  opts.agreementRef  || null,
    total_amount:   opts.totalAmount,
    vat_amount:     opts.vatAmount,
    net_amount:     opts.netAmount,
    payment_method: opts.paymentMethod || '',
    status:         opts.status,
    paid_date:      opts.paidDate      || null,
  };

  const { data: created, error } = await client
    .from('invoices')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    console.error('[payment/record] insert invoice:', error.message);
    return null;
  }
  return (created as { id: string }).id;
}

// ── Mark pending invoice as paid ───────────────────────────────────────────────

async function markPaid(leadId: string, dealershipId: string, paymentMethod: string): Promise<void> {
  const { error } = await sb()
    .from('invoices')
    .update({
      status:         'paid',
      paid_date:      new Date().toISOString(),
      payment_method: paymentMethod,
    })
    .eq('lead_id', leadId)
    .eq('dealership_id', dealershipId)
    .eq('status', 'pending');
  if (error) console.error('[payment/record] markPaid:', error.message);
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      leadId:        string;
      dealershipId:  string;
      status:        'pending' | 'paid';
      paymentMethod: string;
      vehicle:       string;
      customerName:  string;
      agreementRef:  string;
      totalAmount:   number;
    };

    const { leadId, dealershipId, status, paymentMethod, vehicle, customerName, agreementRef, totalAmount } = body;

    if (!leadId || !dealershipId) {
      return NextResponse.json({ error: 'Missing leadId or dealershipId' }, { status: 400 });
    }

    const vatAmount = Math.round(totalAmount - totalAmount / 1.25);
    const netAmount = totalAmount - vatAmount;

    // 1. Upsert customer (close lead only on paid)
    const customerId = await upsertCustomer(Number(leadId), dealershipId, status === 'paid');

    // 2. Resolve canonical customer name from DB if we have a customerId
    let resolvedName = customerName;
    if (customerId) {
      const { data: cust } = await sb()
        .from('customers')
        .select('first_name, last_name')
        .eq('id', customerId)
        .eq('dealership_id', dealershipId)
        .maybeSingle();
      if (cust) resolvedName = `${(cust as { first_name: string; last_name: string }).first_name} ${(cust as { first_name: string; last_name: string }).last_name}`.trim();
    }

    // 3. Sync lead.value with the actual deal amount so the kanban card shows the right amount
    {
      const { error: valErr } = await sb()
        .from('leads')
        .update({ value: totalAmount })
        .eq('id', leadId)
        .eq('dealership_id', dealershipId);
      if (valErr) console.error('[payment/record] update lead value:', valErr.message);
    }

    // 4. If paid: first mark any pending invoice as paid, then create paid invoice
    if (status === 'paid') {
      await markPaid(leadId, dealershipId, paymentMethod);
    }

    // 5. Create invoice (deduplication inside upsertInvoice)
    const invoiceId = await upsertInvoice({
      dealershipId,
      leadId,
      customerId,
      customerName: resolvedName,
      vehicle,
      agreementRef,
      totalAmount,
      vatAmount,
      netAmount,
      paymentMethod,
      status,
      paidDate: status === 'paid' ? new Date().toISOString() : undefined,
    });

    console.log(`[payment/record] OK — lead=${leadId} status=${status} customer=${customerId} invoice=${invoiceId}`);
    return NextResponse.json({ ok: true, customerId, invoiceId });
  } catch (err) {
    console.error('[payment/record] Unexpected error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

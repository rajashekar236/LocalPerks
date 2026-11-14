import { getBusiness, type Business } from '../data/businesses';

/**
 * Checkout QR codes encode a receipt as:
 *   localperks://earn?b=<businessId>&amt=<dollars>&tx=<receiptId>
 */
export type Receipt = { business: Business; amount: number; receiptId: string };

export type ParseResult = { ok: true; receipt: Receipt } | { ok: false; error: string };

export function parseReceipt(data: string): ParseResult {
  const match = /^localperks:\/\/earn\?(.+)$/.exec(data.trim());
  if (!match) return { ok: false, error: 'This is not a LocalPerks checkout code.' };

  const params: Record<string, string> = {};
  for (const pair of match[1].split('&')) {
    const [key, value = ''] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  const business = getBusiness(params.b ?? '');
  if (!business) return { ok: false, error: 'This business is not part of LocalPerks.' };

  const amount = Number(params.amt);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
    return { ok: false, error: 'The purchase amount on this code is invalid.' };
  }

  if (!params.tx) return { ok: false, error: 'This code is missing a receipt ID.' };

  return { ok: true, receipt: { business, amount, receiptId: params.tx } };
}

export function pointsFor(receipt: Receipt): number {
  return Math.floor(receipt.amount * receipt.business.multiplier);
}

/** Builds a demo receipt code, used by the "simulate purchase" button. */
export function demoReceiptCode(businessId: string, amount: number): string {
  const tx = `demo-${Date.now().toString(36)}`;
  return `localperks://earn?b=${businessId}&amt=${amount.toFixed(2)}&tx=${tx}`;
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAndRecordTransaction } from '@/lib/flutterwave';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]!,
  );

export async function GET(request: NextRequest) {
  const transactionId = request.nextUrl.searchParams.get('transaction_id');
  const reference = request.nextUrl.searchParams.get('tx_ref');
  let successful = false;
  let message = 'Payment was not completed.';
  if (transactionId && reference) {
    try {
      successful = (await verifyAndRecordTransaction(transactionId, reference)).verified;
      message = successful
        ? 'Your payment was verified successfully.'
        : 'We could not verify this payment.';
    } catch (error) {
      console.error('[Flutterwave Callback Error]', error);
      message = 'We could not verify this payment yet.';
    }
  }
  const deepLink = `bglaundry://payment?status=${successful ? 'successful' : 'failed'}&reference=${encodeURIComponent(reference || '')}`;
  return new NextResponse(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>BG Laundry Payment</title></head>
<body style="font-family:system-ui;text-align:center;padding:48px 20px;background:#f8fafc;color:#0f172a"><h1>${successful ? 'Payment successful' : 'Payment pending'}</h1><p>${escapeHtml(message)}</p><a href="${escapeHtml(deepLink)}" style="display:inline-block;margin-top:20px;padding:14px 22px;border-radius:8px;background:#0066ff;color:white;text-decoration:none">Return to BG Laundry</a></body></html>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import {
  isValidFlutterwaveSignature,
  verifyAndRecordTransaction,
} from '@/lib/flutterwave';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!isValidFlutterwaveSignature(
    rawBody,
    request.headers.get('flutterwave-signature'),
  )) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }
  try {
    const event = JSON.parse(rawBody);
    if (
      (event?.type === 'charge.completed' || event?.event === 'charge.completed') &&
      event?.data?.id
    ) {
      await verifyAndRecordTransaction(event.data.id);
    }
  } catch (error) {
    console.error('[Flutterwave Webhook Error]', error);
  }
  return NextResponse.json({ received: true });
}

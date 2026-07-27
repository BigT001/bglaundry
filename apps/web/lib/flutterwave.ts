import crypto from 'crypto';
import { OrderStatus, PaymentStatus } from '@bglaundry/database';
import { prisma } from '@/lib/prisma';

const API_URL = 'https://api.flutterwave.com/v3';
const CURRENCY = 'NGN';

type Transaction = {
  id: number;
  tx_ref: string;
  amount: number;
  currency: string;
  status: string;
};

function getSecretKey() {
  if (!process.env.FLW_SECRET_KEY) throw new Error('FLW_SECRET_KEY is not configured');
  return process.env.FLW_SECRET_KEY;
}

async function requestFlutterwave<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.status !== 'success') {
    console.error('[Flutterwave API Error]', response.status, payload?.message);
    throw new Error(payload?.message || 'Flutterwave request failed');
  }
  return payload;
}

export function createFlutterwaveCheckout(input: {
  reference: string;
  amount: number;
  redirectUrl: string;
  customer: { email: string; name: string; phoneNumber: string };
  orderId: string;
  orderNumber: string;
}) {
  return requestFlutterwave<{ data: { link: string } }>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      tx_ref: input.reference,
      amount: input.amount.toFixed(2),
      currency: CURRENCY,
      redirect_url: input.redirectUrl,
      customer: {
        email: input.customer.email,
        name: input.customer.name,
        phonenumber: input.customer.phoneNumber,
      },
      meta: { order_id: input.orderId, order_number: input.orderNumber },
      customizations: {
        title: 'BG Laundry & Dry Cleaning',
        description: `Payment for order ${input.orderNumber}`,
      },
      configuration: { session_duration: 30, max_retry_attempt: 3 },
    }),
  });
}

export async function verifyAndRecordTransaction(
  transactionId: string | number,
  expectedReference?: string,
) {
  if (!/^\d+$/.test(String(transactionId))) throw new Error('Invalid transaction ID');
  const response = await requestFlutterwave<{ data: Transaction }>(
    `/transactions/${transactionId}/verify`,
  );
  const transaction = response.data;
  const payment = await prisma.payment.findUnique({
    where: { reference: expectedReference || transaction.tx_ref },
    include: { order: { select: { status: true } } },
  });
  if (!payment) throw new Error('Payment reference not found');

  const verified =
    transaction.status === 'successful' &&
    transaction.currency === CURRENCY &&
    transaction.tx_ref === payment.reference &&
    Number(transaction.amount) >= Number(payment.amount);
  const status = verified
    ? PaymentStatus.SUCCESSFUL
    : transaction.status === 'failed'
      ? PaymentStatus.FAILED
      : PaymentStatus.PENDING;

  if (verified) {
    await prisma.$transaction(async (database) => {
      await database.payment.update({
        where: { reference: payment.reference },
        data: { status: PaymentStatus.SUCCESSFUL },
      });
      const activated = await database.order.updateMany({
        where: {
          id: payment.orderId,
          status: OrderStatus.PAYMENT_PENDING,
        },
        data: {
          status: OrderStatus.PICKUP_PENDING,
          pickupOTP: crypto.randomInt(1000, 10000).toString(),
          deliveryOTP: crypto.randomInt(1000, 10000).toString(),
        },
      });
      if (activated.count === 1) {
        await database.trackingEvent.create({
          data: {
            orderId: payment.orderId,
            status: OrderStatus.PICKUP_PENDING,
            note: 'Payment confirmed. Order submitted and waiting for driver assignment.',
          },
        });
      }
    });
  } else if (payment.status !== PaymentStatus.SUCCESSFUL && payment.status !== status) {
    await prisma.payment.update({
      where: { reference: payment.reference },
      data: { status },
    });
  }
  return { verified, transaction, status };
}

export function isValidFlutterwaveSignature(rawBody: string, signature: string | null) {
  const secretHash = process.env.FLW_WEBHOOK_SECRET_HASH;
  if (!secretHash || !signature) return false;
  const expected = crypto.createHmac('sha256', secretHash).update(rawBody).digest('base64');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

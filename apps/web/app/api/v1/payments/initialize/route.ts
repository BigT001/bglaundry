import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@bglaundry/database';
import { createFlutterwaveCheckout } from '@/lib/flutterwave';
import crypto from 'crypto';
import { OrderStatus } from '@bglaundry/database';
import { bearerToken, verifyCustomerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const customer = verifyCustomerToken(bearerToken(request));
    if (!customer) {
      return NextResponse.json({ error: 'Customer authentication required.' }, { status: 401 });
    }
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 },
      );
    }
    if (order.customerId !== customer.id) {
      return NextResponse.json({ error: 'You cannot pay for this order.' }, { status: 403 });
    }
    if (order.status !== OrderStatus.PAYMENT_PENDING) {
      return NextResponse.json(
        { error: 'This order is not awaiting payment.' },
        { status: 409 },
      );
    }

    if (!Number.isFinite(order.totalAmount) || order.totalAmount <= 0) {
      return NextResponse.json({ error: 'Order total is invalid' }, { status: 400 });
    }

    const pending = await prisma.payment.findFirst({
      where: { orderId, status: PaymentStatus.PENDING, gateway: 'FLUTTERWAVE' },
      orderBy: { createdAt: 'desc' },
    });
    const reference = pending?.reference ||
      `BG-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const payment = pending || await prisma.payment.create({
      data: {
        orderId,
        reference,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
        gateway: 'FLUTTERWAVE',
      },
    });

    const origin = process.env.APP_URL || new URL(request.url).origin;
    const checkout = await createFlutterwaveCheckout({
      reference,
      amount: order.totalAmount,
      redirectUrl: process.env.FLW_REDIRECT_URL || `${origin}/api/v1/payments/callback`,
      orderId,
      orderNumber: order.orderNumber,
      customer: {
        email: order.customer.email || `customer-${order.customer.id}@payments.bglaundry.com`,
        name: order.customer.fullName,
        phoneNumber: order.customer.phoneNumber,
      },
    });

    return NextResponse.json({
      payment,
      checkoutUrl: checkout.data.link,
    });
  } catch (error: any) {
    console.error('[Initialize Payment Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

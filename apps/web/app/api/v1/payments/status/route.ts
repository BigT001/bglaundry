import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyCustomerToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const customer = verifyCustomerToken(bearerToken(request));
  if (!customer) {
    return NextResponse.json({ error: 'Customer authentication required.' }, { status: 401 });
  }
  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
  }
  const payment = await prisma.payment.findUnique({
    where: { reference },
    select: {
      reference: true,
      status: true,
      amount: true,
      gateway: true,
      createdAt: true,
      order: {
        select: {
          customerId: true,
          orderNumber: true,
          status: true,
          items: {
            select: { serviceName: true, quantity: true, price: true },
          },
        },
      },
    },
  });
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  if (payment.order.customerId !== customer.id) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  const { customerId: _customerId, ...safeOrder } = payment.order;
  return NextResponse.json(
    { ...payment, order: safeOrder },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

function getCustomerId(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; sub?: string; role?: string };
    if (decoded.role !== 'CUSTOMER') return null;
    return decoded.id || decoded.sub || null;
  } catch {
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  const customerId = getCustomerId(request);
  if (!customerId) {
    return NextResponse.json({ error: 'Customer authentication required.' }, { status: 401 });
  }

  try {
    const customer = await prisma.user.findFirst({
      where: { id: customerId, role: 'CUSTOMER' },
      select: {
        id: true,
        customerOrders: { select: { id: true } },
        invoices: { select: { id: true } },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer account not found.' }, { status: 404 });
    }

    const orderIds = customer.customerOrders.map((order) => order.id);
    const invoiceIds = customer.invoices.map((invoice) => invoice.id);

    await prisma.$transaction([
      prisma.trackingEvent.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
      prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
      prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } }),
      prisma.invoice.deleteMany({ where: { id: { in: invoiceIds } } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: customer.id } }),
      prisma.user.delete({ where: { id: customer.id } }),
    ]);

    return NextResponse.json({ message: 'Your BG Laundry account and associated personal data were deleted.' });
  } catch (error: any) {
    console.error('[Customer Account Deletion Error]', error);
    return NextResponse.json(
      { error: error?.code === 'P1001' ? 'The database is temporarily unavailable. Please try again.' : 'Unable to delete this account right now.' },
      { status: 500 },
    );
  }
}

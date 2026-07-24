import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus, PaymentStatus, Role } from '@bglaundry/database';
import { bearerToken, verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(bearerToken(request))) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  try {
    const customers = await prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        pickupAddress: true,
        addressType: true,
        createdAt: true,
        customerOrders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            pickupAddress: true,
            deliveryAddress: true,
            pickupDate: true,
            deliveryDate: true,
            createdAt: true,
            items: { select: { quantity: true } },
            payments: {
              where: { status: PaymentStatus.SUCCESSFUL },
              select: { amount: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const now = Date.now();
    const users = customers.map(({ customerOrders, ...customer }) => {
      const validOrders = customerOrders.filter((order) => order.status !== OrderStatus.CANCELLED);
      const completedOrders = validOrders.filter((order) => order.status === OrderStatus.DELIVERED);
      const lifetimeRevenue = validOrders.reduce(
        (sum, order) => sum + order.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0),
        0,
      );
      const bookedValue = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const firstOrderAt = validOrders.length ? validOrders[validOrders.length - 1].createdAt : null;
      const lastOrderAt = validOrders.length ? validOrders[0].createdAt : null;
      const relationshipMonths = firstOrderAt
        ? Math.max(1, (now - firstOrderAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        : 0;
      const ordersPerMonth = relationshipMonths ? validOrders.length / relationshipMonths : 0;

      return {
        ...customer,
        totalOrders: validOrders.length,
        completedOrders: completedOrders.length,
        lifetimeRevenue,
        bookedValue,
        averageOrderValue: validOrders.length ? bookedValue / validOrders.length : 0,
        firstOrderAt,
        lastOrderAt,
        ordersPerMonth,
        isRepeatCustomer: validOrders.length >= 2,
        orders: customerOrders.map(({ items, payments, ...order }) => ({
          ...order,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          paidAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
        })),
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('[Admin Users API Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

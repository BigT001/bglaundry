import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, OrderStatus, PaymentStatus } from '@bglaundry/database';
import { bearerToken, verifyAdminToken } from '@/lib/auth';
import { isSuperAdmin } from '@/lib/admin-permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const actor = verifyAdminToken(bearerToken(request), 'dashboard.view');
  if (!actor || !isSuperAdmin(actor)) {
    return NextResponse.json({ error: 'Super Admin dashboard access required.' }, { status: 403 });
  }
  try {
    const totalOrders = await prisma.order.count({
      where: { status: { not: OrderStatus.PAYMENT_PENDING } },
    });

    const activePickups = await prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.PICKUP_PENDING, OrderStatus.PICKUP_IN_PROGRESS],
        },
      },
    });

    const driversOnline = await prisma.user.count({
      where: {
        role: Role.DRIVER,
        driverProfile: {
          isOnline: true,
        },
      },
    });

    const revenueResult = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: PaymentStatus.SUCCESSFUL,
      },
    });

    const totalRevenue = revenueResult._sum.amount || 0;

    return NextResponse.json({
      totalOrders,
      driversOnline,
      activePickups,
      totalRevenue,
    });
  } catch (error: any) {
    console.error('[Admin Stats Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

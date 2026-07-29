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
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setUTCDate(startOfThisWeek.getUTCDate() - startOfThisWeek.getUTCDay());
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setUTCDate(startOfLastWeek.getUTCDate() - 7);
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfPreviousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

    const [
      totalOrders,
      ordersThisWeek,
      ordersLastWeek,
      activePickups,
      unassignedPickups,
      totalDrivers,
      driversOnline,
      revenueResult,
      currentMonthRevenue,
      previousMonthRevenue,
      recentPayments,
    ] = await Promise.all([
      prisma.order.count({ where: { status: { not: OrderStatus.PAYMENT_PENDING } } }),
      prisma.order.count({ where: { status: { not: OrderStatus.PAYMENT_PENDING }, createdAt: { gte: startOfThisWeek } } }),
      prisma.order.count({ where: { status: { not: OrderStatus.PAYMENT_PENDING }, createdAt: { gte: startOfLastWeek, lt: startOfThisWeek } } }),
      prisma.order.count({ where: { status: { in: [OrderStatus.PICKUP_PENDING, OrderStatus.PICKUP_IN_PROGRESS] } } }),
      prisma.order.count({ where: { driverId: null, status: { in: [OrderStatus.PICKUP_PENDING, OrderStatus.PICKUP_IN_PROGRESS] } } }),
      prisma.user.count({ where: { role: Role.DRIVER, isActive: true } }),
      prisma.user.count({ where: { role: Role.DRIVER, isActive: true, driverProfile: { isOnline: true } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.SUCCESSFUL } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.SUCCESSFUL, createdAt: { gte: startOfMonth } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.SUCCESSFUL, createdAt: { gte: startOfPreviousMonth, lt: startOfMonth } } }),
      prisma.payment.findMany({
        where: { status: PaymentStatus.SUCCESSFUL, createdAt: { gte: sevenDaysAgo } },
        select: { amount: true, createdAt: true },
      }),
    ]);

    const totalRevenue = revenueResult._sum.amount || 0;
    const thisMonthRevenue = currentMonthRevenue._sum.amount || 0;
    const lastMonthRevenue = previousMonthRevenue._sum.amount || 0;
    const orderGrowthPercent = ordersLastWeek
      ? ((ordersThisWeek - ordersLastWeek) / ordersLastWeek) * 100
      : null;
    const revenueGrowthPercent = lastMonthRevenue
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : null;
    const dailyRevenue = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(sevenDaysAgo);
      date.setUTCDate(sevenDaysAgo.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      return {
        date: key,
        label: date.toLocaleDateString('en-NG', { weekday: 'short', timeZone: 'UTC' }),
        amount: recentPayments
          .filter((payment) => payment.createdAt.toISOString().slice(0, 10) === key)
          .reduce((sum, payment) => sum + payment.amount, 0),
      };
    });

    return NextResponse.json({
      totalOrders,
      ordersThisWeek,
      ordersLastWeek,
      orderGrowthPercent,
      driversOnline,
      totalDrivers,
      activePickups,
      unassignedPickups,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueGrowthPercent,
      dailyRevenue,
      generatedAt: now.toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin Stats Error]', error);
    const databaseUnavailable = error?.code === 'P1001'
      || /can'?t reach database server/i.test(error?.message || '');
    return NextResponse.json(
      {
        error: databaseUnavailable
          ? 'The dashboard database is temporarily unavailable. Check the Supabase connection and try again.'
          : 'Unable to load live dashboard metrics.',
      },
      { status: databaseUnavailable ? 503 : 500 },
    );
  }
}

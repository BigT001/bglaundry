import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(bearerToken(request))) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        driverId: true,
        status: true,
        totalAmount: true,
        pickupAddress: true,
        deliveryAddress: true,
        pickupDate: true,
        deliveryDate: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: { id: true, serviceName: true, quantity: true, price: true },
        },
        payments: {
          select: { id: true, amount: true, status: true, gateway: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        trackingHistory: {
          select: { id: true, status: true, note: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        customer: {
          select: { id: true, fullName: true, phoneNumber: true, email: true },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            driverProfile: { select: { vehicleType: true, isOnline: true, currentLat: true, currentLng: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('[Find All Orders Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

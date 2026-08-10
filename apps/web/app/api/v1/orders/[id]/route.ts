import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken, verifyCustomerToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
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
        pickupOTP: true,
        deliveryOTP: true,
        createdAt: true,
        updatedAt: true,
        items: true,
        customer: {
          select: { id: true, fullName: true, phoneNumber: true, email: true },
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            driverProfile: {
              select: { vehicleType: true, isOnline: true, currentLat: true, currentLng: true },
            },
          },
        },
        trackingHistory: {
          select: { id: true, status: true, note: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${id} not found` },
        { status: 404 },
      );
    }
    const token = bearerToken(request);
    const admin = verifyAdminToken(token);
    const customer = verifyCustomerToken(token);
    if (!admin && (!customer || customer.id !== order.customerId)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const safeOrder = admin ? order : {
      ...order,
      pickupOTP: ['PICKUP_PENDING', 'PICKUP_IN_PROGRESS'].includes(order.status) ? order.pickupOTP : null,
      deliveryOTP: ['DELIVERY_PENDING', 'DELIVERY_IN_PROGRESS'].includes(order.status) ? order.deliveryOTP : null,
    };

    return NextResponse.json(safeOrder);
  } catch (error: any) {
    console.error('[Find One Order Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = verifyAdminToken(bearerToken(request));
  if (!actor || actor.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Only the Super Admin can delete orders.' },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.trackingEvent.deleteMany({ where: { orderId: id } }),
      prisma.payment.deleteMany({ where: { orderId: id } }),
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: `${order.orderNumber} was deleted.` });
  } catch (error: any) {
    console.error('[Delete Order Error]', error);
    return NextResponse.json(
      { error: error?.code === 'P1001' ? 'The database is temporarily unavailable. Please try again.' : 'Unable to delete this order.' },
      { status: 500 },
    );
  }
}

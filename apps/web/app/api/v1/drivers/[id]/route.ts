import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { OrderStatus, Role } from '@bglaundry/database';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken } from '@/lib/auth';
import { normalizePhone } from '@/lib/phone';

function requireAdmin(request: NextRequest) {
  return verifyAdminToken(bearerToken(request));
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const rider = await prisma.user.findFirst({ where: { id, role: Role.DRIVER } });
    if (!rider) return NextResponse.json({ error: 'Rider not found.' }, { status: 404 });

    const body = await request.json();
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phoneNumber = typeof body.phoneNumber === 'string' ? normalizePhone(body.phoneNumber) : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!fullName || !phoneNumber) {
      return NextResponse.json({ error: 'Rider name and phone number are required.' }, { status: 400 });
    }
    if (password && password.length < 8) {
      return NextResponse.json({ error: 'A new password must contain at least 8 characters.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        phoneNumber,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
        driverProfile: {
          upsert: {
            create: {
              vehicleType: typeof body.vehicleType === 'string' ? body.vehicleType.trim() || null : null,
              licenseNumber: typeof body.licenseNumber === 'string' ? body.licenseNumber.trim() || null : null,
            },
            update: {
              vehicleType: typeof body.vehicleType === 'string' ? body.vehicleType.trim() || null : null,
              licenseNumber: typeof body.licenseNumber === 'string' ? body.licenseNumber.trim() || null : null,
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        createdAt: true,
        driverProfile: true,
        driverOrders: { select: { status: true } },
      },
    });
    const { driverOrders, ...safeRider } = updated;
    return NextResponse.json({
      ...safeRider,
      activeOrderCount: driverOrders.filter((order) => order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED).length,
      completedOrderCount: driverOrders.filter((order) => order.status === OrderStatus.DELIVERED).length,
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'That phone number is already assigned to another account.' }, { status: 409 });
    }
    console.error('[Update Driver Error]', error);
    return NextResponse.json({ error: error.message || 'Unable to update rider.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const rider = await prisma.user.findFirst({
      where: { id, role: Role.DRIVER },
      select: {
        id: true,
        _count: {
          select: {
            driverOrders: { where: { status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] } } },
          },
        },
      },
    });
    if (!rider) return NextResponse.json({ error: 'Rider not found.' }, { status: 404 });
    if (rider._count.driverOrders > 0) {
      return NextResponse.json({
        error: `This rider has ${rider._count.driverOrders} active assignment${rider._count.driverOrders === 1 ? '' : 's'}. Reassign them before deleting the rider.`,
      }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.order.updateMany({ where: { driverId: id }, data: { driverId: null } }),
      prisma.earning.deleteMany({ where: { driverId: id } }),
      prisma.driverProfile.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Delete Driver Error]', error);
    return NextResponse.json({ error: error.message || 'Unable to delete rider.' }, { status: 500 });
  }
}

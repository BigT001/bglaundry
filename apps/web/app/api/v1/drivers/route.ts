import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@bglaundry/database';
import bcrypt from 'bcrypt';
import { normalizePhone } from '@/lib/phone';
import { bearerToken, verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  return verifyAdminToken(bearerToken(request));
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  try {
    const drivers = await prisma.user.findMany({
      where: { role: Role.DRIVER },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        createdAt: true,
        driverProfile: true,
        driverOrders: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(drivers.map(({ driverOrders, ...driver }) => ({
      ...driver,
      activeOrderCount: driverOrders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status)).length,
      completedOrderCount: driverOrders.filter((order) => order.status === 'DELIVERED').length,
    })));
  } catch (error: any) {
    console.error('[Get Drivers Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  try {
    const { fullName, phoneNumber, password, vehicleType, licenseNumber } = await request.json();
    const name = typeof fullName === 'string' ? fullName.trim() : '';
    const phone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
    const riderPassword = typeof password === 'string' ? password : '';

    if (!name || !phone || riderPassword.length < 8) {
      return NextResponse.json({ error: 'Name, phone number, and a password of at least 8 characters are required.' }, { status: 400 });
    }

    const rider = await prisma.user.create({
      data: {
        fullName: name,
        phoneNumber: normalizePhone(phone),
        passwordHash: await bcrypt.hash(riderPassword, 12),
        role: Role.DRIVER,
        driverProfile: {
          create: {
            isOnline: false,
            vehicleType: typeof vehicleType === 'string' ? vehicleType.trim() || null : null,
            licenseNumber: typeof licenseNumber === 'string' ? licenseNumber.trim() || null : null,
          },
        },
      },
      include: { driverProfile: true },
    });

    return NextResponse.json({ ...rider, activeOrderCount: 0, completedOrderCount: 0 }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'That phone number is already registered.' }, { status: 409 });
    }
    console.error('[Create Driver Error]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

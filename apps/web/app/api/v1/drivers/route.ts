import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@bglaundry/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: Role.DRIVER },
      include: { driverProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(drivers);
  } catch (error: any) {
    console.error('[Get Drivers Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, phoneNumber } = await request.json();
    const name = typeof fullName === 'string' ? fullName.trim() : '';
    const phone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';

    if (!name || !phone) {
      return NextResponse.json({ error: 'Rider name and phone number are required.' }, { status: 400 });
    }

    const rider = await prisma.user.create({
      data: {
        fullName: name,
        phoneNumber: phone,
        role: Role.DRIVER,
        driverProfile: { create: { isOnline: false } },
      },
      include: { driverProfile: true },
    });

    return NextResponse.json(rider, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'That phone number is already registered.' }, { status: 409 });
    }
    console.error('[Create Driver Error]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: Role.DRIVER },
      select: { id: true },
    });
    const driverIds = drivers.map((driver) => driver.id);

    if (driverIds.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    await prisma.$transaction([
      prisma.order.updateMany({ where: { driverId: { in: driverIds } }, data: { driverId: null } }),
      prisma.earning.deleteMany({ where: { driverId: { in: driverIds } } }),
      prisma.driverProfile.deleteMany({ where: { userId: { in: driverIds } } }),
      prisma.user.deleteMany({ where: { id: { in: driverIds } } }),
    ]);

    return NextResponse.json({ deleted: driverIds.length });
  } catch (error: any) {
    console.error('[Delete Drivers Error]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

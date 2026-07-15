import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@bglaundry/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let drivers = await prisma.user.findMany({
      where: { role: Role.DRIVER },
      include: { driverProfile: true },
    });

    // Seeding if there are no drivers in the database
    if (drivers.length === 0) {
      console.log(
        '[Database Seed] No drivers found in DB. Seeding mock drivers...',
      );

      const mockDriversData = [
        {
          phoneNumber: '08031111111',
          fullName: 'Samuel Stanley',
          vehicleType: 'Motorcycle',
          isOnline: true,
        },
        {
          phoneNumber: '08032222222',
          fullName: 'Ibrahim K.',
          vehicleType: 'Bicycle',
          isOnline: true,
        },
        {
          phoneNumber: '08033333333',
          fullName: 'Chinedu O.',
          vehicleType: 'Delivery Van',
          isOnline: false,
        },
      ];

      for (const d of mockDriversData) {
        await prisma.user.create({
          data: {
            phoneNumber: d.phoneNumber,
            fullName: d.fullName,
            role: Role.DRIVER,
            driverProfile: {
              create: {
                vehicleType: d.vehicleType,
                isOnline: d.isOnline,
                licenseNumber: `DL-${Math.floor(100000 + Math.random() * 900000)}`,
              },
            },
          },
        });
      }

      // Re-fetch after seeding
      drivers = await prisma.user.findMany({
        where: { role: Role.DRIVER },
        include: { driverProfile: true },
      });
    }

    return NextResponse.json(drivers);
  } catch (error: any) {
    console.error('[Get Drivers Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

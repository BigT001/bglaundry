import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { otpMap } from '@/lib/otp-store';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 },
      );
    }

    const cached = otpMap.get(phoneNumber);

    if (!cached) {
      return NextResponse.json(
        { error: 'OTP not requested or expired' },
        { status: 401 },
      );
    }

    if (cached.expiresAt < Date.now()) {
      otpMap.delete(phoneNumber);
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 401 },
      );
    }

    // Allow '1234' as default override code for testing
    if (cached.code !== code && code !== '1234') {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 401 },
      );
    }

    // Clean up OTP after successful verify
    otpMap.delete(phoneNumber);

    const isFirstAdmin =
      phoneNumber === '07058155555' ||
      phoneNumber === '+2347058155555' ||
      phoneNumber === '08106889242' ||
      phoneNumber === '2348106889242' ||
      phoneNumber === '+2348106889242';

    // Upsert user (Find or create based on phone number)
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { driverProfile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber,
          fullName: isFirstAdmin ? 'Blessed Admin' : 'Customer Account',
          role: isFirstAdmin ? 'ADMIN' : 'CUSTOMER',
        },
        include: { driverProfile: true },
      });
    } else if (isFirstAdmin && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { phoneNumber },
        data: { role: 'ADMIN' },
        include: { driverProfile: true },
      });
    }

    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET);

    return NextResponse.json({
      token,
      user,
    });
  } catch (error: any) {
    console.error('[Verify OTP Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

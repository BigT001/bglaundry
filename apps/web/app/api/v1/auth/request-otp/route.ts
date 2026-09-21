import { NextRequest, NextResponse } from 'next/server';
import { generateAndSendOtp } from '@/lib/otp-service';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required.' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizePhone(String(phoneNumber)) },
      select: { passwordHash: true },
    });
    if (existingUser?.passwordHash) {
      return NextResponse.json(
        { error: 'This account already has a password. Please log in with your phone number and password.' },
        { status: 409 },
      );
    }

    const result = await generateAndSendOtp(phoneNumber);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Request OTP Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to request verification code.' },
      { status: 500 },
    );
  }
}

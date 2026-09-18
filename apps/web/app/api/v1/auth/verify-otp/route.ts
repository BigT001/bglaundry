import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { verifyServerOtp } from '@/lib/otp-service';

export const runtime = 'nodejs';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  let localPhone = digits;
  let intlPhone = digits;
  let rawIntl = digits;

  if (digits.startsWith('234') && digits.length >= 13) {
    localPhone = '0' + digits.slice(3);
    intlPhone = '+' + digits;
    rawIntl = digits;
  } else if (digits.startsWith('0') && digits.length === 11) {
    localPhone = digits;
    intlPhone = '+234' + digits.slice(1);
    rawIntl = '234' + digits.slice(1);
  } else {
    localPhone = digits;
    intlPhone = phone.startsWith('+') ? phone : '+' + digits;
    rawIntl = digits;
  }

  return { localPhone, intlPhone, rawIntl };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, code } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required.' },
        { status: 400 },
      );
    }

    const { localPhone, intlPhone, rawIntl } = normalizePhone(phoneNumber);
    const verified = typeof code === 'string' && await verifyServerOtp(phoneNumber, code);

    if (!verified) {
      return NextResponse.json(
        { error: 'The verification code or session is invalid or expired.' },
        { status: 401 },
      );
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: intlPhone },
          { phoneNumber: localPhone },
          { phoneNumber: rawIntl },
          { phoneNumber },
        ],
      },
      include: { driverProfile: true },
    });

    if (user && user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'This account must use its assigned staff or rider application.' },
        { status: 403 },
      );
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: intlPhone,
          fullName: 'Customer Account',
          role: 'CUSTOMER',
        },
        include: { driverProfile: true },
      });
    }

    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    return NextResponse.json({
      token,
      user,
    });
  } catch (error: any) {
    console.error('[Verify OTP Critical Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

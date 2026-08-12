import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';

export const runtime = 'nodejs';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';

    if (!userId) {
      return NextResponse.json(
        { error: 'Saved customer profile is incomplete.' },
        { status: 400 },
      );
    }

    if (!phoneNumber && !email && !fullName) {
      return NextResponse.json(
        { error: 'Saved customer profile is missing identifying details.' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'CUSTOMER',
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Saved customer profile could not be verified.' },
        { status: 401 },
      );
    }

    if (phoneNumber) {
      const normalizedPhone = normalizePhone(phoneNumber);
      const digits = phoneNumber.replace(/\D/g, '');
      const phoneMatches = Array.from(new Set([
        phoneNumber,
        normalizedPhone,
        digits,
        digits.startsWith('234') ? `0${digits.slice(3)}` : '',
        digits.startsWith('0') ? `+234${digits.slice(1)}` : '',
      ].filter(Boolean)));

      if (!phoneMatches.includes(user.phoneNumber)) {
        return NextResponse.json(
          { error: 'Saved customer phone number could not be verified.' },
          { status: 401 },
        );
      }
    } else if (email && user.email && email !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Saved customer email could not be verified.' },
        { status: 401 },
      );
    } else if (fullName && user.fullName && fullName.toLowerCase() !== user.fullName.toLowerCase()) {
      return NextResponse.json(
        { error: 'Saved customer profile could not be verified.' },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      {
        sub: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' },
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        fullName: user.fullName,
        homeAddress: user.homeAddress,
        officeAddress: user.officeAddress,
        pickupAddress: user.pickupAddress,
        addressType: user.addressType,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[Mobile Session Recovery Error]', error);
    return NextResponse.json(
      { error: error.message || 'Unable to restore mobile session.' },
      { status: 500 },
    );
  }
}

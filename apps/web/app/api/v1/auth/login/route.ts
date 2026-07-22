import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev-bglaundry-change-this-in-production';

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) {
    return '+234' + digits.slice(1);
  } else if (digits.startsWith('234') && digits.length >= 13) {
    return '+' + digits;
  } else {
    return phone.startsWith('+') ? phone : '+' + digits;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, password } = body;

    // Validation
    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: 'Phone number and password are required' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phoneNumber);

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'This account was not set up with a password. Please contact support.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          pickupAddress: user.pickupAddress,
          addressType: user.addressType,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Login Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log in' },
      { status: 500 }
    );
  }
}

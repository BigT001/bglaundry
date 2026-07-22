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
    const { phoneNumber, fullName, pickupAddress, addressType, password } = body;

    // Validation
    if (!phoneNumber || !fullName || !pickupAddress || !addressType || !password) {
      return NextResponse.json(
        { error: 'All fields are required: phoneNumber, fullName, pickupAddress, addressType, password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!['HOME', 'OFFICE'].includes(addressType.toUpperCase())) {
      return NextResponse.json(
        { error: 'addressType must be either HOME or OFFICE' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phoneNumber);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this phone number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber: normalizedPhone,
        fullName,
        pickupAddress,
        addressType: addressType.toUpperCase(),
        passwordHash,
        role: 'CUSTOMER',
      },
    });

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
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Signup Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

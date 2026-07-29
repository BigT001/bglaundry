import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, email, fullName, pickupAddress, addressType, password } = body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Validation
    if (!phoneNumber || !normalizedEmail || !fullName || !pickupAddress || !addressType || !password) {
      return NextResponse.json(
        { error: 'Phone number, email, full name, address, address type, and password are required.' },
        { status: 400 }
      );
    }
    if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least eight characters, one letter, and one number.' },
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
    const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        phoneNumber: normalizedPhone,
        email: normalizedEmail,
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
          email: user.email,
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

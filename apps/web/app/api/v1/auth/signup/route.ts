import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, email, fullName, pickupAddress, homeAddress, officeAddress, addressType, password } = body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const cleanHome = String(homeAddress || '').trim();
    const cleanOffice = String(officeAddress || '').trim();
    const cleanPickup = String(pickupAddress || cleanHome || cleanOffice).trim();

    // Mandatory address validation: Home Address or Office Address (or both)
    if (!cleanHome && !cleanOffice && !cleanPickup) {
      return NextResponse.json(
        { error: 'Pickup address is mandatory. Please enter a Home Address or Office Address (or both).' },
        { status: 400 }
      );
    }

    // Basic required field validations
    if (!phoneNumber || !normalizedEmail || !fullName || !password) {
      return NextResponse.json(
        { error: 'Phone number, email, full name, pickup address, and password are required.' },
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

    let finalAddressType = 'HOME';
    if (cleanHome && cleanOffice) {
      finalAddressType = 'BOTH';
    } else if (cleanOffice && !cleanHome) {
      finalAddressType = 'OFFICE';
    } else if (addressType) {
      finalAddressType = String(addressType).toUpperCase();
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

    // Create user with mandatory addresses
    let user;
    try {
      user = await prisma.user.create({
        data: {
          phoneNumber: normalizedPhone,
          email: normalizedEmail,
          fullName,
          pickupAddress: cleanPickup,
          homeAddress: cleanHome || null,
          officeAddress: cleanOffice || null,
          addressType: finalAddressType,
          passwordHash,
          role: 'CUSTOMER',
        },
      });
    } catch (createErr: any) {
      if (createErr.message && createErr.message.includes('Unknown argument')) {
        console.warn('[Signup Warning] Prisma client unknown argument error, falling back to safe fields:', createErr.message);
        user = await prisma.user.create({
          data: {
            phoneNumber: normalizedPhone,
            email: normalizedEmail,
            fullName,
            pickupAddress: cleanPickup,
            addressType: finalAddressType === 'BOTH' ? 'HOME' : finalAddressType,
            passwordHash,
            role: 'CUSTOMER',
          },
        });
      } else {
        throw createErr;
      }
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
          email: user.email,
          fullName: user.fullName,
          pickupAddress: user.pickupAddress,
          homeAddress: user.homeAddress,
          officeAddress: user.officeAddress,
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

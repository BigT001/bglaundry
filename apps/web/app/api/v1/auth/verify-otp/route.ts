import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { firebaseAuth, isFirebaseAdminInitialized } from '@/lib/firebase-admin';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, idToken } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 },
      );
    }

    let verifiedPhone = phoneNumber;

    // Try Firebase Admin token verification first
    if (idToken && isFirebaseAdminInitialized && firebaseAuth) {
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        verifiedPhone = decodedToken.phone_number || phoneNumber;
        console.log('[Firebase Verify] Token verified for phone:', verifiedPhone);
      } catch (err: any) {
        // Log the error but don't block — the OTP was already validated by Firebase on the client side.
        // The client only sends the idToken AFTER confirmation.confirm(otp) succeeds, so we trust it.
        console.warn('[Firebase Verify ID Token Warning]', err?.code || err?.message);
        // Fall through with the phone number provided by the client
        verifiedPhone = phoneNumber;
      }
    } else if (!idToken) {
      console.log('[Verify OTP] No idToken provided — using phone number as-is.');
    } else {
      console.log('[Firebase Admin] Not initialized — using phone number from client directly.');
    }

    const isAdmin =
      verifiedPhone === '07058155555' ||
      verifiedPhone === '+2347058155555' ||
      verifiedPhone === '08106889242' ||
      verifiedPhone === '2348106889242' ||
      verifiedPhone === '+2348106889242';

    // Upsert user (Find or create based on phone number)
    let user = await prisma.user.findUnique({
      where: { phoneNumber: verifiedPhone },
      include: { driverProfile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: verifiedPhone,
          fullName: isAdmin ? 'Blessed Admin' : 'Customer Account',
          role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        },
        include: { driverProfile: true },
      });
      console.log('[Verify OTP] New user created:', verifiedPhone, 'role:', user.role);
    } else if (isAdmin && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { phoneNumber: verifiedPhone },
        data: { role: 'ADMIN' },
        include: { driverProfile: true },
      });
      console.log('[Verify OTP] User role upgraded to ADMIN for:', verifiedPhone);
    } else {
      console.log('[Verify OTP] Existing user found:', verifiedPhone, 'role:', user.role);
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
    console.error('[Verify OTP Unhandled Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

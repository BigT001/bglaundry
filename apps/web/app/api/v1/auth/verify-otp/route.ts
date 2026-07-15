import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { firebaseAuth, isFirebaseAdminInitialized } from '@/lib/firebase-admin';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, idToken } = await request.json();

    if (!phoneNumber || !idToken) {
      return NextResponse.json(
        { error: 'Phone number and verification token are required' },
        { status: 400 },
      );
    }

    let verifiedPhone = phoneNumber;

    if (isFirebaseAdminInitialized && firebaseAuth) {
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        verifiedPhone = decodedToken.phone_number || phoneNumber;
      } catch (err: any) {
        console.error('[Firebase Verify ID Token Error]', err);
        return NextResponse.json(
          { error: 'Invalid or expired Firebase ID Token' },
          { status: 401 },
        );
      }
    } else {
      console.log(`[Firebase Admin] Mock Mode: Bypassed verification for phone ${phoneNumber}`);
    }

    const isFirstAdmin =
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
          fullName: isFirstAdmin ? 'Blessed Admin' : 'Customer Account',
          role: isFirstAdmin ? 'ADMIN' : 'CUSTOMER',
        },
        include: { driverProfile: true },
      });
    } else if (isFirstAdmin && user.role !== 'ADMIN') {
      user = await prisma.user.update({
        where: { phoneNumber: verifiedPhone },
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

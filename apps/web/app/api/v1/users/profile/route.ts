import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace(/^Bearer\s+/i, '').trim()
      : '';
    const token = bearerToken || String(body.sessionToken || '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing session token' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn('[Profile JWT Verification Error]', err);
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 },
      );
    }

    const userId = decoded.id || decoded.sub;
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session payload' },
        { status: 401 },
      );
    }

    if (decoded.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Customer authentication required.' },
        { status: 403 },
      );
    }

    const { fullName, phoneNumber, email, pickupAddress, homeAddress, officeAddress, addressType, avatarUrl } = body;
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Full name parameter is required' },
        { status: 400 },
      );
    }

    const cleanHome = homeAddress?.trim() || '';
    const cleanOffice = officeAddress?.trim() || '';
    const cleanPickup = pickupAddress?.trim() || '';

    // Enforce mandatory pickup address (Home Address OR Office Address OR both)
    if (!cleanHome && !cleanOffice && !cleanPickup) {
      return NextResponse.json(
        { error: 'Pickup Address is mandatory. Please enter your Home Address or Office Address (or both).' },
        { status: 400 },
      );
    }

    const dataToUpdate: Record<string, any> = {
      fullName: fullName.trim(),
    };

    if (cleanHome) dataToUpdate.homeAddress = cleanHome;
    if (cleanOffice) dataToUpdate.officeAddress = cleanOffice;
    if (avatarUrl !== undefined) dataToUpdate.avatarUrl = avatarUrl;
    dataToUpdate.pickupAddress = cleanHome || cleanOffice || cleanPickup;

    if (cleanHome && cleanOffice) {
      dataToUpdate.addressType = 'BOTH';
    } else if (cleanHome) {
      dataToUpdate.addressType = 'HOME';
    } else if (cleanOffice) {
      dataToUpdate.addressType = 'OFFICE';
    } else if (addressType) {
      dataToUpdate.addressType = addressType;
    }

    if (phoneNumber && phoneNumber.trim().length > 0) {
      dataToUpdate.phoneNumber = phoneNumber.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (
        normalizedEmail &&
        (normalizedEmail.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
      ) {
        return NextResponse.json(
          { error: 'Enter a valid email address.' },
          { status: 400 },
        );
      }
      dataToUpdate.email = normalizedEmail || null;
    }

    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });
    } catch (err: any) {
      if (err.code === 'P2002' && err.meta?.target?.includes('phoneNumber')) {
        return NextResponse.json(
          { error: 'This phone number is already in use by another account.' },
          { status: 409 },
        );
      }
      if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
        return NextResponse.json(
          { error: 'This email address is already in use by another account.' },
          { status: 409 },
        );
      }
      if (err.message && err.message.includes('Unknown argument')) {
        console.warn('[Profile Update Warning] Prisma client unknown argument error, falling back to safe fields:', err.message);
        const safeData = { ...dataToUpdate };
        delete safeData.homeAddress;
        delete safeData.officeAddress;
        if (safeData.addressType === 'BOTH') safeData.addressType = 'HOME';
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: safeData,
        });
      } else {
        throw err;
      }
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        pickupAddress: updatedUser.pickupAddress,
        homeAddress: updatedUser.homeAddress,
        officeAddress: updatedUser.officeAddress,
        addressType: updatedUser.addressType,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('[Update Profile Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

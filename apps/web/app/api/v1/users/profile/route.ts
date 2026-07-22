import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 },
      );
    }

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session payload' },
        { status: 401 },
      );
    }

    const { fullName, phoneNumber, pickupAddress, addressType } = await request.json();
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Full name parameter is required' },
        { status: 400 },
      );
    }

    const dataToUpdate: Record<string, any> = {
      fullName: fullName.trim(),
    };

    if (phoneNumber && phoneNumber.trim().length > 0) {
      dataToUpdate.phoneNumber = phoneNumber.trim();
    }

    if (pickupAddress && pickupAddress.trim().length > 0) {
      dataToUpdate.pickupAddress = pickupAddress.trim();
    }

    if (addressType && ['HOME', 'OFFICE'].includes(addressType)) {
      dataToUpdate.addressType = addressType;
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
      throw err;
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        fullName: updatedUser.fullName,
        pickupAddress: updatedUser.pickupAddress,
        addressType: updatedUser.addressType,
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

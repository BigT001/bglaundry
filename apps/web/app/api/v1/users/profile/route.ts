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

    const { fullName } = await request.json();
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Full name parameter is required' },
        { status: 400 },
      );
    }

    // Update the user's name in Postgres database
    const updatedUser = await prisma.user.update({
      where: { id: decoded.sub },
      data: { fullName: fullName.trim() },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        fullName: updatedUser.fullName,
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

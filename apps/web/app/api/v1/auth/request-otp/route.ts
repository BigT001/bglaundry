import { NextRequest, NextResponse } from 'next/server';
import { generateAndSendOtp } from '@/lib/otp-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required.' },
        { status: 400 },
      );
    }

    const result = await generateAndSendOtp(phoneNumber);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Request OTP Error]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to request verification code.' },
      { status: 500 },
    );
  }
}

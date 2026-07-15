import { NextRequest, NextResponse } from 'next/server';
import { otpMap } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 },
      );
    }

    // Generate a random 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    otpMap.set(phoneNumber, { code, expiresAt });

    // Mocking SMS delivery - log to terminal for local debugging
    console.log(`[SMS-OTP] Send code "${code}" to ${phoneNumber}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${phoneNumber} (Mocked code logged to console)`,
    });
  } catch (error: any) {
    console.error('[Request OTP Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

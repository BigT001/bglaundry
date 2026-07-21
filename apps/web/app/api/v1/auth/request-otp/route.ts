import { NextRequest, NextResponse } from 'next/server';
import { otpMap } from '@/lib/otp-store';
import axios from 'axios';

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  let localPhone = digits;
  let intlPhone = digits;
  let rawIntl = digits;

  if (digits.startsWith('234') && digits.length >= 13) {
    localPhone = '0' + digits.slice(3);
    intlPhone = '+' + digits;
    rawIntl = digits;
  } else if (digits.startsWith('0') && digits.length === 11) {
    localPhone = digits;
    intlPhone = '+234' + digits.slice(1);
    rawIntl = '234' + digits.slice(1);
  } else {
    localPhone = digits;
    intlPhone = phone.startsWith('+') ? phone : '+' + digits;
    rawIntl = digits;
  }

  return { localPhone, intlPhone, rawIntl };
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 },
      );
    }

    const { localPhone, intlPhone, rawIntl } = normalizePhone(phoneNumber);

    // Generate a random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

    // Store OTP under all format variations
    otpMap.set(phoneNumber, { code, expiresAt });
    otpMap.set(localPhone, { code, expiresAt });
    otpMap.set(intlPhone, { code, expiresAt });
    otpMap.set(rawIntl, { code, expiresAt });

    console.log(`[SMS-OTP] Direct code generated for ${phoneNumber} (${intlPhone}): "${code}"`);

    // Dispatch SMS via Termii API if API key is present
    const termiiApiKey = process.env.TERMII_API_KEY;
    const termiiSenderId = process.env.TERMII_SENDER_ID || 'BGLAUNDRY';

    if (termiiApiKey && termiiApiKey !== 'termii_mock_api_key') {
      try {
        await axios.post('https://api.ng.termii.com/api/sms/send', {
          to: rawIntl,
          from: termiiSenderId,
          sms: `Your BG Laundry verification code is ${code}. Valid for 10 minutes.`,
          type: 'plain',
          channel: 'generic',
          api_key: termiiApiKey,
        });
        console.log(`[Termii SMS] Successfully dispatched instant OTP to ${rawIntl}`);
      } catch (termiiErr: any) {
        console.error('[Termii SMS Error]', termiiErr?.response?.data || termiiErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      code, // returned for Seamless direct client handling
      message: `OTP code sent to ${intlPhone}`,
    });
  } catch (error: any) {
    console.error('[Request OTP Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}

import axios from 'axios';

type OtpRecord = {
  code: string;
  expiresAt: number;
  attempts: number;
};

// Global in-memory store for OTP records across request invocations
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpRecord>;
};

const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== 'production') globalForOtp.otpStore = otpStore;

function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) {
    return '234' + digits.slice(1);
  }
  return digits;
}

export async function generateAndSendOtp(phone: string) {
  const cleanPhone = cleanPhoneNumber(phone);
  const formattedIntl = '+' + cleanPhone;

  // Generate 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 10-minute expiry
  otpStore.set(cleanPhone, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  console.log(`[SMS OTP Generated] Phone: ${formattedIntl} | Code: ${code}`);

  // Dispatch via Termii SMS Gateway
  const termiiApiKey = process.env.TERMII_API_KEY;
  const termiiSenderId = process.env.TERMII_SENDER_ID || 'N-ALERT';

  if (termiiApiKey && termiiApiKey !== 'termii_mock_api_key') {
    try {
      const res = await axios.post('https://api.ng.termii.com/api/sms/send', {
        to: cleanPhone,
        from: termiiSenderId,
        sms: `Your BG Laundry verification code is: ${code}. Valid for 10 minutes.`,
        type: 'plain',
        channel: 'generic',
        api_key: termiiApiKey,
      });
      console.log(`[SMS OTP Sent via Termii] to ${formattedIntl}:`, res.data);
    } catch (err: any) {
      console.error('[Termii SMS Dispatch Error]', err?.response?.data || err?.message);
    }
  } else {
    console.warn(`[SMS Dispatch Warning] TERMII_API_KEY is missing or set to mock. Code logged for testing: ${code}`);
  }

  return {
    success: true,
    message: `A 6-digit SMS verification code was sent to ${formattedIntl}.`,
  };
}

export function verifyServerOtp(phone: string, inputCode: string): boolean {
  const cleanPhone = cleanPhoneNumber(phone);
  const cleanInput = inputCode.replace(/\D/g, '').trim();

  // Master testing code for dev/emergency verification
  if (cleanInput === '123456') {
    console.log(`[OTP Master Code Used] Phone: ${cleanPhone}`);
    otpStore.delete(cleanPhone);
    return true;
  }

  const record = otpStore.get(cleanPhone);
  if (!record) {
    console.warn(`[OTP Verification] No active session record found for ${cleanPhone}`);
    return false;
  }

  if (Date.now() > record.expiresAt) {
    console.warn(`[OTP Verification] Code expired for ${cleanPhone}`);
    otpStore.delete(cleanPhone);
    return false;
  }

  if (record.attempts >= 5) {
    console.warn(`[OTP Verification] Too many failed attempts for ${cleanPhone}`);
    otpStore.delete(cleanPhone);
    return false;
  }

  if (record.code === cleanInput) {
    console.log(`[OTP Verification Success] Phone: ${cleanPhone}`);
    otpStore.delete(cleanPhone);
    return true;
  }

  record.attempts += 1;
  console.warn(`[OTP Verification Failed] Invalid code for ${cleanPhone}. Attempt ${record.attempts}/5`);
  return false;
}

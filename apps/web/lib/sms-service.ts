import axios from 'axios';

type SendSmsParams = {
  to: string;
  message: string;
};

function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) {
    return '234' + digits.slice(1);
  }
  return digits;
}

function hasValue(value: string | undefined, mockValue: string): value is string {
  return Boolean(value && value.trim() && value !== mockValue);
}

async function sendViaSendchamp({ to, message }: SendSmsParams) {
  const apiKey = process.env.SENDCHAMP_API_KEY;

  if (!hasValue(apiKey, 'sendchamp_mock_api_key')) {
    return false;
  }

  const baseUrl = process.env.SENDCHAMP_BASE_URL || 'https://api.sendchamp.com/api/v1';
  const senderName = process.env.SENDCHAMP_SENDER_ID || 'Sendchamp';
  const route = process.env.SENDCHAMP_SMS_ROUTE || 'dnd';
  const phone = cleanPhoneNumber(to);

  const response = await axios.post(`${baseUrl}/sms/send`, {
    to: [phone],
    message,
    sender_name: senderName,
    route,
  }, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 12_000,
  });

  console.log(`[SMS Sent via Sendchamp] to +${phone}:`, response.data);
  return true;
}

async function sendViaTermii({ to, message }: SendSmsParams) {
  const apiKey = process.env.TERMII_API_KEY;

  if (!hasValue(apiKey, 'termii_mock_api_key')) {
    return false;
  }

  const phone = cleanPhoneNumber(to);
  const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
    to: phone,
    from: process.env.TERMII_SENDER_ID || 'BGLAUNDRY',
    sms: message,
    type: 'plain',
    channel: 'generic',
    api_key: apiKey,
  }, { timeout: 12_000 });

  console.log(`[SMS Sent via Termii] to +${phone}:`, response.data);
  return true;
}

export async function sendSms(params: SendSmsParams): Promise<boolean> {
  const provider = process.env.SMS_PROVIDER || 'sendchamp';

  try {
    if (provider === 'sendchamp') {
      return await sendViaSendchamp(params);
    }

    if (provider === 'termii') {
      return await sendViaTermii(params);
    }

    console.warn(`[SMS Dispatch Warning] Unknown SMS_PROVIDER "${provider}".`);
    return false;
  } catch (error: any) {
    console.error('[SMS Dispatch Error]', error?.response?.data || error?.message);
    return false;
  }
}

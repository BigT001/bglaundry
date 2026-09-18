import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';
import { sendSms } from './sms-service';

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

  const recent = await prisma.phoneVerificationToken.findUnique({ where: { phone: cleanPhone } });
  if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
    throw new Error('Please wait one minute before requesting another code.');
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.phoneVerificationToken.upsert({
    where: { phone: cleanPhone },
    update: { codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0, createdAt: new Date() },
    create: { phone: cleanPhone, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });

  const smsDelivered = await sendSms({
    to: cleanPhone,
    message: `Your BG Laundry verification code is: ${code}. Valid for 10 minutes.`,
  });

  if (!smsDelivered) {
    await prisma.phoneVerificationToken.delete({ where: { phone: cleanPhone } });
    throw new Error('SMS delivery is temporarily unavailable. Please try again later.');
  }

  return {
    success: true,
    message: `A 6-digit SMS verification code was sent to ${formattedIntl}.`,
  };
}

export async function verifyServerOtp(phone: string, inputCode: string): Promise<boolean> {
  const cleanPhone = cleanPhoneNumber(phone);
  const cleanInput = inputCode.replace(/\D/g, '').trim();

  const record = await prisma.phoneVerificationToken.findUnique({ where: { phone: cleanPhone } });
  if (!record) {
    console.warn(`[OTP Verification] No active session record found for ${cleanPhone}`);
    return false;
  }

  if (Date.now() > record.expiresAt.getTime()) {
    console.warn(`[OTP Verification] Code expired for ${cleanPhone}`);
    await prisma.phoneVerificationToken.delete({ where: { phone: cleanPhone } });
    return false;
  }

  if (record.attempts >= 5) {
    console.warn(`[OTP Verification] Too many failed attempts for ${cleanPhone}`);
    await prisma.phoneVerificationToken.delete({ where: { phone: cleanPhone } });
    return false;
  }

  if (await bcrypt.compare(cleanInput, record.codeHash)) {
    console.log(`[OTP Verification Success] Phone: ${cleanPhone}`);
    await prisma.phoneVerificationToken.delete({ where: { phone: cleanPhone } });
    return true;
  }

  const attempts = record.attempts + 1;
  await prisma.phoneVerificationToken.update({ where: { phone: cleanPhone }, data: { attempts } });
  console.warn(`[OTP Verification Failed] Invalid code for ${cleanPhone}. Attempt ${attempts}/5`);
  return false;
}

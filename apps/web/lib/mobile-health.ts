import crypto from 'node:crypto';
import { prisma } from './prisma';

export function reportFingerprint(report: { kind: string; errorName?: string | null; stack?: string | null; endpoint?: string | null; httpStatus?: number | null }) {
  return crypto.createHash('sha256').update([report.kind, report.errorName, report.stack?.split('\n')[0], report.endpoint, report.httpStatus].join('|')).digest('hex').slice(0, 24);
}

// Observability must never break sign-in when the reporting table is unavailable.
export async function recordOtpEvent(kind: 'OTP_ACCEPTED' | 'OTP_FAILED' | 'OTP_VERIFIED' | 'OTP_REJECTED') {
  try {
    await prisma.mobileReport.create({ data: {
      eventId: crypto.randomUUID(), source: 'SERVER', kind, platform: 'server',
      appVersion: process.env.SMS_PROVIDER === 'termii' ? 'termii' : 'sendchamp',
      fingerprint: reportFingerprint({ kind }), occurredAt: new Date(), status: kind === 'OTP_FAILED' ? 'OPEN' : 'RESOLVED',
    } });
  } catch {
    console.error('[Mobile health] Could not save OTP diagnostic event.');
  }
}

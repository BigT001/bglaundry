interface OtpEntry {
  code: string;
  expiresAt: number;
}

const globalForOtp = globalThis as unknown as {
  otpMap: Map<string, OtpEntry>;
};

export const otpMap = globalForOtp.otpMap || new Map<string, OtpEntry>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpMap = otpMap;
}

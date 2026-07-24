export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.startsWith('234')) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

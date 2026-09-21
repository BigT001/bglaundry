const kinds = ['JS_CRASH', 'NATIVE_CRASH', 'RENDER_ERROR', 'API_FAILURE', 'APP_START'] as const;
export function safeStack(value: unknown) {
  if (typeof value !== 'string') return '';
  // Exclude exception messages, arguments and URL queries, which can contain user data.
  return value.split('\n').filter(line => /^\s*at\s+[\w.$<>]/.test(line) || /^[\w.$<>]+@/.test(line)).slice(0, 30)
    .map(line => line.replace(/\?[^\s)]*/g, '?[removed]').replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email]').replace(/\b\d{6,}\b/g, '[number]').slice(0, 200)).join('\n');
}
export function safeEndpoint(value: unknown) {
  if (typeof value !== 'string') return null;
  const path = value.split('?')[0].replace(/^https?:\/\/[^/]+/, '').replace(/^\/api\/v1/, '');
  if (/^\/auth\/(request-otp|verify-otp|login|signup|mobile-session)$/.test(path)) return path;
  if (/^\/(orders|users|payments|services)(\/|$)/.test(path)) return '/' + path.split('/')[1] + '/*';
  return '/other';
}
export function parseMobileReport(value: any) {
  if (!value || !kinds.includes(value.kind) || !/^[a-f0-9-]{36}$/i.test(value.eventId || '') || !['android', 'ios', 'web'].includes(value.platform)) throw new Error('Invalid report.');
  const occurredAt = new Date(value.occurredAt);
  if (!Number.isFinite(occurredAt.getTime()) || occurredAt.getTime() > Date.now() + 300_000 || occurredAt.getTime() < Date.now() - 30 * 86400_000) throw new Error('Invalid report date.');
  const version = (v: unknown) => typeof v === 'string' && /^[\w.+-]{1,40}$/.test(v) ? v : 'unknown';
  return {
    eventId: value.eventId, kind: value.kind as typeof kinds[number], platform: value.platform as string,
    appVersion: version(value.appVersion), osVersion: version(value.osVersion),
    errorName: typeof value.errorName === 'string' && /^[\w.$]{1,80}$/.test(value.errorName) ? value.errorName : null,
    stack: safeStack(value.stack), endpoint: safeEndpoint(value.endpoint),
    httpStatus: Number.isInteger(value.httpStatus) && value.httpStatus >= 0 && value.httpStatus <= 599 ? value.httpStatus : null,
    durationMs: Number.isInteger(value.durationMs) && value.durationMs >= 0 && value.durationMs <= 300000 ? value.durationMs : null,
    occurredAt,
  };
}

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function load(file, dependencies = {}, env = {}) {
  const context = { exports: {}, require: name => { if (name in dependencies) return dependencies[name]; throw Error(name); }, process: { env }, console: { error() {}, warn() {}, log() {} } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, context);
  return context.exports;
}
test('diagnostics whitelist fields and remove message, credentials and contact data', () => {
  const { parseMobileReport } = load('lib/mobile-health-validation.ts');
  const report = parseMobileReport({ eventId: '12345678-1234-4234-8234-123456789abc', kind: 'JS_CRASH', platform: 'android', appVersion: '1.0.18', errorName: 'TypeError', stack: 'Error: customer@example.com OTP 123456\n    at login (https://example.com/index.bundle?token=secret:1:2)', phoneNumber: '+2348150000000', token: 'secret', message: 'private', occurredAt: new Date().toISOString() });
  assert.equal(report.kind, 'JS_CRASH');
  assert.equal(report.phoneNumber, undefined); assert.equal(report.token, undefined); assert.equal(report.message, undefined);
  assert.doesNotMatch(report.stack, /customer@|123456|secret/);
});
test('clients cannot submit trusted server OTP events or invalid reports', () => {
  const { parseMobileReport } = load('lib/mobile-health-validation.ts');
  for (const value of [null, {}, { kind: 'OTP_VERIFIED' }, { kind: 'JS_CRASH', eventId: 'bad' }]) assert.throws(() => parseMobileReport(value));
});
for (const provider of ['sendchamp', 'termii']) {
  test(`${provider}: HTTP 200 with a rejection must not claim SMS success`, async () => {
    const { sendSms } = load('lib/sms-service.ts', { axios: { post: async () => ({ data: { status: 'error', code: 'failed' } }) } }, { SMS_PROVIDER: provider, SENDCHAMP_API_KEY: 'configured', TERMII_API_KEY: 'configured' });
    assert.equal(await sendSms({ to: '2348012345678', message: 'test' }), false);
  });
}
test('Sendchamp: accepted response sends the normalized Nigerian number', async () => {
  let request;
  const { sendSms } = load('lib/sms-service.ts', { axios: { post: async (...args) => {
    request = args;
    return { data: { status: 'success', code: 200 } };
  } } }, { SMS_PROVIDER: 'sendchamp', SENDCHAMP_API_KEY: 'configured' });

  assert.equal(await sendSms({ to: '08012345678', message: 'Your OTP is 123456.' }), true);
  assert.equal(request[0], 'https://api.sendchamp.com/api/v1/sms/send');
  assert.deepEqual(JSON.parse(JSON.stringify(request[1])), {
    to: ['2348012345678'],
    message: 'Your OTP is 123456.',
    sender_name: 'Sendchamp',
    route: 'dnd',
  });
  assert.equal(request[2].headers.Authorization, 'Bearer configured');
});
test('Termii OTP messages use the transactional route and accepted response is recognized', async () => {
  let payload;
  const { sendSms } = load('lib/sms-service.ts', { axios: { post: async (_, body) => { payload = body; return { data: { code: 'ok', message_id: '123' } }; } } }, { SMS_PROVIDER: 'termii', TERMII_API_KEY: 'configured' });
  assert.equal(await sendSms({ to: '2348012345678', message: 'test' }), true);
  assert.equal(payload.channel, 'dnd');
});

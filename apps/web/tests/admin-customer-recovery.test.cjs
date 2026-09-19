const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../app/api/v1/admin/users/route.ts'), 'utf8');
function setup({ delivery = true, duplicate = false, authorized = true } = {}) {
  const records = [];
  const database = {
    user: {
      findFirst: async () => duplicate ? { id: 'existing' } : null,
      create: async ({ data }) => { const row = { id: 'customer-1', ...data }; records.push(row); return row; },
      delete: async () => { records.length = 0; },
    },
    passwordResetToken: { create: async () => ({}), deleteMany: async () => ({}) },
    $transaction: async (operation) => typeof operation === 'function' ? operation(database) : Promise.all(operation),
  };
  const dependencies = {
    'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } },
    'node:crypto': require('node:crypto'),
    bcrypt: { hash: async () => 'hashed' },
    '@/lib/prisma': { prisma: database },
    '@bglaundry/database': { Role: { CUSTOMER: 'CUSTOMER' }, OrderStatus: {}, PaymentStatus: {} },
    '@/lib/auth': { bearerToken: () => 'token', verifyAdminToken: () => authorized },
    '@/lib/phone': { normalizePhone: (phone) => phone.replace(/^0/, '+234') },
    '@/lib/email': { sendCustomerRecoveryEmail: async () => { if (delivery === 'throws') throw Error('Mail offline'); return delivery; } },
  };
  const context = { exports: {}, require: (name) => { assert.ok(name in dependencies, name); return dependencies[name]; }, console: { error() {} } };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, context);
  return { records, post: (body) => context.exports.POST({ json: async () => body }) };
}
const details = { fullName: ' Customer Name ', email: 'CUSTOMER@example.com', phoneNumber: '08012345678', address: ' 12 Example Road, Lagos ' };
test('saves the customer contact details and default home address', async () => {
  const app = setup(); const result = await app.post(details);
  assert.equal(result.status, 201);
  assert.equal(app.records[0].fullName, 'Customer Name');
  assert.equal(app.records[0].email, 'customer@example.com');
  assert.equal(app.records[0].phoneNumber, '+2348012345678');
  assert.equal(app.records[0].pickupAddress, '12 Example Road, Lagos');
  assert.equal(app.records[0].homeAddress, '12 Example Road, Lagos');
  assert.equal(app.records[0].addressType, 'HOME');
  assert.equal(app.records[0].role, 'CUSTOMER');
  assert.equal(result.body.user.passwordHash, undefined);
});
for (const delivery of [false, 'throws']) test(`preserves restored customer when email delivery is ${delivery}`, async () => {
  const app = setup({ delivery }); const result = await app.post(details);
  assert.equal(result.status, 201); assert.equal(app.records.length, 1);
  assert.equal(result.body.emailSent, false); assert.match(result.body.message, /saved|created/i);
});
test('rejects missing address without saving', async () => {
  const app = setup(); assert.equal((await app.post({ ...details, address: '' })).status, 400); assert.equal(app.records.length, 0);
});
test('rejects duplicate customer without saving', async () => {
  const app = setup({ duplicate: true }); assert.equal((await app.post(details)).status, 409); assert.equal(app.records.length, 0);
});
test('requires admin authentication', async () => {
  const app = setup({ authorized: false }); assert.equal((await app.post(details)).status, 401); assert.equal(app.records.length, 0);
});

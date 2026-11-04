const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({ Intl, Date });
vm.runInContext(
  fs.readFileSync('functions/domain.mjs', 'utf8').replaceAll('export ', ''),
  context,
);
const instant = (date, time, zone, now = '2026-01-01T00:00:00Z') =>
  context.scheduledInstant(date, time, zone, Date.parse(now));
assert.equal(instant('2030-07-01', '12:00', 'Europe/Rome'), Date.parse('2030-07-01T10:00:00Z'));
assert.equal(instant('2030-01-01', '12:00', 'Europe/Rome'), Date.parse('2030-01-01T11:00:00Z'));
assert.equal(
  instant('2030-01-01', '00:30', 'Pacific/Kiritimati'),
  Date.parse('2029-12-31T10:30:00Z'),
);
for (const date of ['2030-02-31', '2030-02-29', '2100-02-29', '2030-04-31'])
  assert.throws(() => instant(date, '12:00', 'UTC'), /invalid-argument/);
assert.equal(instant('2032-02-29', '12:00', 'UTC'), Date.parse('2032-02-29T12:00:00Z'));
assert.throws(
  () => instant('2026-03-29', '02:30', 'Europe/Rome'),
  /invalid-argument/,
  'Reject a nonexistent DST hour',
);
assert.equal(instant('2026-10-25', '02:30', 'Europe/Rome'), Date.parse('2026-10-25T00:30:00Z'));
assert.equal(
  instant('2026-10-25', '02:30', 'Europe/Rome', '2026-10-25T01:00:00Z'),
  Date.parse('2026-10-25T01:30:00Z'),
);
assert.throws(
  () => instant('2026-01-01', '01:00', 'Europe/Rome', '2026-01-01T01:00:00Z'),
  /past-date/,
);
assert.throws(() => instant('2030-01-01', '12:00', 'Invalid/Zone'), /invalid-argument/);
const now = Date.parse('2026-11-04T12:00:00Z');
const first = context.nextMessageQuota(null, now);
assert.equal(first.count, 1);
assert.throws(() => context.nextMessageQuota(first, now + 9999), /resource-exhausted/);
assert.equal(context.nextMessageQuota(first, now + 10000).count, 2);
assert.throws(
  () => context.nextMessageQuota({ ...first, count: 120, lastAt: now - 10001 }, now),
  /resource-exhausted/,
);
assert.equal(context.nextMessageQuota({ ...first, count: 120 }, now + 86400000).count, 1);
const admin = {
  token: {
    email: 'deniska7best@gmail.com',
    email_verified: true,
    firebase: { sign_in_provider: 'google.com' },
  },
};
assert(context.isAdministrator(admin));
assert(!context.isAdministrator({ token: { ...admin.token, email_verified: false } }));
assert(
  !context.isAdministrator({
    token: { ...admin.token, firebase: { sign_in_provider: 'password' } },
  }),
);
assert.throws(() => context.checkedText(' '.repeat(10), 150), /invalid-argument/);
assert.throws(() => context.checkedText('a'.repeat(151), 150), /invalid-argument/);
console.log(
  'PASS: server time zones, leap years, DST, past dates, per-account rate limits and admin identity',
);

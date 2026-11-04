// Pure validation shared by callables and isolated tests.
export const ADMIN_EMAIL = 'deniska7best@gmail.com';
export function isAdministrator(auth) {
  return (
    auth?.token?.email === ADMIN_EMAIL &&
    auth.token.email_verified === true &&
    auth.token.firebase?.sign_in_provider === 'google.com'
  );
}
export function checkedText(value, max, required = true) {
  if (typeof value !== 'string') throw new Error('invalid-argument');
  const result = value.trim();
  if ((required && !result) || result.length > max) throw new Error('invalid-argument');
  return result;
}
export function scheduledInstant(date, time, timezone, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new Error('invalid-argument');
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  if (new Date(wall).toISOString().slice(0, 10) !== date) throw new Error('invalid-argument');
  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
  } catch (_) {
    throw new Error('invalid-argument');
  }
  const localParts = (ms) =>
    Object.fromEntries(formatter.formatToParts(ms).map((p) => [p.type, p.value]));
  const offsets = new Set();
  for (const hours of [-48, -24, 0, 24, 48]) {
    const ms = wall + hours * 3600000,
      p = localParts(ms);
    offsets.add(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - ms);
  }
  const candidates = [...offsets]
    .map((offset) => wall - offset)
    .filter((ms) => {
      const p = localParts(ms);
      return `${p.year}-${p.month}-${p.day}` === date && `${p.hour}:${p.minute}` === time;
    })
    .sort((a, b) => a - b);
  // DST gaps have no matching instant; folds select the earliest future occurrence.
  if (!candidates.length) throw new Error('invalid-argument');
  const future = candidates.find((ms) => ms >= now);
  if (future === undefined) throw new Error('past-date');
  return future;
}
export function validateRequest(input, now = Date.now()) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('invalid-argument');
  const allowed = [
    'type',
    'network',
    'date',
    'time',
    'timezone',
    'callsign',
    'route',
    'contact',
    'notes',
  ];
  if (Object.keys(input).some((key) => !allowed.includes(key)))
    throw new Error('invalid-argument');
  if (
    !['flight', 'atc'].includes(input.type) ||
    !['Infinite Flight', 'VATSIM', 'IVAO', 'Other'].includes(input.network)
  )
    throw new Error('invalid-argument');
  const data = { type: input.type, network: input.network };
  for (const [key, max, required] of [
    ['date', 10, true],
    ['time', 5, true],
    ['timezone', 80, true],
    ['callsign', 80, true],
    ['route', 120, true],
    ['contact', 120, false],
    ['notes', 500, false],
  ])
    data[key] = checkedText(input[key], max, required);
  return { data, scheduledAt: scheduledInstant(data.date, data.time, data.timezone, now) };
}
export function nextMessageQuota(previous, now) {
  const day = new Date(now).toISOString().slice(0, 10);
  const count = previous?.day === day ? previous.count : 0;
  if ((previous?.lastAt || 0) > now - 10000 || count >= 120)
    throw new Error('resource-exhausted');
  return { day, count: count + 1, lastAt: now };
}

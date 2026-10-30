// Scheduled notification worker. Only the request ID and creation time are read;
// no visitor details are sent to Telegram or written to the state database.
const PROJECT = 'denis-komarov---aviation';
const BASE = `projects/${PROJECT}/databases/(default)/documents`;
const LINK = 'https://denis7kom.github.io/denis-aviation/requests.html#list-panel';
const LIMIT = 10;
const LOCK_MS = 240_000;
const encoder = new TextEncoder();

function base64url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function googleToken(raw, fetcher) {
  let key;
  try {
    key = JSON.parse(raw);
  } catch (_) {
    throw new Error('Invalid service account configuration');
  }
  if (
    !key ||
    typeof key !== 'object' ||
    Array.isArray(key) ||
    key.type !== 'service_account' ||
    typeof key.client_email !== 'string' ||
    !key.client_email.trim() ||
    typeof key.private_key !== 'string' ||
    !key.private_key.trim()
  )
    throw new Error('Invalid service account configuration');
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(encoder.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(
    encoder.encode(
      JSON.stringify({
        iss: key.client_email,
        scope: 'https://www.googleapis.com/auth/datastore',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
      }),
    ),
  );
  let cryptoKey;
  try {
    const pem = key.private_key.replace(
      /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,
      '',
    );
    const pkcs8 = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
    cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      pkcs8,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign'],
    );
  } catch (_) {
    throw new Error('Invalid service account private key');
  }
  const unsigned = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsigned),
  );
  const response = await fetcher('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${base64url(new Uint8Array(signature))}`,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Google token request failed (${response.status})`);
  let data;
  try {
    data = await response.json();
  } catch (_) {
    throw new Error('Invalid Google token response');
  }
  if (!data?.access_token) throw new Error('Google did not provide an access token');
  return data.access_token;
}

function makeQuery(cursor) {
  const values = [{ timestampValue: cursor.created_at }];
  if (cursor.document_name) values.push({ referenceValue: cursor.document_name });
  return {
    structuredQuery: {
      select: { fields: [{ fieldPath: 'createdAt' }] },
      from: [{ collectionId: 'flightRequests' }],
      orderBy: [
        { field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' },
        { field: { fieldPath: '__name__' }, direction: 'ASCENDING' },
      ],
      startAt: { values, before: !cursor.document_name },
      limit: LIMIT,
    },
  };
}

async function getRequests(token, cursor, fetcher) {
  const response = await fetcher(`https://firestore.googleapis.com/v1/${BASE}:runQuery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(makeQuery(cursor)),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Firestore query failed (${response.status})`);
  const results = await response.json();
  if (!Array.isArray(results)) throw new Error('Invalid Firestore response');
  return results
    .filter((row) => row.document)
    .map((row) => {
      const document = row.document;
      const timestamp = document.fields?.createdAt?.timestampValue;
      if (!timestamp || !document.name?.startsWith(`${BASE}/flightRequests/`))
        throw new Error('Invalid request document');
      return { created_at: timestamp, document_name: document.name };
    });
}

async function sendTelegram(env, fetcher) {
  let response;
  try {
    response = await fetcher(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: `Новая заявка на сайте.\n${LINK}`,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (_) {
    // Some fetch errors include the request URL; never expose the bot token in logs.
    throw new Error('Telegram connection failed');
  }
  if (!response.ok) throw new Error(`Telegram request failed (${response.status})`);
  let result;
  try {
    result = await response.json();
  } catch (_) {
    throw new Error('Invalid Telegram response');
  }
  if (!result?.ok) throw new Error('Telegram did not accept the message');
}

export async function run(env, fetcher = fetch) {
  const required = [
    ['DB', env.DB],
    ['GOOGLE_SERVICE_ACCOUNT', env.GOOGLE_SERVICE_ACCOUNT],
    ['TELEGRAM_BOT_TOKEN', env.TELEGRAM_BOT_TOKEN],
    ['TELEGRAM_CHAT_ID', env.TELEGRAM_CHAT_ID],
  ];
  const missing = required
    .filter(([, value]) => !value || (typeof value === 'string' && !value.trim()))
    .map(([name]) => name);
  if (missing.length) throw new Error(`Missing Worker configuration: ${missing.join(', ')}`);
  const id = crypto.randomUUID();
  const now = Date.now();
  const locked = await env.DB.prepare(
    'UPDATE notifier_state SET lock_id = ?, lock_until = ? WHERE id = 1 AND lock_until < ? RETURNING created_at, document_name',
  )
    .bind(id, now + LOCK_MS, now)
    .first();
  if (!locked) {
    const existing = await env.DB.prepare('SELECT id FROM notifier_state WHERE id = 1').first();
    if (!existing) throw new Error('Notification state is not initialized');
    return;
  }
  try {
    const token = await googleToken(env.GOOGLE_SERVICE_ACCOUNT, fetcher);
    const requests = await getRequests(token, locked, fetcher);
    for (const request of requests) {
      const lease = await env.DB.prepare(
        'SELECT lock_id, lock_until FROM notifier_state WHERE id = 1',
      ).first();
      if (!lease || lease.lock_id !== id || lease.lock_until < Date.now() + 20000)
        throw new Error('Notification lease expired');
      await sendTelegram(env, fetcher);
      const result = await env.DB.prepare(
        'UPDATE notifier_state SET created_at = ?, document_name = ? WHERE id = 1 AND lock_id = ?',
      )
        .bind(request.created_at, request.document_name, id)
        .run();
      if (result.meta.changes !== 1) throw new Error('Could not save notification cursor');
    }
  } finally {
    await env.DB.prepare(
      'UPDATE notifier_state SET lock_id = NULL, lock_until = 0 WHERE id = 1 AND lock_id = ?',
    )
      .bind(id)
      .run();
  }
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(run(env));
  },
};

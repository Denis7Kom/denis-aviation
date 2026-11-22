const PROJECT = 'denis-komarov---aviation';
const BASE = `projects/${PROJECT}/databases/(default)/documents`;
const ORIGIN = 'https://denis7kom.github.io';
const ADMIN_EMAIL = 'deniska7best@gmail.com';
const WEB_API_KEY = 'AIzaSyDNhB8EMckVFlh3r2hSJr9KRZv6Pjlv65w';
const PAGE_SIZE = 10;
const SEND_LIMIT = 14;
const byName = { field: { fieldPath: '__name__' }, direction: 'ASCENDING' };
const byTime = { field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      Vary: 'Origin',
    },
  });
}

async function accountFor(request, fetcher) {
  const match = /^Bearer ([A-Za-z0-9_.-]{100,4000})$/.exec(
    request.headers.get('Authorization') || '',
  );
  if (!match) return null;
  const result = await fetcher(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${WEB_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: match[1] }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!result.ok) return null;
  const account = (await result.json()).users?.[0];
  if (!account?.localId || account.disabled || account.emailVerified !== true) return null;
  return { uid: account.localId, admin: account.email === ADMIN_EMAIL };
}

export async function handleBrowserPush(request, env, fetcher = fetch) {
  const route = new URL(request.url).pathname;
  if (!['/push/config', '/push/device'].includes(route)) return json({ error: 'not-found' }, 404);
  if (request.headers.get('Origin') !== ORIGIN) return json({ error: 'forbidden' }, 403);
  if (request.method === 'OPTIONS') return json({});
  if (!/^[A-Za-z0-9_-]{87}$/.test(env.FCM_VAPID_PUBLIC_KEY || ''))
    return json({ error: 'not-configured' }, 503);
  if (route === '/push/config' && request.method === 'GET')
    return json({ vapidKey: env.FCM_VAPID_PUBLIC_KEY });
  if (route !== '/push/device' || request.method !== 'POST') return json({ error: 'method' }, 405);
  try {
    const account = await accountFor(request, fetcher);
    if (!account) return json({ error: 'unauthenticated' }, 401);
    const raw = await request.text();
    if (raw.length > 6000) return json({ error: 'too-large' }, 413);
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      return json({ error: 'invalid-json' }, 400);
    }
    if (!/^[A-Za-z0-9_:-]{40,4096}$/.test(data?.token || ''))
      return json({ error: 'invalid-token' }, 400);
    if (data.remove === true) {
      await env.DB.batch([
        env.DB.prepare(
          'DELETE FROM browser_delivery WHERE token = ? AND EXISTS (SELECT 1 FROM browser_devices WHERE token = ? AND uid = ?)',
        ).bind(data.token, data.token, account.uid),
        env.DB.prepare('DELETE FROM browser_devices WHERE token = ? AND uid = ?').bind(
          data.token,
          account.uid,
        ),
      ]);
      return json({ registered: false });
    }
    const language = ['ru', 'en', 'it'].includes(data.language) ? data.language : 'ru';
    const result = await env.DB.prepare(
      `INSERT INTO browser_devices (token, uid, is_admin, language, registered_at)
       SELECT ?, ?, ?, ?, ?
       WHERE (SELECT count(*) FROM browser_devices WHERE uid = ?) < 10
          OR EXISTS (SELECT 1 FROM browser_devices WHERE token = ? AND uid = ?)
       ON CONFLICT(token) DO UPDATE SET language = excluded.language, is_admin = excluded.is_admin
       WHERE browser_devices.uid = excluded.uid`,
    )
      .bind(
        data.token,
        account.uid,
        +account.admin,
        language,
        new Date().toISOString(),
        account.uid,
        data.token,
        account.uid,
      )
      .run();
    if (!result.meta.changes) return json({ error: 'registration-conflict' }, 409);
    return json({ registered: true });
  } catch (_) {
    return json({ error: 'temporarily-unavailable' }, 503);
  }
}

async function query(token, parent, structuredQuery, fetcher) {
  const response = await fetcher(`https://firestore.googleapis.com/v1/${parent}:runQuery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Browser push Firestore query failed (${response.status})`);
  return (await response.json()).flatMap((row) => (row.document ? [row.document] : []));
}

function enqueue(db, requestId, kind, owner, actor) {
  return db
    .prepare(
      `INSERT INTO browser_delivery (token, request_id, kind)
     SELECT token, ?, ? FROM browser_devices
     WHERE (uid = ? OR is_admin = 1) AND uid != ?`,
    )
    .bind(requestId, kind, owner, actor);
}

async function scanRequest(db, token, doc, startedAt, fetcher, hasClients) {
  const requestId = doc.name.split('/').at(-1);
  const owner = doc.fields?.owner?.stringValue;
  const status = doc.fields?.status?.stringValue;
  if (!owner || !status || !/^[A-Za-z0-9_-]{1,128}$/.test(requestId)) return;
  if (!hasClients.has(owner) && !hasClients.has('')) return;

  const old = await db
    .prepare(
      'SELECT status, message_time, message_name FROM browser_request_state WHERE request_id = ?',
    )
    .bind(requestId)
    .first();
  let messageTime = old?.message_time ?? startedAt;
  let messageName = old?.message_name ?? '';
  const messages = await query(
    token,
    doc.name,
    {
      select: { fields: [{ fieldPath: 'createdAt' }, { fieldPath: 'authorUid' }] },
      from: [{ collectionId: 'messages' }],
      orderBy: [byTime, byName],
      startAt: {
        values: [
          { timestampValue: messageTime },
          ...(messageName ? [{ referenceValue: messageName }] : []),
        ],
        before: !messageName,
      },
      limit: 10,
    },
    fetcher,
  );

  const changes = [];
  if (!old && Date.parse(doc.fields.createdAt?.timestampValue || '') >= Date.parse(startedAt))
    changes.push(enqueue(db, requestId, 'request', owner, ''));
  if (old && old.status !== status) changes.push(enqueue(db, requestId, 'status', owner, ''));
  for (const message of messages) {
    const author = message.fields?.authorUid?.stringValue;
    if (author) changes.push(enqueue(db, requestId, 'message', owner, author));
    messageTime = message.fields.createdAt.timestampValue;
    messageName = message.name;
  }
  if (old && !changes.length && messageName === old.message_name) return;
  changes.push(
    db
      .prepare(
        `INSERT INTO browser_request_state (request_id, status, message_time, message_name)
     VALUES (?, ?, ?, ?) ON CONFLICT(request_id) DO UPDATE SET
     status = excluded.status, message_time = excluded.message_time, message_name = excluded.message_name`,
      )
      .bind(requestId, status, messageTime, messageName),
  );
  await db.batch(changes);
}

async function sendPending(db, token, fetcher) {
  const { results } = await db
    .prepare(
      `SELECT browser_delivery.*, browser_devices.language
     FROM browser_delivery JOIN browser_devices USING (token)
     ORDER BY id LIMIT ?`,
    )
    .bind(SEND_LIMIT)
    .all();
  let retryStatus;
  for (const item of results) {
    const response = await fetcher(
      `https://fcm.googleapis.com/v1/projects/${PROJECT}/messages:send`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            token: item.token,
            data: { kind: item.kind, requestId: item.request_id, language: item.language },
            webpush: { headers: { TTL: '3600' } },
          },
        }),
        signal: AbortSignal.timeout(10000),
      },
    ).catch(() => null);
    if (!response?.ok) {
      const status = response?.status ?? 0;
      const failure = response ? await response.json().catch(() => ({})) : {};
      const unregistered = failure.error?.details?.some(
        (detail) => detail.errorCode === 'UNREGISTERED',
      );
      if (!unregistered && [401, 403, 429].includes(status))
        throw new Error(`Browser push sending failed (${status})`);
      if (!unregistered) {
        // Keep the delivery for the next cron, behind notifications not tried yet.
        await db
          .prepare(
            'UPDATE browser_delivery SET id = (SELECT max(id) + 1 FROM browser_delivery) WHERE id = ?',
          )
          .bind(item.id)
          .run();
        retryStatus = status;
        continue;
      }
      await db.batch([
        db.prepare('DELETE FROM browser_delivery WHERE token = ?').bind(item.token),
        db.prepare('DELETE FROM browser_devices WHERE token = ?').bind(item.token),
      ]);
      continue;
    }
    await db.prepare('DELETE FROM browser_delivery WHERE id = ?').bind(item.id).run();
  }
  if (retryStatus !== undefined)
    throw new Error(`Browser push retained failed deliveries (${retryStatus || 'network error'})`);
}

export async function runBrowserPush(env, authorize, fetcher = fetch) {
  if (!env.FCM_VAPID_PUBLIC_KEY) return;
  const db = env.DB;
  const lock = crypto.randomUUID();
  const now = Date.now();
  const scan = await db
    .prepare(
      `UPDATE browser_scan SET lock_until = ?, lock_id = ?
     WHERE id = 1 AND lock_until < ? RETURNING started_at, after_name`,
    )
    .bind(now + 240000, lock, now)
    .first();
  if (!scan) return;
  try {
    const { results } = await db
      .prepare('SELECT DISTINCT uid, is_admin FROM browser_devices')
      .all();
    if (!results.length) return;
    const subscribers = new Set(results.map((row) => (row.is_admin ? '' : row.uid)));
    const token = await authorize(
      env.GOOGLE_SERVICE_ACCOUNT,
      fetcher,
      'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging',
    );
    const docs = await query(
      token,
      BASE,
      {
        select: {
          fields: [{ fieldPath: 'createdAt' }, { fieldPath: 'status' }, { fieldPath: 'owner' }],
        },
        from: [{ collectionId: 'flightRequests' }],
        orderBy: [byName],
        ...(scan.after_name
          ? {
              startAt: { values: [{ referenceValue: scan.after_name }], before: false },
            }
          : {}),
        limit: PAGE_SIZE,
      },
      fetcher,
    );
    for (const doc of docs)
      await scanRequest(db, token, doc, scan.started_at, fetcher, subscribers);
    const next = docs.length === PAGE_SIZE ? docs.at(-1).name : '';
    await db
      .prepare('UPDATE browser_scan SET after_name = ? WHERE id = 1 AND lock_id = ?')
      .bind(next, lock)
      .run();
    await sendPending(db, token, fetcher);
  } finally {
    await db
      .prepare(
        'UPDATE browser_scan SET lock_until = 0, lock_id = NULL WHERE id = 1 AND lock_id = ?',
      )
      .bind(lock)
      .run();
  }
}

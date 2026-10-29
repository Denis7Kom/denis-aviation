const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { generateKeyPairSync } = require('node:crypto');
const { readFileSync } = require('node:fs');

(async () => {
  const { run } = await import('../telegram-notifier/worker.js');
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync('telegram-notifier/schema.sql', 'utf8'));
  sql
    .prepare('UPDATE notifier_state SET created_at = ?, document_name = NULL WHERE id = 1')
    .run('2026-01-01T00:00:00.000Z');
  const db = {
    prepare(statement) {
      return {
        values: [],
        bind(...values) {
          this.values = values;
          return this;
        },
        async first() {
          return sql.prepare(statement).get(...this.values) || null;
        },
        async run() {
          return { meta: { changes: Number(sql.prepare(statement).run(...this.values).changes) } };
        },
      };
    },
  };
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const env = {
    DB: db,
    GOOGLE_SERVICE_ACCOUNT: JSON.stringify({
      type: 'service_account',
      client_email: 'test@example.invalid',
      private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    }),
    TELEGRAM_BOT_TOKEN: 'TEST_SECRET_TOKEN',
    TELEGRAM_CHAT_ID: '100',
  };
  const documentName = (id) =>
    `projects/denis-komarov---aviation/databases/(default)/documents/flightRequests/${id}`;
  const documents = ['a', 'b'].map((id) => ({
    document: {
      name: documentName(id),
      fields: { createdAt: { timestampValue: '2026-02-01T12:00:00.123456Z' } },
    },
  }));
  let calls = [],
    telegramAttempts = 0,
    failTelegramAt = 2;
  const fakeFetch = async (url, options) => {
    calls.push({ url, options });
    if (url === 'https://oauth2.googleapis.com/token')
      return Response.json({ access_token: 'mock' });
    if (url.includes('firestore.googleapis.com')) return Response.json(documents);
    if (url.includes('api.telegram.org')) {
      telegramAttempts++;
      if (telegramAttempts === failTelegramAt) return new Response('', { status: 503 });
      return Response.json({ ok: true });
    }
    throw Error('Unexpected endpoint');
  };
  await assert.rejects(run(env, fakeFetch), /Telegram request failed \(503\)/);
  let cursor = sql.prepare('SELECT * FROM notifier_state WHERE id=1').get();
  assert.equal(cursor.document_name, documentName('a'));
  assert.equal(cursor.lock_until, 0);
  let query = JSON.parse(
    calls.find((call) => call.url.includes('firestore.googleapis.com')).options.body,
  ).structuredQuery;
  assert.equal(query.startAt.before, true);
  assert.deepEqual(query.select.fields, [{ fieldPath: 'createdAt' }]);
  assert.deepEqual(
    query.orderBy.map((order) => order.field.fieldPath),
    ['createdAt', '__name__'],
  );
  const message = JSON.parse(
    calls.find((call) => call.url.includes('api.telegram.org')).options.body,
  );
  assert.equal(message.chat_id, '100');
  assert(!message.text.includes('TEST_SECRET_TOKEN'));
  assert(!message.text.includes('flightRequests/a'));
  calls = [];
  telegramAttempts = 0;
  failTelegramAt = -1;
  const retryFetch = async (url, options) => {
    if (url.includes('firestore.googleapis.com')) {
      calls.push({ url, options });
      return Response.json([documents[1]]);
    }
    return fakeFetch(url, options);
  };
  await run(env, retryFetch);
  cursor = sql.prepare('SELECT * FROM notifier_state WHERE id=1').get();
  assert.equal(cursor.document_name, documentName('b'));
  query = JSON.parse(
    calls.find((call) => call.url.includes('firestore.googleapis.com')).options.body,
  ).structuredQuery;
  assert.equal(query.startAt.before, false);
  assert.equal(query.startAt.values[1].referenceValue, documentName('a'));
  sql
    .prepare('UPDATE notifier_state SET lock_id = ?, lock_until = ? WHERE id=1')
    .run('other', Date.now() + 60000);
  let blockedCalls = 0;
  await run(env, async () => {
    blockedCalls++;
    throw Error('unexpected');
  });
  assert.equal(blockedCalls, 0, 'Concurrent scheduled runs must not both send');
  sql.prepare('UPDATE notifier_state SET lock_until=0 WHERE id=1').run();
  const badFetch = async (url) => {
    if (url === 'https://oauth2.googleapis.com/token')
      return Response.json({ access_token: 'mock' });
    if (url.includes('firestore.googleapis.com')) return Response.json([documents[1]]);
    throw new Error(url);
  };
  await assert.rejects(
    run(env, badFetch),
    (error) =>
      error.message === 'Telegram connection failed' &&
      !error.message.includes('TEST_SECRET_TOKEN'),
  );
  assert.equal(
    sql.prepare('SELECT document_name FROM notifier_state WHERE id=1').get().document_name,
    documentName('b'),
  );
  console.log(
    'PASS: notification cursor, same-timestamp ordering, retries, lock and secret-safe errors',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

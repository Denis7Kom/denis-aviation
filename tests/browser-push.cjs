const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

async function main() {
  const { handleBrowserPush, runBrowserPush } = await import(
    '../telegram-notifier/browser-push.js'
  );
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync('telegram-notifier/browser-push.sql', 'utf8'));
  const started = '2026-11-19T08:00:00.000Z';
  sqlite.prepare('UPDATE browser_scan SET started_at = ?').run(started);
  const DB = {
    prepare(sql) {
      return this.wrap(sql, []);
    },
    wrap(sql, values) {
      const stmt = sqlite.prepare(sql);
      return {
        bind: (...args) => this.wrap(sql, args),
        first: async () => stmt.get(...values),
        all: async () => ({ results: stmt.all(...values) }),
        run: async () => ({ meta: stmt.run(...values) }),
      };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        for (const statement of statements) await statement.run();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  const env = { DB, FCM_VAPID_PUBLIC_KEY: 'v'.repeat(87), GOOGLE_SERVICE_ACCOUNT: 'unused' };
  const origin = 'https://denis7kom.github.io';
  const identities = {
    a: { localId: 'admin', emailVerified: true, email: 'deniska7best@gmail.com' },
    b: { localId: 'owner', emailVerified: true },
    c: { localId: 'unrelated', emailVerified: true },
  };
  const call = (id, token, Origin = origin) =>
    handleBrowserPush(
      new Request('https://worker.test/push/device', {
        method: 'POST',
        headers: { Origin, Authorization: `Bearer ${id.repeat(120)}` },
        body: JSON.stringify({ token, language: 'ru', uid: 'admin', admin: true }),
      }),
      env,
      async (_url, options) => {
        const { idToken } = JSON.parse(options.body);
        return Response.json({ users: [identities[idToken[0]]] });
      },
    );
  const device = (id) => id.repeat(60);
  assert.equal((await call('a', device('a'), 'https://other.test')).status, 403);
  for (const identity of ['a', 'b', 'c'])
    assert.equal((await call(identity, device(identity))).status, 200);
  assert.equal((await call('c', device('b'))).status, 409);
  const name =
    'projects/denis-komarov---aviation/databases/(default)/documents/flightRequests/test';
  const doc = {
    name,
    fields: {
      owner: { stringValue: 'owner' },
      status: { stringValue: 'new' },
      createdAt: { timestampValue: '2026-11-19T08:01:00.000Z' },
    },
  };
  const messages = [];
  const sent = [];
  let failAdmin = false;
  const fetcher = async (url, options) => {
    const body = JSON.parse(options.body);
    if (url.endsWith('/messages:send')) {
      if (failAdmin && body.message.token === device('a'))
        return new Response(null, { status: 503 });
      sent.push([body.message.data.kind, body.message.token[0]]);
      return Response.json({ name: 'sent' });
    }
    if (url.endsWith('/test:runQuery')) {
      const cursor = body.structuredQuery.startAt.values[1]?.referenceValue;
      const eligible = cursor
        ? messages.slice(messages.findIndex((m) => m.name === cursor) + 1)
        : messages;
      return Response.json(eligible.map((document) => ({ document })));
    }
    return Response.json([{ document: doc }]);
  };
  const run = () => runBrowserPush(env, async () => 'oauth', fetcher);
  await run();
  assert.deepEqual(sent.splice(0).sort(), [
    ['request', 'a'],
    ['request', 'b'],
  ]);
  doc.fields.status.stringValue = 'confirmed';
  for (const [index, authorUid] of ['admin', 'owner'].entries()) {
    messages.push({
      name: `${name}/messages/${index}`,
      fields: {
        createdAt: { timestampValue: '2026-11-19T08:02:00.000Z' },
        authorUid: { stringValue: authorUid },
      },
    });
  }
  await run();
  assert.deepEqual(sent.splice(0).sort(), [
    ['message', 'a'],
    ['message', 'b'],
    ['status', 'a'],
    ['status', 'b'],
  ]);
  await run();
  assert.deepEqual(sent, []);
  doc.fields.status.stringValue = 'completed';
  failAdmin = true;
  await assert.rejects(run(), /retained failed deliveries \(503\)/);
  assert.deepEqual(sent.splice(0), [['status', 'b']]);
  failAdmin = false;
  await run();
  assert.deepEqual(sent.splice(0), [['status', 'a']]);
  await run();
  assert.deepEqual(sent, []);
  console.log('PASS: browser push identity, private routing, status, reply, replay protection');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const assert = require('node:assert/strict');
function database(records, { fail = false } = {}) {
  const removed = [];
  function query(items) {
    let after,
      maximum = Infinity,
      cutoff;
    return {
      where(_key, _op, value) {
        cutoff = value.toMillis();
        return this;
      },
      orderBy() {
        return this;
      },
      limit(n) {
        maximum = n;
        return this;
      },
      startAfter(cursor) {
        after = cursor.id;
        return this;
      },
      async get() {
        const docs = items()
          .filter((x) => (!after || x.id > after) && (cutoff === undefined || x.created <= cutoff))
          .slice(0, maximum);
        return { docs, empty: !docs.length, size: docs.length };
      },
    };
  }
  const docs = records.map((r, index) => {
    const id = String(index).padStart(3, '0');
    const messages = Array.from({ length: r.messages || 0 }, (_, i) => ({
      id: String(i).padStart(3, '0'),
      ref: {
        path: `${id}/${i}`,
        delete() {
          messages.splice(
            messages.findIndex((x) => x.id === String(i).padStart(3, '0')),
            1,
          );
          removed.push(`message:${id}/${i}`);
        },
      },
    }));
    return {
      id,
      created: r.created,
      updateTime: 1,
      data: () => ({ createdAt: { toMillis: () => r.created } }),
      ref: {
        collection(name) {
          assert.equal(name, 'messages');
          return query(() => messages);
        },
        async delete() {
          assert.equal(messages.length, 0, 'Parent cannot be removed before messages');
          removed.push(`request:${id}`);
          docs.splice(
            docs.findIndex((x) => x.id === id),
            1,
          );
        },
      },
    };
  });
  return {
    removed,
    docs,
    collection(name) {
      assert.equal(name, 'flightRequests');
      return query(() => docs);
    },
    batch() {
      const pending = [];
      return {
        delete(ref) {
          pending.push(ref);
        },
        async commit() {
          if (fail) throw Error('network');
          pending.forEach((ref) => ref.delete());
        },
      };
    },
  };
}
(async () => {
  const { cleanExpiredRequests } = await import('../maintenance/cleanup-core.mjs');
  const cutoff = { toMillis: () => 100 };
  let db = database([
    { created: 99, messages: 3 },
    { created: 101, messages: 2 },
  ]);
  const dry = await cleanExpiredRequests(db, cutoff);
  assert.equal(dry.requests, 1);
  assert.equal(dry.messages, 3);
  assert.deepEqual(db.removed, []);
  const apply = await cleanExpiredRequests(db, cutoff, { apply: true });
  assert.equal(apply.requests, 1);
  assert.equal(db.docs.length, 1);
  assert.equal(db.removed.at(-1), 'request:000');
  db = database([{ created: 100, messages: 3 }]);
  const limited = await cleanExpiredRequests(db, cutoff, { apply: true, budget: 3 });
  assert.equal(limited.budgetReached, true);
  assert.equal(db.docs.length, 1);
  assert.equal(db.removed.length, 2);
  await cleanExpiredRequests(db, cutoff, { apply: true });
  assert.equal(db.docs.length, 0, 'Next run resumes unfinished deletion');
  db = database([{ created: 99, messages: 2 }], { fail: true });
  await assert.rejects(cleanExpiredRequests(db, cutoff, { apply: true }), /network/);
  assert.equal(db.docs.length, 1);
  assert.equal(db.removed.length, 0);
  console.log(
    'PASS: cleanup age boundary, dry-run, child-first deletion, budget, retries and failure preservation',
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

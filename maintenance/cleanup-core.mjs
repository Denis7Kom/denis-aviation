export const RETENTION_MS = 365 * 86400000;

// Only this application's expired requests and their messages can be removed.
export async function cleanExpiredRequests(db, cutoff, { apply = false, budget = 1000 } = {}) {
  const result = {
    mode: apply ? 'apply' : 'dry-run',
    requests: 0,
    messages: 0,
    budgetReached: false,
  };
  let used = 0;
  let cursor;
  while (true) {
    let query = db
      .collection('flightRequests')
      .where('createdAt', '<=', cutoff)
      .orderBy('createdAt')
      .limit(100);
    if (cursor) query = query.startAfter(cursor);
    const page = await query.get();
    if (page.empty) return result;
    for (const request of page.docs) {
      const created = request.data().createdAt?.toMillis?.();
      if (!Number.isFinite(created) || created > cutoff.toMillis())
        throw new Error('Unexpected request outside retention boundary');
      let messageCursor;
      while (true) {
        // Reserve one deletion for the parent; an unfinished parent remains for a later run.
        const available = budget - used - 1;
        if (available < 1) {
          result.budgetReached = true;
          return result;
        }
        let messages = request.ref
          .collection('messages')
          .orderBy('__name__')
          .limit(Math.min(200, available));
        if (messageCursor) messages = messages.startAfter(messageCursor);
        const chunk = await messages.get();
        if (chunk.empty) break;
        if (apply) {
          const batch = db.batch();
          for (const message of chunk.docs) batch.delete(message.ref);
          await batch.commit();
        }
        used += chunk.size;
        result.messages += chunk.size;
        messageCursor = chunk.docs.at(-1);
      }
      // Messages first: interrupted runs never leave inaccessible orphaned conversations.
      if (apply) await request.ref.delete({ lastUpdateTime: request.updateTime });
      used++;
      result.requests++;
      cursor = request;
    }
  }
}

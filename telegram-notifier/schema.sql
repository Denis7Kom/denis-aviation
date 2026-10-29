-- Run once before enabling the cron. Existing applications before this moment are not sent.
CREATE TABLE IF NOT EXISTS notifier_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  created_at TEXT NOT NULL,
  document_name TEXT,
  lock_id TEXT,
  lock_until INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO notifier_state (id, created_at)
VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

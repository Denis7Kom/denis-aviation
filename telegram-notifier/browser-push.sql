CREATE TABLE IF NOT EXISTS browser_devices (
  token TEXT PRIMARY KEY,
  uid TEXT NOT NULL,
  is_admin INTEGER NOT NULL,
  language TEXT NOT NULL,
  registered_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS browser_devices_uid ON browser_devices(uid);
CREATE INDEX IF NOT EXISTS browser_devices_admin ON browser_devices(is_admin);

CREATE TABLE IF NOT EXISTS browser_request_state (
  request_id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  message_time TEXT NOT NULL,
  message_name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS browser_scan (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  started_at TEXT NOT NULL,
  after_name TEXT NOT NULL DEFAULT '',
  lock_until INTEGER NOT NULL DEFAULT 0,
  lock_id TEXT
);
INSERT OR IGNORE INTO browser_scan (id, started_at)
VALUES (1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE IF NOT EXISTS browser_delivery (
  id INTEGER PRIMARY KEY,
  token TEXT NOT NULL,
  request_id TEXT NOT NULL,
  kind TEXT NOT NULL
);

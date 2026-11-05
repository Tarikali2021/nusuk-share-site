CREATE TABLE IF NOT EXISTS keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE COLLATE NOCASE,
  source TEXT NOT NULL DEFAULT 'community' CHECK(source IN ('fixed','seed','community')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_keys_created_at ON keys(created_at);
INSERT OR IGNORE INTO keys (code, source, created_at)
VALUES ('NG-Vbxwimum', 'fixed', '2000-01-01T00:00:00.000Z');
CREATE TABLE IF NOT EXISTS contribution_limits (
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_contribution_limits_ip_time ON contribution_limits(ip_hash, created_at);

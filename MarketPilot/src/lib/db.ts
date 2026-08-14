import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.MARKETPILOT_DATA_DIR || path.join(process.cwd(), '.data')
const DB_PATH = path.join(DATA_DIR, 'marketpilot.db')

let _db: Database.Database | null = null

export function db(): Database.Database {
  if (_db) return _db
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const instance = new Database(DB_PATH)
  instance.pragma('journal_mode = WAL')
  instance.pragma('foreign_keys = ON')
  migrate(instance)
  _db = instance
  return instance
}

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      role          TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      owner_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      industry   TEXT NOT NULL DEFAULT '',
      website    TEXT NOT NULL DEFAULT '',
      audience   TEXT NOT NULL DEFAULT '',
      is_client  INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id           TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role         TEXT NOT NULL,
      UNIQUE (workspace_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS chats (
      id           TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title        TEXT NOT NULL,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         TEXT PRIMARY KEY,
      chat_id    TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
      role       TEXT NOT NULL,
      content    TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS competitors (
      id           TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name         TEXT NOT NULL,
      url          TEXT NOT NULL,
      kind         TEXT NOT NULL,
      report       TEXT,
      status       TEXT NOT NULL,
      created_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id           TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module       TEXT NOT NULL,
      platform     TEXT NOT NULL,
      title        TEXT NOT NULL,
      payload      TEXT NOT NULL,
      created_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS metrics (
      id              TEXT PRIMARY KEY,
      workspace_id    TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      day             TEXT NOT NULL,
      users           INTEGER NOT NULL,
      sessions        INTEGER NOT NULL,
      retention       REAL NOT NULL,
      revenue         REAL NOT NULL,
      conversion_rate REAL NOT NULL,
      churn_rate      REAL NOT NULL,
      UNIQUE (workspace_id, day)
    );

    -- Module 10: Marketing Intelligence Engine.
    CREATE TABLE IF NOT EXISTS intel_reports (
      id           TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name         TEXT NOT NULL,
      url          TEXT NOT NULL,
      kind         TEXT NOT NULL,
      report       TEXT NOT NULL,
      marketing_score INTEGER NOT NULL,
      source       TEXT NOT NULL,
      created_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS intel_comparisons (
      id           TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title        TEXT NOT NULL,
      report_ids   TEXT NOT NULL,
      comparison   TEXT NOT NULL,
      source       TEXT NOT NULL,
      created_at   TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_intel_workspace ON intel_reports (workspace_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_intel_cmp_workspace ON intel_comparisons (workspace_id, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_chats_workspace ON chats (workspace_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages (chat_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_assets_workspace ON assets (workspace_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_metrics_workspace ON metrics (workspace_id, day);
  `)
}

export const id = () => randomUUID()
export const now = () => new Date().toISOString()

/**
 * Analytics integrations (GA4, Firebase, Meta, Google Ads) are not wired up in this
 * build, so a new workspace gets 90 days of plausible synthetic metrics. The shape
 * matches what a real connector would write, so swapping in live data is a
 * connector change rather than a schema change.
 */
export function seedMetrics(workspaceId: string) {
  const d = db()
  const existing = d
    .prepare('SELECT COUNT(*) AS n FROM metrics WHERE workspace_id = ?')
    .get(workspaceId) as { n: number }
  if (existing.n > 0) return

  const insert = d.prepare(
    `INSERT INTO metrics (id, workspace_id, day, users, sessions, retention, revenue, conversion_rate, churn_rate)
     VALUES (@id, @workspace_id, @day, @users, @sessions, @retention, @revenue, @conversion_rate, @churn_rate)`,
  )

  // Deterministic pseudo-random so a workspace's chart is stable across restarts.
  let seed = 0
  for (const ch of workspaceId) seed = (seed * 31 + ch.charCodeAt(0)) % 100000
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }

  const rows: Record<string, unknown>[] = []
  let users = 3400 + Math.floor(rand() * 1200)
  let retention = 0.46
  for (let i = 89; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000)
    const day = date.toISOString().slice(0, 10)
    const weekend = [0, 6].includes(date.getDay())
    users = Math.max(800, Math.round(users * (1 + (rand() - 0.44) * 0.06)))
    // A deliberate onboarding-driven retention dip in the last three weeks gives the
    // AI analytics explainer something real to find.
    retention = i < 21 ? Math.max(0.28, retention - 0.004 * rand()) : retention + (rand() - 0.5) * 0.01
    const sessions = Math.round(users * (weekend ? 1.5 : 2.3))
    const conversion = 0.021 + (rand() - 0.5) * 0.006
    rows.push({
      id: randomUUID(),
      workspace_id: workspaceId,
      day,
      users,
      sessions,
      retention: Number(retention.toFixed(4)),
      revenue: Number((users * conversion * 42).toFixed(2)),
      conversion_rate: Number(conversion.toFixed(4)),
      churn_rate: Number((0.052 + (rand() - 0.5) * 0.012).toFixed(4)),
    })
  }

  d.transaction(() => rows.forEach((r) => insert.run(r)))()
}

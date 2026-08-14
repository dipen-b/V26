import { db, id, now } from '@/lib/db'
import { HttpError } from '@/lib/auth'
import type { Comparison } from './compare'
import type { IntelligenceReport, TargetInput } from './types'

export type StoredReportRow = {
  id: string
  workspace_id: string
  user_id: string
  name: string
  url: string
  kind: TargetInput['kind']
  report: string
  marketing_score: number
  source: string
  created_at: string
}

export type StoredReport = Omit<StoredReportRow, 'report'> & { report: IntelligenceReport }

export type StoredComparisonRow = {
  id: string
  workspace_id: string
  title: string
  report_ids: string
  comparison: string
  source: string
  created_at: string
}

export type StoredComparison = Omit<StoredComparisonRow, 'comparison' | 'report_ids'> & {
  report_ids: string[]
  comparison: Comparison
}

export function saveReport(input: {
  workspaceId: string
  userId: string
  report: IntelligenceReport
  source: string
}): string {
  const reportId = id()
  db()
    .prepare(
      `INSERT INTO intel_reports
         (id, workspace_id, user_id, name, url, kind, report, marketing_score, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      reportId,
      input.workspaceId,
      input.userId,
      input.report.target.name,
      input.report.target.url,
      input.report.target.kind,
      JSON.stringify(input.report),
      input.report.scores.marketing,
      input.source,
      now(),
    )
  return reportId
}

/** Listing omits the report body — these payloads are large. */
export function listReports(workspaceId: string) {
  return db()
    .prepare(
      `SELECT id, name, url, kind, marketing_score, source, created_at
       FROM intel_reports WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 100`,
    )
    .all(workspaceId) as Omit<StoredReportRow, 'report' | 'workspace_id' | 'user_id'>[]
}

export function getReport(reportId: string): StoredReport {
  const row = db().prepare('SELECT * FROM intel_reports WHERE id = ?').get(reportId) as
    | StoredReportRow
    | undefined
  if (!row) throw new HttpError(404, 'Report not found.')
  return { ...row, report: JSON.parse(row.report) as IntelligenceReport }
}

export function deleteReport(reportId: string) {
  db().prepare('DELETE FROM intel_reports WHERE id = ?').run(reportId)
}

export function saveComparison(input: {
  workspaceId: string
  userId: string
  title: string
  reportIds: string[]
  comparison: Comparison
  source: string
}): string {
  const comparisonId = id()
  db()
    .prepare(
      `INSERT INTO intel_comparisons
         (id, workspace_id, user_id, title, report_ids, comparison, source, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      comparisonId,
      input.workspaceId,
      input.userId,
      input.title,
      JSON.stringify(input.reportIds),
      JSON.stringify(input.comparison),
      input.source,
      now(),
    )
  return comparisonId
}

export function listComparisons(workspaceId: string) {
  const rows = db()
    .prepare(
      `SELECT id, title, report_ids, source, created_at
       FROM intel_comparisons WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 50`,
    )
    .all(workspaceId) as { id: string; title: string; report_ids: string; source: string; created_at: string }[]
  return rows.map((row) => ({ ...row, report_ids: JSON.parse(row.report_ids) as string[] }))
}

export function getComparison(comparisonId: string): StoredComparison {
  const row = db().prepare('SELECT * FROM intel_comparisons WHERE id = ?').get(comparisonId) as
    | (StoredComparisonRow & { user_id: string })
    | undefined
  if (!row) throw new HttpError(404, 'Comparison not found.')
  return {
    ...row,
    report_ids: JSON.parse(row.report_ids) as string[],
    comparison: JSON.parse(row.comparison) as Comparison,
  }
}

export function deleteComparison(comparisonId: string) {
  db().prepare('DELETE FROM intel_comparisons WHERE id = ?').run(comparisonId)
}

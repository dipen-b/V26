import { HttpError, requireCapability, requireWorkspace } from '@/lib/auth'
import { handle } from '@/lib/api'
import { getComparison, getReport } from '@/lib/intelligence/store'
import { buildComparisonDoc, buildReportDoc, type Doc } from '@/lib/intelligence/export/doc'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const FORMATS = {
  pdf: { ext: 'pdf', mime: 'application/pdf' },
  pptx: {
    ext: 'pptx',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  xlsx: {
    ext: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
} as const

type Format = keyof typeof FORMATS

/** Safe for a Content-Disposition filename across browsers. */
function slugify(value: string): string {
  return (
    value
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 60) || 'marketpilot-report'
  )
}

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireCapability('intelligence')
    const url = new URL(req.url)

    const format = url.searchParams.get('format') as Format | null
    if (!format || !(format in FORMATS)) {
      throw new HttpError(400, 'format must be pdf, pptx, or xlsx.')
    }

    const id = url.searchParams.get('id')
    if (!id) throw new HttpError(400, 'id is required.')
    const type = url.searchParams.get('type') === 'comparison' ? 'comparison' : 'report'

    let doc: Doc
    let baseName: string

    if (type === 'comparison') {
      const stored = getComparison(id)
      requireWorkspace(user, stored.workspace_id)
      doc = buildComparisonDoc(stored.comparison, stored.title, stored.created_at)
      baseName = `ceo-growth-report-${slugify(stored.title)}`
    } else {
      const stored = getReport(id)
      requireWorkspace(user, stored.workspace_id)
      doc = buildReportDoc(stored.report)
      baseName = `marketing-intelligence-${slugify(stored.name)}`
    }

    // Imported lazily so a request for one format never loads the other two.
    const body =
      format === 'pdf'
        ? await (await import('@/lib/intelligence/export/pdf')).renderPdf(doc)
        : format === 'pptx'
          ? await (await import('@/lib/intelligence/export/pptx')).renderPptx(doc)
          : await (await import('@/lib/intelligence/export/xlsx')).renderXlsx(doc)

    return new Response(new Uint8Array(body), {
      headers: {
        'Content-Type': FORMATS[format].mime,
        'Content-Disposition': `attachment; filename="${baseName}.${FORMATS[format].ext}"`,
        'Content-Length': String(body.length),
        'Cache-Control': 'no-store',
      },
    })
  })
}

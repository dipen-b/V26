'use client'

import clsx from 'clsx'
import { Badge, BulletList, Card, CardHeader, ImpactBadge } from '@/components/ui'
import type { Comparison, MatrixStatus } from '@/lib/intelligence/compare'

const STATUS_STYLE: Record<MatrixStatus, { label: string; className: string }> = {
  strong: { label: 'Strong', className: 'bg-success-soft text-success border-success/40' },
  present: { label: 'Present', className: 'bg-elevated text-ink/80 border-line' },
  absent: { label: 'Absent', className: 'bg-error-soft text-error border-error/40' },
  unknown: { label: 'Unknown', className: 'bg-transparent text-faint border-line' },
}

export function ComparisonView({ comparison }: { comparison: Comparison }) {
  const competitors = comparison.positioning_matrix.map((row) => row.competitor)
  const ceo = comparison.ceo_report

  return (
    <div className="space-y-5">
      <Card className="border-primary-border bg-gradient-to-br from-primary-soft to-transparent p-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">CEO growth report</p>
        <p className="mt-2 text-lg font-semibold leading-7 tracking-tight text-ink">{ceo.headline}</p>
        <p className="mt-3 max-w-3xl text-[13px] leading-6 text-ink/85">{ceo.competitor_summary}</p>
      </Card>

      <Card>
        <CardHeader title="Market landscape" />
        <p className="p-5 text-[13px] leading-6 text-ink/85">{comparison.market_landscape}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Growth opportunities" items={ceo.growth_opportunities} />
        <ListCard title="User acquisition insights" items={ceo.user_acquisition_insights} />
        <ListCard title="Revenue insights" items={ceo.revenue_insights} />
        <ListCard title="Marketing recommendations" items={ceo.marketing_recommendations} />
      </div>

      <Card>
        <CardHeader title="Positioning matrix" subtitle="Who claims what, and how sharply." />
        <Table
          columns={['Competitor', 'Claim', 'Tone', 'Score', 'Summary']}
          rows={comparison.positioning_matrix.map((row) => [
            <span key="c" className="font-medium text-ink">
              {row.competitor}
            </span>,
            row.claim.replace(/_/g, ' '),
            row.tone,
            <span key="s" className="font-medium text-primary">
              {row.positioning_score}
            </span>,
            row.one_line_summary,
          ])}
        />
      </Card>

      <Card>
        <CardHeader title="Messaging matrix" subtitle="The exact words each competitor leads with." />
        <Table
          columns={['Competitor', 'Headline', 'Core promise', 'USP']}
          rows={comparison.messaging_matrix.map((row) => [
            <span key="c" className="font-medium text-ink">
              {row.competitor}
            </span>,
            row.main_headline,
            row.core_promise,
            row.unique_selling_proposition,
          ])}
        />
      </Card>

      <Card>
        <CardHeader
          title="Feature matrix"
          subtitle="Normalised across the set — an 'Absent' column is where the opening is."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12px]">
            <thead>
              <tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-faint">
                <th className="px-4 py-2.5 font-medium">Feature</th>
                {competitors.map((name) => (
                  <th key={name} className="px-4 py-2.5 font-medium">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {comparison.feature_matrix.map((row, i) => (
                <tr key={i} className="align-top">
                  <td className="px-4 py-2.5 font-medium text-ink">{row.feature}</td>
                  {competitors.map((name) => {
                    const cell = row.availability.find((entry) => entry.competitor === name)
                    const status: MatrixStatus = cell?.status ?? 'unknown'
                    const style = STATUS_STYLE[status]
                    return (
                      <td key={name} className="px-4 py-2.5">
                        <span
                          className={clsx(
                            'inline-block rounded border px-2 py-0.5 text-[11px] font-medium',
                            style.className,
                          )}
                          title={cell?.note}
                        >
                          {style.label}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Growth opportunity matrix"
          subtitle="Ranked openings, each naming the competitor weakest on it."
        />
        <div className="divide-y divide-line">
          {comparison.growth_opportunity_matrix.map((row, i) => (
            <div key={i} className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-ink">{row.opportunity}</span>
                <ImpactBadge level={row.impact} />
                <Badge>{row.effort} effort</Badge>
                <Badge tone="error">Weakest: {row.weakest_competitor}</Badge>
              </div>
              <p className="mt-1.5 text-[13px] leading-6 text-muted">{row.why_now}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader title={title} />
      <div className="p-5">
        <BulletList items={items} />
      </div>
    </Card>
  )
}

function Table({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-[12px]">
        <thead>
          <tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-faint">
            {columns.map((column) => (
              <th key={column} className="px-4 py-2.5 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={i} className="align-top text-ink/85">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 leading-5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

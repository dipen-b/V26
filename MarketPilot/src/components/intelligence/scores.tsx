'use client'

import clsx from 'clsx'
import type { Scores } from '@/lib/intelligence/types'

/**
 * Score bands use the app's status palette, and every meter carries its number
 * and a band word — colour is never the only thing distinguishing them.
 */
function band(value: number) {
  if (value >= 75) return { label: 'Strong', bar: 'bg-success', text: 'text-success' }
  if (value >= 50) return { label: 'Average', bar: 'bg-warning', text: 'text-warning' }
  return { label: 'Weak', bar: 'bg-error', text: 'text-error' }
}

export function ScoreMeter({
  label,
  value,
  hint,
}: {
  label: string
  value: number | null
  hint?: string
}) {
  if (value === null) {
    return (
      <div className="rounded-xl border border-line bg-card p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
        <p className="mt-1.5 text-lg font-semibold text-faint">n/a</p>
        <p className="mt-1 text-[11px] leading-4 text-faint">{hint ?? 'Not applicable to this target'}</p>
      </div>
    )
  }

  const tone = band(value)
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-ink">{value}</span>
        <span className="text-[11px] text-faint">/100</span>
        <span className={clsx('ml-auto text-[11px] font-medium', tone.text)}>{tone.label}</span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div className={clsx('h-full rounded-full transition-all', tone.bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function ScoreDashboard({ scores }: { scores: Scores }) {
  const tone = band(scores.marketing)

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line bg-gradient-to-br from-primary-soft to-transparent p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
              Overall marketing score
            </p>
            <div className="mt-1 flex items-baseline gap-2.5">
              <span className="text-4xl font-semibold tracking-tight text-ink">{scores.marketing}</span>
              <span className="text-sm text-faint">/100</span>
              <span className={clsx('text-sm font-medium', tone.text)}>{tone.label}</span>
            </div>
          </div>
          <p className="max-w-xs text-[12px] leading-5 text-muted">
            A weighted blend of the six section scores below. When ASO does not apply, its weight is
            shared across the rest rather than counted as zero.
          </p>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-canvas">
          <div
            className={clsx('h-full rounded-full transition-all', tone.bar)}
            style={{ width: `${scores.marketing}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ScoreMeter label="Positioning" value={scores.positioning} />
        <ScoreMeter label="ASO" value={scores.aso} hint="Not an app listing" />
        <ScoreMeter label="Acquisition" value={scores.acquisition} />
        <ScoreMeter label="Creative" value={scores.creative} />
        <ScoreMeter label="Monetization" value={scores.monetization} />
        <ScoreMeter label="Growth opportunity" value={scores.growth_opportunity} />
      </div>
    </div>
  )
}

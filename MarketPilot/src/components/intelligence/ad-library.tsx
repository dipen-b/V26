'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Badge, Card, CardHeader, Select } from '@/components/ui'
import { CopyButton } from '@/components/copy'
import type { AdLibraryEntry } from '@/lib/intelligence/types'

const FILTERS = [
  { key: 'platform', label: 'Platform' },
  { key: 'industry', label: 'Industry' },
  { key: 'category', label: 'Category' },
  { key: 'audience', label: 'Audience' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

export function AdLibrary({ entries }: { entries: AdLibraryEntry[] }) {
  const [active, setActive] = useState<Record<FilterKey, string>>({
    platform: '',
    industry: '',
    category: '',
    audience: '',
  })

  const options = useMemo(() => {
    const build = (key: FilterKey) =>
      [...new Set(entries.map((entry) => entry[key]).filter(Boolean))].sort()
    return {
      platform: build('platform'),
      industry: build('industry'),
      category: build('category'),
      audience: build('audience'),
    }
  }, [entries])

  const filtered = useMemo(
    () =>
      entries.filter((entry) =>
        FILTERS.every(({ key }) => !active[key] || entry[key] === active[key]),
      ),
    [entries, active],
  )

  const hasFilters = FILTERS.some(({ key }) => active[key])

  return (
    <Card>
      <CardHeader
        title="Competitor ad library"
        subtitle="Every hook, headline, and angle the analysis surfaced, filterable the way a creative brief needs it."
        action={<span className="text-[11px] text-faint">{filtered.length} of {entries.length}</span>}
      />

      <div className="flex flex-wrap items-end gap-3 border-b border-line p-5">
        {FILTERS.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-faint">
              {label}
            </span>
            <Select
              value={active[key]}
              onChange={(e) => setActive((prev) => ({ ...prev, [key]: e.target.value }))}
              className="w-[150px]"
            >
              <option value="">All</option>
              {options[key].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
        ))}
        {hasFilters && (
          <button
            onClick={() => setActive({ platform: '', industry: '', category: '', audience: '' })}
            className="h-10 rounded-lg px-3 text-[12px] font-medium text-muted transition hover:bg-elevated hover:text-ink"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-10 text-center text-[13px] text-faint">
          No ads match these filters.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {filtered.map((entry, index) => (
            <div key={index} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary">{entry.platform}</Badge>
                <Badge>{entry.category}</Badge>
                <span className="text-[11px] text-faint">{entry.audience}</span>
                <span className="ml-auto">
                  <CopyButton
                    text={`${entry.hook}\n\n${entry.headline}\n\nCTAs: ${entry.cta_variations.join(' / ')}`}
                  />
                </span>
              </div>

              <p className="mt-2.5 text-[15px] font-semibold leading-6 text-ink">{entry.hook}</p>
              <p className="mt-1 text-[13px] leading-6 text-ink/85">{entry.headline}</p>

              <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <Field label="Emotional angle" value={entry.emotional_angle} />
                <Field label="Creative theme" value={entry.creative_theme} />
                <Field label="Video concept" value={entry.video_concept} />
                <Field label="Industry" value={entry.industry} />
              </dl>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.cta_variations.map((cta, i) => (
                  <span
                    key={i}
                    className={clsx(
                      'rounded border border-primary-border bg-primary-soft px-2 py-0.5',
                      'text-[11px] font-medium text-primary',
                    )}
                  >
                    {cta}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 text-[12px] leading-5 text-muted">{value}</dd>
    </div>
  )
}

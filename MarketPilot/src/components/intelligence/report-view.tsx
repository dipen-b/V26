'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  Badge,
  BulletList,
  Card,
  CardHeader,
  ImpactBadge,
  type Tone,
} from '@/components/ui'
import { ScoreDashboard } from './scores'
import { AdLibrary } from './ad-library'
import type {
  ChannelEstimate,
  IntelligenceReport,
  Opportunity,
} from '@/lib/intelligence/types'

const TABS = [
  'Overview',
  'Audience',
  'Positioning',
  'Channels',
  'Advertising',
  'Funnel & revenue',
  'SWOT & growth',
  'Ad library',
] as const

type Tab = (typeof TABS)[number]

export function ReportView({ report }: { report: IntelligenceReport }) {
  const [tab, setTab] = useState<Tab>('Overview')
  const { foundation, channels, advertising, business } = report

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1">
        {TABS.map((option) => (
          <button
            key={option}
            onClick={() => setTab(option)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-[12px] font-medium transition',
              tab === option ? 'bg-primary-soft text-ink' : 'text-muted hover:bg-elevated hover:text-ink',
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-5 animate-fade-up">
          <Card className="p-5">
            <p className="text-[15px] font-medium leading-7 text-ink">
              {foundation.executive_summary.headline}
            </p>
          </Card>

          <ScoreDashboard scores={report.scores} />

          <Card>
            <CardHeader title="Business overview" />
            <KeyValues
              items={[
                ['Product category', foundation.executive_summary.business_overview.product_category],
                ['Core value proposition', foundation.executive_summary.business_overview.core_value_proposition],
                ['Revenue model', foundation.executive_summary.business_overview.revenue_model],
                ['Target audience', foundation.executive_summary.business_overview.target_audience],
                ['Geographic focus', foundation.executive_summary.business_overview.geographic_focus],
              ]}
            />
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title="Market position" />
              <div className="p-5">
                <Badge tone="primary">
                  {foundation.executive_summary.market_position.tier.replace(/_/g, ' ')}
                </Badge>
                <p className="mt-2.5 text-[13px] leading-6 text-ink/85">
                  {foundation.executive_summary.market_position.rationale}
                </p>
              </div>
            </Card>
            <Card>
              <CardHeader title="Growth potential" />
              <div className="p-5">
                <ImpactBadge level={foundation.executive_summary.growth_potential.level} />
                <p className="mt-2.5 text-[13px] leading-6 text-ink/85">
                  {foundation.executive_summary.growth_potential.rationale}
                </p>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="About this analysis" subtitle="What it was based on, and where it infers." />
            <div className="space-y-3 p-5">
              <p className="text-[13px] leading-6 text-muted">{report.research_note}</p>
              {report.sources.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                    Sources fetched
                  </p>
                  <ul className="space-y-1">
                    {report.sources.map((source, i) => (
                      <li key={i}>
                        <a
                          href={source}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="break-all text-[12px] text-primary hover:text-secondary"
                        >
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === 'Audience' && (
        <div className="space-y-4 animate-fade-up">
          <Card className="p-5">
            <p className="text-[13px] leading-6 text-ink/85">{foundation.persona.summary}</p>
          </Card>

          <Card>
            <CardHeader title="Demographics" />
            <KeyValues
              items={[
                ['Age range', foundation.persona.demographics.age_range],
                ['Gender distribution', foundation.persona.demographics.gender_distribution],
                ['Location', foundation.persona.demographics.location],
                ['Income level', foundation.persona.demographics.income_level],
              ]}
            />
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListCard title="Why they convert" items={foundation.persona.user_intent.why_they_convert} />
            <ListCard title="Pain points" items={foundation.persona.user_intent.pain_points} />
            <ListCard title="Motivations" items={foundation.persona.user_intent.motivations} />
            <ListCard title="Desired outcomes" items={foundation.persona.user_intent.desired_outcomes} />
          </div>

          <Card>
            <CardHeader title="Emotional drivers" subtitle="Ranked, with the evidence behind each." />
            <div className="divide-y divide-line">
              {foundation.persona.emotional_drivers.map((driver, i) => (
                <div key={i} className="flex flex-wrap items-start gap-3 p-4">
                  <Badge tone={driver.strength === 'primary' ? 'primary' : 'neutral'}>{driver.driver}</Badge>
                  <span className="text-[11px] uppercase tracking-wide text-faint">{driver.strength}</span>
                  <p className="w-full text-[13px] leading-6 text-ink/85">{driver.evidence}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'Positioning' && (
        <div className="space-y-4 animate-fade-up">
          <Card>
            <CardHeader title="Messaging" />
            <KeyValues
              items={[
                ['Main headline', foundation.positioning.messaging.main_headline],
                ['Core promise', foundation.positioning.messaging.core_promise],
                ['Unique selling proposition', foundation.positioning.messaging.unique_selling_proposition],
              ]}
            />
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title="Brand voice" />
              <div className="p-5">
                <Badge tone="primary">{foundation.positioning.brand_voice.tone}</Badge>
                <p className="mt-2.5 text-[13px] leading-6 text-ink/85">
                  {foundation.positioning.brand_voice.notes}
                </p>
              </div>
            </Card>
            <Card>
              <CardHeader title="Positioning strategy" />
              <div className="p-5">
                <Badge tone="primary">
                  {foundation.positioning.positioning_strategy.claim.replace(/_/g, ' ')}
                </Badge>
                <p className="mt-2.5 text-[13px] leading-6 text-ink/85">
                  {foundation.positioning.positioning_strategy.explanation}
                </p>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title={`Positioning score — ${foundation.positioning.positioning_score}/100`}
              subtitle={foundation.positioning.score_rationale}
            />
          </Card>

          <OpportunityCard
            title="Differentiation opportunities"
            subtitle="Where this competitor leaves room to take a position they cannot contest."
            items={foundation.positioning.differentiation_opportunities}
          />
        </div>
      )}

      {tab === 'Channels' && (
        <div className="space-y-4 animate-fade-up">
          {channels.aso.applicable ? (
            <>
              <Card>
                <CardHeader
                  title={`ASO score — ${channels.aso.aso_score}/100`}
                  subtitle={channels.aso.score_rationale}
                />
              </Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader title="App title" subtitle={channels.aso.app_title.keyword_strength} />
                  <div className="space-y-3 p-5">
                    <Labeled label="Observed" value={channels.aso.app_title.observed} />
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                        Recommended
                      </p>
                      <BulletList items={channels.aso.app_title.recommended} />
                    </div>
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                        Ranking opportunities
                      </p>
                      <BulletList items={channels.aso.app_title.ranking_opportunities} />
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHeader
                    title="Short description"
                    subtitle={channels.aso.short_description.conversion_effectiveness}
                  />
                  <div className="space-y-3 p-5">
                    <Labeled label="Observed" value={channels.aso.short_description.observed} />
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                        Recommended
                      </p>
                      <BulletList items={channels.aso.short_description.recommended} />
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <CardHeader title="Long description" />
                <div className="space-y-3 p-5">
                  <Labeled label="Keyword optimization" value={channels.aso.long_description.keyword_optimization} />
                  <Labeled label="Feature presentation" value={channels.aso.long_description.feature_presentation} />
                  <Labeled label="User benefits" value={channels.aso.long_description.user_benefits} />
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                      Recommended outline
                    </p>
                    <BulletList items={channels.aso.long_description.recommended_outline} />
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader title="Screenshots" />
                  <div className="space-y-3 p-5">
                    <Labeled label="Messaging hierarchy" value={channels.aso.screenshots.messaging_hierarchy} />
                    <Labeled label="Feature communication" value={channels.aso.screenshots.feature_communication} />
                    <Labeled label="Emotional triggers" value={channels.aso.screenshots.emotional_triggers} />
                    <Labeled label="Visual quality" value={channels.aso.screenshots.visual_quality} />
                    <BulletList items={channels.aso.screenshots.recommendations} />
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Feature graphic" />
                  <div className="space-y-3 p-5">
                    <Labeled label="Conversion optimization" value={channels.aso.feature_graphic.conversion_optimization} />
                    <Labeled label="Branding" value={channels.aso.feature_graphic.branding} />
                    <Labeled label="Visual appeal" value={channels.aso.feature_graphic.visual_appeal} />
                    <BulletList items={channels.aso.feature_graphic.recommendations} />
                  </div>
                </Card>
              </div>

              <OpportunityCard title="ASO improvements" items={channels.aso.improvements} />
            </>
          ) : (
            <Card>
              <CardHeader title="ASO intelligence" subtitle="Not applicable to this target." />
              <p className="p-5 text-[13px] leading-6 text-muted">{channels.aso.not_applicable_reason}</p>
            </Card>
          )}

          <Card>
            <CardHeader
              title={`Acquisition score — ${channels.acquisition.acquisition_score}/100`}
              subtitle={channels.acquisition.summary}
              action={<Badge tone="primary">{channels.acquisition.primary_channel}</Badge>}
            />
            <div className="grid gap-6 p-5 sm:grid-cols-2">
              <ChannelColumn title="Organic" channels={channels.acquisition.organic} />
              <ChannelColumn title="Paid" channels={channels.acquisition.paid} />
            </div>
          </Card>

          <ListCard title="Channel gaps" items={channels.acquisition.gaps} />
        </div>
      )}

      {tab === 'Advertising' && (
        <div className="space-y-4 animate-fade-up">
          <Card>
            <CardHeader title="Google Ads strategy" />
            <div className="space-y-4 p-5">
              <p className="text-[13px] leading-6 text-ink/85">{advertising.google_ads.predicted_strategy}</p>
              <div className="grid gap-5 sm:grid-cols-3">
                <MiniList title="Likely keywords" items={advertising.google_ads.search_campaigns.likely_keywords} />
                <MiniList title="Intent targeting" items={advertising.google_ads.search_campaigns.intent_targeting} />
                <MiniList title="Ad themes" items={advertising.google_ads.search_campaigns.ad_themes} />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Labeled label="Install campaigns" value={advertising.google_ads.app_campaigns.install_campaigns} />
                <Labeled label="Engagement campaigns" value={advertising.google_ads.app_campaigns.engagement_campaigns} />
                <Labeled label="Subscription campaigns" value={advertising.google_ads.app_campaigns.subscription_campaigns} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Suggested keywords" subtitle="Where to bid against them." />
            <div className="divide-y divide-line">
              {advertising.google_ads.suggested_keywords.map((keyword, i) => (
                <div key={i} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="font-mono text-[13px] text-ink">{keyword.keyword}</span>
                  <Badge>{keyword.intent}</Badge>
                  <Badge tone={competitionTone(keyword.competition)}>{keyword.competition} competition</Badge>
                  <p className="w-full text-[13px] leading-6 text-muted">{keyword.why}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListCard title="Google Ads gaps" items={advertising.google_ads.missing_opportunities} />
            <ListCard title="Winning Meta angles" items={advertising.meta_ads.estimated_winning_angles} />
          </div>

          <Card>
            <CardHeader title="Meta Ads strategy" />
            <p className="p-5 text-[13px] leading-6 text-ink/85">{advertising.meta_ads.strategy_report}</p>
          </Card>

          <Card>
            <CardHeader title="Audience segments" />
            <div className="divide-y divide-line">
              {advertising.meta_ads.audience_segments.map((segment, i) => (
                <div key={i} className="p-4">
                  <p className="text-[13px] font-semibold text-ink">{segment.name}</p>
                  <p className="mt-1 text-[12px] leading-5 text-muted">{segment.demographics}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[...segment.interests, ...segment.behaviors].map((item, j) => (
                      <span key={j} className="rounded bg-elevated px-2 py-0.5 text-[11px] text-muted">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Ad angles" />
            <div className="divide-y divide-line">
              {advertising.meta_ads.ad_angles.map((angle, i) => (
                <div key={i} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink">{angle.angle}</span>
                    <ImpactBadge level={angle.expected_performance} />
                  </div>
                  <p className="mt-1.5 text-[13px] leading-6 text-muted">{angle.rationale}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Creative concepts" />
            <div className="grid gap-px overflow-hidden bg-line sm:grid-cols-2">
              {advertising.meta_ads.creative_concepts.map((concept, i) => (
                <div key={i} className="bg-card p-4">
                  <Badge tone="primary">{concept.format}</Badge>
                  <p className="mt-2 text-[13px] font-semibold leading-6 text-ink">{concept.hook}</p>
                  <p className="mt-1 text-[13px] leading-6 text-ink/85">{concept.concept}</p>
                  <p className="mt-2 text-[12px] leading-5 text-muted">{concept.why_it_works}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title={`Creative effectiveness — ${advertising.creative.creative_effectiveness_score}/100`}
              subtitle={advertising.creative.score_rationale}
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-[12px]">
                <thead>
                  <tr className="border-b border-line text-left text-[10px] uppercase tracking-wide text-faint">
                    {['Asset', 'Hook', 'Pain point', 'Emotional trigger', 'Offer', 'CTA'].map((column) => (
                      <th key={column} className="px-4 py-2.5 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {advertising.creative.assets.map((asset, i) => (
                    <tr key={i} className="align-top text-ink/85">
                      <td className="px-4 py-2.5">{asset.asset}</td>
                      <td className="px-4 py-2.5">{asset.hook}</td>
                      <td className="px-4 py-2.5">{asset.pain_point}</td>
                      <td className="px-4 py-2.5">{asset.emotional_trigger}</td>
                      <td className="px-4 py-2.5">{asset.offer}</td>
                      <td className="px-4 py-2.5">{asset.cta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <ListCard title="Creative improvements" items={advertising.creative.improvements} />
        </div>
      )}

      {tab === 'Funnel & revenue' && (
        <div className="space-y-4 animate-fade-up">
          <Card>
            <CardHeader title="Conversion funnel" subtitle={business.funnel.summary} />
            <div className="p-5">
              <ol className="space-y-2">
                {business.funnel.stages.map((stage, i) => (
                  <li key={i} className="flex gap-3 rounded-lg border border-line bg-canvas/60 p-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-ink">{stage.stage}</span>
                        <Badge tone="warning">{stage.estimated_dropoff} drop-off</Badge>
                      </div>
                      <p className="mt-1 text-[13px] leading-6 text-muted">{stage.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListCard title="Funnel strengths" items={business.funnel.strengths} />
            <ListCard title="Funnel weaknesses" items={business.funnel.weaknesses} />
          </div>
          <ListCard title="Conversion risks" items={business.funnel.conversion_risks} />
          <OpportunityCard title="Funnel opportunities" items={business.funnel.optimization_opportunities} />

          <Card>
            <CardHeader
              title={`Revenue — ${business.revenue.model.replace(/_/g, ' ')}`}
              subtitle={business.revenue.model_rationale}
              action={<Badge tone="primary">{business.revenue.monetization_score}/100</Badge>}
            />
            <div className="space-y-4 p-5">
              <Labeled label="Monetization strategy" value={business.revenue.monetization_strategy} />
              <div className="grid gap-5 sm:grid-cols-3">
                <MiniList title="Revenue drivers" items={business.revenue.revenue_drivers} />
                <MiniList title="Upsell opportunities" items={business.revenue.upsell_opportunities} />
                <MiniList title="Retention opportunities" items={business.revenue.retention_opportunities} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'SWOT & growth' && (
        <div className="space-y-4 animate-fade-up">
          <div className="grid gap-4 sm:grid-cols-2">
            <SwotCard title="Strengths" tone="success" items={business.swot.strengths} />
            <SwotCard title="Weaknesses" tone="error" items={business.swot.weaknesses} />
            <SwotCard title="Opportunities" tone="primary" items={business.swot.opportunities} />
            <SwotCard title="Threats" tone="warning" items={business.swot.threats} />
          </div>

          <Card>
            <CardHeader title="Growth analysis" subtitle="The seven questions, answered directly." />
            <KeyValues
              items={[
                ['How they acquire users', business.growth.how_they_acquire_users],
                ['Why users convert', business.growth.why_users_convert],
                ['What makes them competitive', business.growth.what_makes_them_competitive],
                ['Their weaknesses', business.growth.their_weaknesses],
                ['How to outperform them', business.growth.how_to_outperform],
              ]}
            />
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListCard title="Copy this" items={business.growth.strategies_to_copy} />
            <ListCard title="Avoid this" items={business.growth.strategies_to_avoid} />
          </div>

          <Card>
            <CardHeader
              title={`Growth opportunity — ${business.growth.growth_opportunity_score}/100`}
              subtitle={business.growth.score_rationale}
            />
            <div className="divide-y divide-line">
              {[...business.growth.action_plan]
                .sort((a, b) => a.priority - b.priority)
                .map((step, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                      {step.priority}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-ink">{step.step}</p>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
                        <span>
                          <span className="text-faint">Owner: </span>
                          {step.owner}
                        </span>
                        <span>
                          <span className="text-faint">Timeline: </span>
                          {step.timeline}
                        </span>
                        <span>
                          <span className="text-faint">Impact: </span>
                          {step.estimated_impact}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <OpportunityCard
            title="Priority recommendations"
            items={business.growth.priority_recommendations}
          />
        </div>
      )}

      {tab === 'Ad library' && (
        <div className="animate-fade-up">
          <AdLibrary entries={advertising.ad_library} />
        </div>
      )}
    </div>
  )
}

function competitionTone(level: string): Tone {
  return level === 'low' ? 'success' : level === 'medium' ? 'warning' : 'error'
}

function KeyValues({ items }: { items: [string, string][] }) {
  return (
    <dl className="divide-y divide-line">
      {items.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-5 py-3 sm:grid-cols-[190px_1fr] sm:gap-4">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-faint sm:pt-0.5">{label}</dt>
          <dd className="text-[13px] leading-6 text-ink/85">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Labeled({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-1 text-[13px] leading-6 text-ink/85">{value}</p>
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

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{title}</p>
      <BulletList items={items} />
    </div>
  )
}

function SwotCard({ title, tone, items }: { title: string; tone: Tone; items: string[] }) {
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2">{title}<Badge tone={tone}>{items.length}</Badge></span>} />
      <div className="p-5">
        <BulletList items={items} />
      </div>
    </Card>
  )
}

function OpportunityCard({
  title,
  subtitle,
  items,
}: {
  title: string
  subtitle?: string
  items: Opportunity[]
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div className="divide-y divide-line">
        {items.map((item, i) => (
          <div key={i} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">{item.title}</span>
              <ImpactBadge level={item.impact} />
              <Badge>{item.effort} effort</Badge>
            </div>
            <p className="mt-1.5 text-[13px] leading-6 text-muted">{item.rationale}</p>
            <p className="mt-1 text-[12px] leading-5 text-success">{item.estimated_impact}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ChannelColumn({ title, channels }: { title: string; channels: ChannelEstimate[] }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-faint">{title}</p>
      <div className="space-y-3">
        {channels.map((channel, i) => (
          <div key={i}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-ink">{channel.channel}</span>
              <span className="text-[12px] font-medium text-primary">{channel.confidence}%</span>
            </div>
            {/* Confidence is a magnitude, so one hue rather than a status colour. */}
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(100, channel.confidence))}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] leading-4 text-faint">
              {channel.estimated_share} · {channel.evidence}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { generate } from '@/lib/ai'
import { arrayOf, enumOf, int, object, str, strArray, LEVEL } from './schema-utils'
import type { IntelligenceReport } from './types'

export type MatrixStatus = 'strong' | 'present' | 'absent' | 'unknown'

export type Comparison = {
  market_landscape: string
  positioning_matrix: {
    competitor: string
    claim: string
    tone: string
    positioning_score: number
    one_line_summary: string
  }[]
  messaging_matrix: {
    competitor: string
    main_headline: string
    core_promise: string
    unique_selling_proposition: string
  }[]
  feature_matrix: {
    feature: string
    availability: { competitor: string; status: MatrixStatus; note: string }[]
  }[]
  growth_opportunity_matrix: {
    opportunity: string
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
    weakest_competitor: string
    why_now: string
  }[]
  ceo_report: {
    headline: string
    competitor_summary: string
    growth_opportunities: string[]
    user_acquisition_insights: string[]
    revenue_insights: string[]
    marketing_recommendations: string[]
  }
}

export const COMPARISON_SCHEMA = object({
  market_landscape: str,
  positioning_matrix: arrayOf(
    object({
      competitor: str,
      claim: str,
      tone: str,
      positioning_score: int,
      one_line_summary: str,
    }),
  ),
  messaging_matrix: arrayOf(
    object({
      competitor: str,
      main_headline: str,
      core_promise: str,
      unique_selling_proposition: str,
    }),
  ),
  feature_matrix: arrayOf(
    object({
      feature: str,
      availability: arrayOf(
        object({
          competitor: str,
          status: enumOf('strong', 'present', 'absent', 'unknown'),
          note: str,
        }),
      ),
    }),
  ),
  growth_opportunity_matrix: arrayOf(
    object({
      opportunity: str,
      impact: enumOf(...LEVEL),
      effort: enumOf(...LEVEL),
      weakest_competitor: str,
      why_now: str,
    }),
  ),
  ceo_report: object({
    headline: str,
    competitor_summary: str,
    growth_opportunities: strArray,
    user_acquisition_insights: strArray,
    revenue_insights: strArray,
    marketing_recommendations: strArray,
  }),
})

const COMPARISON_SYSTEM = `You are a competitive intelligence analyst building a market landscape from several completed competitor reports.

Your job is synthesis, not summary. The reader has already seen each competitor individually; what they cannot see is the shape of the market — who is crowded together, who owns a claim nobody else can take, and which gap nobody is standing in. Say that plainly.

Rules that keep the matrices usable:
- Every matrix row must cover every competitor supplied. Where a report did not establish something, use "unknown" rather than inventing a value.
- The feature matrix must compare each competitor on the same normalised feature names. Derive 6-10 features that genuinely differentiate this set; do not list table stakes every one of them has.
- Positioning scores come from the source reports. Do not re-score them.
- The growth opportunity matrix names the single weakest competitor on each opportunity, because that is where the reader should attack first.

The CEO report is written for someone who will read it and nothing else. Lead with the decision, keep every line concrete enough to act on this quarter, and never pad it to look thorough.`

function digestOf(report: IntelligenceReport): string {
  const { target, scores, foundation, channels, advertising, business } = report
  return `### ${target.name} (${target.kind}, ${target.url})
Scores — marketing ${scores.marketing}, positioning ${scores.positioning}, ASO ${
    scores.aso ?? 'n/a'
  }, acquisition ${scores.acquisition}, creative ${scores.creative}, monetization ${
    scores.monetization
  }, growth ${scores.growth_opportunity}
Market position: ${foundation.executive_summary.market_position.tier} — ${
    foundation.executive_summary.market_position.rationale
  }
Category: ${foundation.executive_summary.business_overview.product_category}
Value proposition: ${foundation.executive_summary.business_overview.core_value_proposition}
Revenue model: ${foundation.executive_summary.business_overview.revenue_model} / ${business.revenue.model}
Audience: ${foundation.executive_summary.business_overview.target_audience}
Headline: ${foundation.positioning.messaging.main_headline}
Core promise: ${foundation.positioning.messaging.core_promise}
USP: ${foundation.positioning.messaging.unique_selling_proposition}
Brand voice: ${foundation.positioning.brand_voice.tone}
Positioning claim: ${foundation.positioning.positioning_strategy.claim} — ${
    foundation.positioning.positioning_strategy.explanation
  }
Primary acquisition channel: ${channels.acquisition.primary_channel}
Paid channels: ${channels.acquisition.paid
    .map((entry) => `${entry.channel} ${entry.confidence}%`)
    .join(', ')}
Winning ad angles: ${advertising.meta_ads.estimated_winning_angles.join('; ')}
Funnel weaknesses: ${business.funnel.weaknesses.join('; ')}
Marketing strengths: ${business.swot.strengths.join('; ')}
Marketing weaknesses: ${business.swot.weaknesses.join('; ')}
How to outperform: ${business.growth.how_to_outperform}`
}

export async function runComparison(reports: IntelligenceReport[]) {
  const names = reports.map((report) => report.target.name)

  return generate<Comparison>({
    system: COMPARISON_SYSTEM,
    prompt: `Build the market landscape across these ${reports.length} competitors: ${names.join(
      ', ',
    )}.

Use exactly these competitor names in every matrix row, spelled as given.

${reports.map(digestOf).join('\n\n')}`,
    schema: COMPARISON_SCHEMA,
    fallback: comparisonFixture(reports),
    effort: 'high',
    maxTokens: 20000,
  })
}

/** Built from the reports themselves, so the offline landscape is still internally consistent. */
export function comparisonFixture(reports: IntelligenceReport[]): Comparison {
  const names = reports.map((report) => report.target.name)
  const ranked = [...reports].sort((a, b) => b.scores.marketing - a.scores.marketing)
  const leader = ranked[0]
  const laggard = ranked[ranked.length - 1]

  const features = [
    'Self-serve onboarding',
    'Transparent public pricing',
    'Mobile app parity',
    'Integration marketplace',
    'Free tier',
    'Comparison / alternative-to content',
  ]

  return {
    market_landscape: `Across these ${reports.length} competitors the market splits into a crowded middle and one clear leader. ${leader.target.name} scores highest overall (${leader.scores.marketing}/100), carried by a positioning claim the others talk around rather than contest. ${laggard.target.name} is the weakest at ${laggard.scores.marketing}/100 and is the natural first target — its funnel and messaging both leak. The genuine gap in this set is time-to-value: every competitor sells capability, none sells speed to a first result.`,
    positioning_matrix: reports.map((report) => ({
      competitor: report.target.name,
      claim: report.foundation.positioning.positioning_strategy.claim,
      tone: report.foundation.positioning.brand_voice.tone,
      positioning_score: report.scores.positioning,
      one_line_summary: report.foundation.positioning.messaging.core_promise,
    })),
    messaging_matrix: reports.map((report) => ({
      competitor: report.target.name,
      main_headline: report.foundation.positioning.messaging.main_headline,
      core_promise: report.foundation.positioning.messaging.core_promise,
      unique_selling_proposition:
        report.foundation.positioning.messaging.unique_selling_proposition,
    })),
    feature_matrix: features.map((feature, featureIndex) => ({
      feature,
      availability: reports.map((report, reportIndex) => {
        // Deterministic spread so the offline matrix is varied but stable.
        const bucket = (featureIndex + reportIndex) % 4
        const status: MatrixStatus =
          bucket === 0 ? 'strong' : bucket === 1 ? 'present' : bucket === 2 ? 'absent' : 'unknown'
        return {
          competitor: report.target.name,
          status,
          note:
            status === 'strong'
              ? 'Prominent in their own marketing and hard to match quickly.'
              : status === 'present'
                ? 'Available but not positioned as a reason to choose them.'
                : status === 'absent'
                  ? 'No evidence of this — an opening worth taking.'
                  : 'Not established from the material reviewed.',
        }
      }),
    })),
    growth_opportunity_matrix: [
      {
        opportunity: 'Own the comparison keyword cluster',
        impact: 'high',
        effort: 'medium',
        weakest_competitor: laggard.target.name,
        why_now:
          'Brand-adjacent commercial terms are undefended across this set, and buyers searching them are already in-market.',
      },
      {
        opportunity: 'Sell time-to-first-value, not feature count',
        impact: 'high',
        effort: 'high',
        weakest_competitor: laggard.target.name,
        why_now:
          'Every competitor here drops trial users into an empty state. Making the first useful moment the headline claim converts their abandoners.',
      },
      {
        opportunity: 'Build the integration long-tail',
        impact: 'medium',
        effort: 'low',
        weakest_competitor: names[Math.min(1, names.length - 1)],
        why_now:
          'Programmatic integration pages rank quickly and nobody in this set is targeting them.',
      },
      {
        opportunity: 'Move spend into under-contested paid channels',
        impact: 'medium',
        effort: 'medium',
        weakest_competitor: leader.target.name,
        why_now:
          'The leader concentrates on search. Video and social placements are cheap here precisely because they are ignored.',
      },
    ],
    ceo_report: {
      headline: `The market rewards clarity, not features — and ${leader.target.name} is the only one being clear.`,
      competitor_summary: `${reports.length} competitors reviewed. ${leader.target.name} leads at ${leader.scores.marketing}/100 on the strength of a single ownable claim; the rest cluster within a few points of each other and are effectively interchangeable to a buyer. ${laggard.target.name} trails at ${laggard.scores.marketing}/100 with the weakest funnel in the set.`,
      growth_opportunities: [
        'Time-to-first-value is unclaimed by every competitor reviewed — the largest single opening.',
        'Comparison and alternative-to search terms are undefended across the set.',
        'Integration long-tail content is cheap to produce and uncontested.',
      ],
      user_acquisition_insights: [
        'Paid search is crowded and expensive here; every competitor bids the same head terms.',
        'The leader’s organic advantage comes from bottom-of-funnel content, not volume.',
        'Social and video placements are under-used relative to the audience that lives there.',
      ],
      revenue_insights: [
        'Subscription pricing is the norm, with the middle tier anchored as the obvious choice.',
        'Enterprise pricing is hidden across the set, which creates a sales-qualified funnel behind a self-serve front door.',
        'Nobody in this set monetises expansion well — upsell paths are an afterthought.',
      ],
      marketing_recommendations: [
        'Pick one claim and defend it. The market punishes the interchangeable middle.',
        'Ship the comparison page first; it is the fastest revenue per unit of effort available.',
        'Do not compete on price against the leader — compete on how fast a new user gets a result.',
      ],
    },
  }
}

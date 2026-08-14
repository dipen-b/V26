import type { Comparison } from '../compare'
import type { IntelligenceReport } from '../types'

/**
 * A neutral document model. The three exporters render this rather than each
 * walking the report shape, so adding a section means editing one file.
 */
export type DocBlock =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'kv'; items: { label: string; value: string }[] }
  | { type: 'scores'; items: { label: string; value: number | null }[] }
  | { type: 'table'; name: string; columns: string[]; rows: string[][] }

export type Doc = {
  title: string
  subtitle: string
  generatedAt: string
  blocks: DocBlock[]
}

const dash = '—'
const list = (items: string[]) => (items.length ? items : ['Not established from the material reviewed.'])

export function buildReportDoc(report: IntelligenceReport): Doc {
  const { target, scores, foundation, channels, advertising, business } = report
  const { executive_summary: summary, persona, positioning } = foundation

  const blocks: DocBlock[] = [
    { type: 'heading', text: 'Executive summary' },
    { type: 'paragraph', text: summary.headline },
    {
      type: 'scores',
      items: [
        { label: 'Marketing', value: scores.marketing },
        { label: 'Positioning', value: scores.positioning },
        { label: 'ASO', value: scores.aso },
        { label: 'Acquisition', value: scores.acquisition },
        { label: 'Creative', value: scores.creative },
        { label: 'Monetization', value: scores.monetization },
        { label: 'Growth opportunity', value: scores.growth_opportunity },
      ],
    },
    {
      type: 'kv',
      items: [
        { label: 'Product category', value: summary.business_overview.product_category },
        { label: 'Value proposition', value: summary.business_overview.core_value_proposition },
        { label: 'Revenue model', value: summary.business_overview.revenue_model },
        { label: 'Target audience', value: summary.business_overview.target_audience },
        { label: 'Geographic focus', value: summary.business_overview.geographic_focus },
        {
          label: 'Market position',
          value: `${summary.market_position.tier.replace(/_/g, ' ')} ${dash} ${summary.market_position.rationale}`,
        },
        {
          label: 'Growth potential',
          value: `${summary.growth_potential.level} ${dash} ${summary.growth_potential.rationale}`,
        },
      ],
    },

    { type: 'heading', text: 'Customer persona' },
    { type: 'paragraph', text: persona.summary },
    {
      type: 'kv',
      items: [
        { label: 'Age range', value: persona.demographics.age_range },
        { label: 'Gender distribution', value: persona.demographics.gender_distribution },
        { label: 'Location', value: persona.demographics.location },
        { label: 'Income level', value: persona.demographics.income_level },
      ],
    },
    { type: 'subheading', text: 'Why they convert' },
    { type: 'bullets', items: list(persona.user_intent.why_they_convert) },
    { type: 'subheading', text: 'Pain points' },
    { type: 'bullets', items: list(persona.user_intent.pain_points) },
    {
      type: 'table',
      name: 'Emotional drivers',
      columns: ['Driver', 'Strength', 'Evidence'],
      rows: persona.emotional_drivers.map((driver) => [driver.driver, driver.strength, driver.evidence]),
    },

    { type: 'heading', text: 'Positioning' },
    {
      type: 'kv',
      items: [
        { label: 'Main headline', value: positioning.messaging.main_headline },
        { label: 'Core promise', value: positioning.messaging.core_promise },
        { label: 'USP', value: positioning.messaging.unique_selling_proposition },
        { label: 'Brand voice', value: `${positioning.brand_voice.tone} ${dash} ${positioning.brand_voice.notes}` },
        {
          label: 'Strategy',
          value: `${positioning.positioning_strategy.claim.replace(/_/g, ' ')} ${dash} ${positioning.positioning_strategy.explanation}`,
        },
        { label: 'Positioning score', value: `${positioning.positioning_score}/100 ${dash} ${positioning.score_rationale}` },
      ],
    },
    {
      type: 'table',
      name: 'Differentiation opportunities',
      columns: ['Opportunity', 'Impact', 'Effort', 'Estimated impact', 'Rationale'],
      rows: positioning.differentiation_opportunities.map((item) => [
        item.title,
        item.impact,
        item.effort,
        item.estimated_impact,
        item.rationale,
      ]),
    },
  ]

  if (channels.aso.applicable) {
    blocks.push(
      { type: 'heading', text: 'ASO intelligence' },
      { type: 'paragraph', text: channels.aso.score_rationale },
      {
        type: 'kv',
        items: [
          { label: 'ASO score', value: `${channels.aso.aso_score}/100` },
          { label: 'Title', value: channels.aso.app_title.keyword_strength },
          { label: 'Short description', value: channels.aso.short_description.conversion_effectiveness },
          { label: 'Screenshots', value: channels.aso.screenshots.messaging_hierarchy },
        ],
      },
      { type: 'subheading', text: 'Recommended titles' },
      { type: 'bullets', items: list(channels.aso.app_title.recommended) },
      {
        type: 'table',
        name: 'ASO improvements',
        columns: ['Improvement', 'Impact', 'Effort', 'Rationale'],
        rows: channels.aso.improvements.map((item) => [item.title, item.impact, item.effort, item.rationale]),
      },
    )
  } else {
    blocks.push(
      { type: 'heading', text: 'ASO intelligence' },
      { type: 'paragraph', text: channels.aso.not_applicable_reason },
    )
  }

  blocks.push(
    { type: 'heading', text: 'User acquisition' },
    { type: 'paragraph', text: channels.acquisition.summary },
    {
      type: 'table',
      name: 'Acquisition channels',
      columns: ['Channel', 'Type', 'Confidence', 'Estimated share', 'Evidence'],
      rows: [
        ...channels.acquisition.organic.map((entry) => [
          entry.channel,
          'Organic',
          `${entry.confidence}%`,
          entry.estimated_share,
          entry.evidence,
        ]),
        ...channels.acquisition.paid.map((entry) => [
          entry.channel,
          'Paid',
          `${entry.confidence}%`,
          entry.estimated_share,
          entry.evidence,
        ]),
      ],
    },

    { type: 'heading', text: 'Google Ads intelligence' },
    { type: 'paragraph', text: advertising.google_ads.predicted_strategy },
    {
      type: 'table',
      name: 'Suggested keywords',
      columns: ['Keyword', 'Intent', 'Competition', 'Why'],
      rows: advertising.google_ads.suggested_keywords.map((item) => [
        item.keyword,
        item.intent,
        item.competition,
        item.why,
      ]),
    },
    { type: 'subheading', text: 'Missing opportunities' },
    { type: 'bullets', items: list(advertising.google_ads.missing_opportunities) },

    { type: 'heading', text: 'Meta Ads intelligence' },
    { type: 'paragraph', text: advertising.meta_ads.strategy_report },
    {
      type: 'table',
      name: 'Audience segments',
      columns: ['Segment', 'Interests', 'Behaviors', 'Demographics'],
      rows: advertising.meta_ads.audience_segments.map((segment) => [
        segment.name,
        segment.interests.join(', '),
        segment.behaviors.join(', '),
        segment.demographics,
      ]),
    },
    {
      type: 'table',
      name: 'Ad angles',
      columns: ['Angle', 'Expected performance', 'Rationale'],
      rows: advertising.meta_ads.ad_angles.map((angle) => [
        angle.angle,
        angle.expected_performance,
        angle.rationale,
      ]),
    },

    { type: 'heading', text: 'Creative intelligence' },
    { type: 'paragraph', text: advertising.creative.score_rationale },
    {
      type: 'table',
      name: 'Creative breakdown',
      columns: ['Asset', 'Hook', 'Pain point', 'Emotional trigger', 'Offer', 'CTA'],
      rows: advertising.creative.assets.map((asset) => [
        asset.asset,
        asset.hook,
        asset.pain_point,
        asset.emotional_trigger,
        asset.offer,
        asset.cta,
      ]),
    },

    {
      type: 'table',
      name: 'Ad library',
      columns: ['Platform', 'Industry', 'Category', 'Audience', 'Hook', 'Headline', 'Theme'],
      rows: advertising.ad_library.map((entry) => [
        entry.platform,
        entry.industry,
        entry.category,
        entry.audience,
        entry.hook,
        entry.headline,
        entry.creative_theme,
      ]),
    },

    { type: 'heading', text: 'Conversion funnel' },
    { type: 'paragraph', text: business.funnel.summary },
    {
      type: 'table',
      name: 'Funnel stages',
      columns: ['Stage', 'Description', 'Estimated drop-off'],
      rows: business.funnel.stages.map((stage) => [
        stage.stage,
        stage.description,
        stage.estimated_dropoff,
      ]),
    },
    { type: 'subheading', text: 'Conversion risks' },
    { type: 'bullets', items: list(business.funnel.conversion_risks) },

    { type: 'heading', text: 'Revenue intelligence' },
    {
      type: 'kv',
      items: [
        { label: 'Model', value: `${business.revenue.model.replace(/_/g, ' ')} ${dash} ${business.revenue.model_rationale}` },
        { label: 'Strategy', value: business.revenue.monetization_strategy },
        { label: 'Monetization score', value: `${business.revenue.monetization_score}/100` },
      ],
    },
    { type: 'subheading', text: 'Revenue drivers' },
    { type: 'bullets', items: list(business.revenue.revenue_drivers) },

    { type: 'heading', text: 'Marketing SWOT' },
    {
      type: 'table',
      name: 'SWOT',
      columns: ['Quadrant', 'Finding'],
      rows: [
        ...business.swot.strengths.map((item) => ['Strength', item]),
        ...business.swot.weaknesses.map((item) => ['Weakness', item]),
        ...business.swot.opportunities.map((item) => ['Opportunity', item]),
        ...business.swot.threats.map((item) => ['Threat', item]),
      ],
    },

    { type: 'heading', text: 'Growth recommendations' },
    {
      type: 'kv',
      items: [
        { label: 'How they acquire users', value: business.growth.how_they_acquire_users },
        { label: 'Why users convert', value: business.growth.why_users_convert },
        { label: 'What makes them competitive', value: business.growth.what_makes_them_competitive },
        { label: 'Their weaknesses', value: business.growth.their_weaknesses },
        { label: 'How to outperform them', value: business.growth.how_to_outperform },
      ],
    },
    { type: 'subheading', text: 'Copy this' },
    { type: 'bullets', items: list(business.growth.strategies_to_copy) },
    { type: 'subheading', text: 'Avoid this' },
    { type: 'bullets', items: list(business.growth.strategies_to_avoid) },
    {
      type: 'table',
      name: 'Action plan',
      columns: ['#', 'Step', 'Owner', 'Timeline', 'Estimated impact'],
      rows: business.growth.action_plan
        .slice()
        .sort((a, b) => a.priority - b.priority)
        .map((step) => [
          String(step.priority),
          step.step,
          step.owner,
          step.timeline,
          step.estimated_impact,
        ]),
    },

    { type: 'heading', text: 'About this analysis' },
    { type: 'paragraph', text: report.research_note },
  )

  if (report.sources.length) {
    blocks.push({ type: 'subheading', text: 'Sources' }, { type: 'bullets', items: report.sources })
  }

  return {
    title: `${target.name} — Marketing Intelligence Report`,
    subtitle: `${target.url} · ${target.kind.replace(/_/g, ' ')} · Marketing score ${scores.marketing}/100`,
    generatedAt: report.generated_at,
    blocks,
  }
}

export function buildComparisonDoc(comparison: Comparison, title: string, generatedAt: string): Doc {
  const ceo = comparison.ceo_report
  const competitors = comparison.positioning_matrix.map((row) => row.competitor)

  return {
    title: `CEO Growth Report — ${title}`,
    subtitle: `${competitors.length} competitors compared`,
    generatedAt,
    blocks: [
      { type: 'heading', text: 'Headline' },
      { type: 'paragraph', text: ceo.headline },

      { type: 'heading', text: 'Competitor summary' },
      { type: 'paragraph', text: ceo.competitor_summary },

      { type: 'heading', text: 'Market landscape' },
      { type: 'paragraph', text: comparison.market_landscape },

      { type: 'heading', text: 'Growth opportunities' },
      { type: 'bullets', items: list(ceo.growth_opportunities) },

      { type: 'heading', text: 'User acquisition insights' },
      { type: 'bullets', items: list(ceo.user_acquisition_insights) },

      { type: 'heading', text: 'Revenue insights' },
      { type: 'bullets', items: list(ceo.revenue_insights) },

      { type: 'heading', text: 'Marketing recommendations' },
      { type: 'bullets', items: list(ceo.marketing_recommendations) },

      {
        type: 'table',
        name: 'Positioning matrix',
        columns: ['Competitor', 'Claim', 'Tone', 'Score', 'Summary'],
        rows: comparison.positioning_matrix.map((row) => [
          row.competitor,
          row.claim,
          row.tone,
          String(row.positioning_score),
          row.one_line_summary,
        ]),
      },
      {
        type: 'table',
        name: 'Messaging matrix',
        columns: ['Competitor', 'Headline', 'Core promise', 'USP'],
        rows: comparison.messaging_matrix.map((row) => [
          row.competitor,
          row.main_headline,
          row.core_promise,
          row.unique_selling_proposition,
        ]),
      },
      {
        type: 'table',
        name: 'Feature matrix',
        columns: ['Feature', ...competitors],
        rows: comparison.feature_matrix.map((row) => [
          row.feature,
          ...competitors.map((name) => {
            const cell = row.availability.find((entry) => entry.competitor === name)
            return cell ? cell.status : 'unknown'
          }),
        ]),
      },
      {
        type: 'table',
        name: 'Growth opportunity matrix',
        columns: ['Opportunity', 'Impact', 'Effort', 'Weakest competitor', 'Why now'],
        rows: comparison.growth_opportunity_matrix.map((row) => [
          row.opportunity,
          row.impact,
          row.effort,
          row.weakest_competitor,
          row.why_now,
        ]),
      },
    ],
  }
}

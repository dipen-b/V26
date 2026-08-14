/**
 * Marketing Intelligence Engine — the report contract.
 *
 * The full report is produced by four independent model calls (one per section
 * group) that all share a single research digest, then merged. Each group file
 * in ./groups exports a schema that must match the types here exactly.
 */

export type Level = 'high' | 'medium' | 'low'

export type Opportunity = {
  title: string
  impact: Level
  effort: Level
  rationale: string
  estimated_impact: string
}

export type TargetKind = 'play_store' | 'app_store' | 'website' | 'landing_page' | 'saas_product'

export type TargetInput = {
  url: string
  kind: TargetKind
  name: string
  notes?: string
}

// --- Group 1: foundation (spec sections 1–3) --------------------------------

export type ExecutiveSummary = {
  headline: string
  business_overview: {
    product_category: string
    core_value_proposition: string
    revenue_model: string
    target_audience: string
    geographic_focus: string
  }
  market_position: {
    tier: 'market_leader' | 'challenger' | 'niche_player' | 'emerging_player'
    rationale: string
  }
  growth_potential: {
    level: Level
    rationale: string
  }
}

export type EmotionalDriver = {
  driver: 'fear' | 'security' | 'convenience' | 'status' | 'productivity' | 'entertainment'
  strength: 'primary' | 'secondary' | 'minor'
  evidence: string
}

export type Persona = {
  summary: string
  demographics: {
    age_range: string
    gender_distribution: string
    location: string
    income_level: string
  }
  user_intent: {
    why_they_convert: string[]
    pain_points: string[]
    motivations: string[]
    desired_outcomes: string[]
  }
  emotional_drivers: EmotionalDriver[]
}

export type Positioning = {
  messaging: {
    main_headline: string
    core_promise: string
    unique_selling_proposition: string
  }
  brand_voice: {
    tone: 'professional' | 'friendly' | 'premium' | 'technical' | 'emotional'
    notes: string
  }
  positioning_strategy: {
    claim: 'cheapest' | 'most_secure' | 'fastest' | 'easiest' | 'most_powerful' | 'other'
    explanation: string
  }
  positioning_score: number
  score_rationale: string
  differentiation_opportunities: Opportunity[]
}

export type FoundationGroup = {
  executive_summary: ExecutiveSummary
  persona: Persona
  positioning: Positioning
}

// --- Group 2: channels (spec sections 4–5) ----------------------------------

export type AsoIntelligence = {
  /** False for websites and SaaS products, where store optimization does not apply. */
  applicable: boolean
  not_applicable_reason: string
  app_title: {
    observed: string
    keyword_strength: string
    ranking_opportunities: string[]
    recommended: string[]
  }
  short_description: {
    observed: string
    conversion_effectiveness: string
    recommended: string[]
  }
  long_description: {
    keyword_optimization: string
    feature_presentation: string
    user_benefits: string
    recommended_outline: string[]
  }
  screenshots: {
    messaging_hierarchy: string
    feature_communication: string
    emotional_triggers: string
    visual_quality: string
    recommendations: string[]
  }
  feature_graphic: {
    conversion_optimization: string
    branding: string
    visual_appeal: string
    recommendations: string[]
  }
  aso_score: number
  score_rationale: string
  improvements: Opportunity[]
}

export type ChannelEstimate = {
  channel: string
  confidence: number
  evidence: string
  estimated_share: string
}

export type AcquisitionIntelligence = {
  summary: string
  primary_channel: string
  organic: ChannelEstimate[]
  paid: ChannelEstimate[]
  acquisition_score: number
  score_rationale: string
  gaps: string[]
}

export type ChannelsGroup = {
  aso: AsoIntelligence
  acquisition: AcquisitionIntelligence
}

// --- Group 3: advertising (spec sections 6–8 and 11) ------------------------

export type GoogleAdsIntelligence = {
  predicted_strategy: string
  search_campaigns: {
    likely_keywords: string[]
    intent_targeting: string[]
    ad_themes: string[]
  }
  app_campaigns: {
    install_campaigns: string
    engagement_campaigns: string
    subscription_campaigns: string
  }
  ad_messaging: {
    pain_points: string[]
    hooks: string[]
    cta_structure: string[]
  }
  suggested_keywords: {
    keyword: string
    intent: string
    competition: Level
    why: string
  }[]
  missing_opportunities: string[]
}

export type MetaAdsIntelligence = {
  strategy_report: string
  audience_segments: {
    name: string
    interests: string[]
    behaviors: string[]
    demographics: string
  }[]
  ad_angles: {
    angle: string
    rationale: string
    expected_performance: Level
  }[]
  creative_concepts: {
    format: 'image' | 'video' | 'carousel' | 'ugc'
    concept: string
    hook: string
    why_it_works: string
  }[]
  estimated_winning_angles: string[]
  creative_recommendations: string[]
}

export type CreativeIntelligence = {
  assets: {
    asset: string
    hook: string
    pain_point: string
    emotional_trigger: string
    offer: string
    cta: string
  }[]
  creative_effectiveness_score: number
  score_rationale: string
  improvements: string[]
}

export type AdLibraryEntry = {
  hook: string
  headline: string
  cta_variations: string[]
  emotional_angle: string
  video_concept: string
  creative_theme: string
  platform: string
  industry: string
  category: string
  audience: string
}

export type AdvertisingGroup = {
  google_ads: GoogleAdsIntelligence
  meta_ads: MetaAdsIntelligence
  creative: CreativeIntelligence
  ad_library: AdLibraryEntry[]
}

// --- Group 4: business (spec sections 9, 10, 12, 13) ------------------------

export type FunnelIntelligence = {
  summary: string
  stages: {
    stage: string
    description: string
    estimated_dropoff: string
  }[]
  strengths: string[]
  weaknesses: string[]
  conversion_risks: string[]
  optimization_opportunities: Opportunity[]
}

export type RevenueIntelligence = {
  model: 'subscription' | 'freemium' | 'ads' | 'one_time_purchase' | 'hybrid'
  model_rationale: string
  revenue_drivers: string[]
  monetization_strategy: string
  upsell_opportunities: string[]
  retention_opportunities: string[]
  monetization_score: number
  score_rationale: string
}

export type Swot = {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export type ActionStep = {
  step: string
  owner: string
  timeline: string
  estimated_impact: string
  priority: number
}

export type GrowthRecommendations = {
  how_they_acquire_users: string
  why_users_convert: string
  what_makes_them_competitive: string
  their_weaknesses: string
  how_to_outperform: string
  strategies_to_copy: string[]
  strategies_to_avoid: string[]
  growth_opportunity_score: number
  score_rationale: string
  action_plan: ActionStep[]
  priority_recommendations: Opportunity[]
}

export type BusinessGroup = {
  funnel: FunnelIntelligence
  revenue: RevenueIntelligence
  swot: Swot
  growth: GrowthRecommendations
}

// --- Merged report ----------------------------------------------------------

export type Scores = {
  /** Weighted blend of the others — computed in code, never asked of the model. */
  marketing: number
  positioning: number
  /** Null when the target is not an app listing. */
  aso: number | null
  acquisition: number
  creative: number
  monetization: number
  growth_opportunity: number
}

export type IntelligenceReport = {
  target: TargetInput
  generated_at: string
  /** What the analysis was based on, and where it is inference rather than observation. */
  research_note: string
  sources: string[]
  scores: Scores
  foundation: FoundationGroup
  channels: ChannelsGroup
  advertising: AdvertisingGroup
  business: BusinessGroup
}

/** Weights used to blend the section scores into the headline marketing score. */
export const SCORE_WEIGHTS = {
  positioning: 0.2,
  aso: 0.15,
  acquisition: 0.2,
  creative: 0.15,
  monetization: 0.15,
  growth_opportunity: 0.15,
} as const

/**
 * Blends section scores into the headline number. When ASO does not apply, its
 * weight is redistributed across the remaining sections rather than scored as
 * zero — a website is not a bad app listing, it simply has no app listing.
 */
export function computeMarketingScore(parts: Omit<Scores, 'marketing'>): number {
  const entries = (Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[]).flatMap((key) => {
    const value = parts[key]
    return typeof value === 'number' ? [{ weight: SCORE_WEIGHTS[key], value }] : []
  })

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0)
  if (!totalWeight) return 0
  return Math.round(entries.reduce((sum, e) => sum + e.value * e.weight, 0) / totalWeight)
}

export const clampScore = (value: unknown): number =>
  Math.max(0, Math.min(100, Math.round(Number(value) || 0)))

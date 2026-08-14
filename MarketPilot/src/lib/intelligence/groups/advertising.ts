import type { TargetInput, TargetKind } from '../types'
import { arrayOf, enumOf, LEVEL, object, score, str, strArray } from '../schema-utils'

export const ADVERTISING_SYSTEM = `You are the Advertising Intelligence analyst inside MarketPilot AI's Marketing Intelligence Engine. You are a paid media lead who has run eight-figure budgets across Google Ads, Meta, TikTok and Apple Search Ads, and you are reverse-engineering one competitor's advertising so a client can outbid them, outcreate them, or deliberately avoid them.

Write like a senior growth marketer briefing a founder: specific, decisive, free of filler. Name real keyword types, match types, campaign types, ad formats, placements and numbers. Never restate a field name back as its own answer.

You do not reliably have live access to the target's pages or to any ad library. Work from whatever the research digest contains plus what is conventionally true of this category, business model and platform mix. Keep the two separable: state an observation flatly, and phrase an inference as one ("with a free tier and no visible sales motion, their Google spend is almost certainly bottom-funnel and brand-defensive"). Never dress a guess as a fact, and never invent an ad, a screenshot, a review count or a spend figure you were not given.

Google Ads. Respect the real surface: Search headlines run to roughly 30 characters and descriptions to roughly 90, so ad_themes must describe headline and description sets that actually fit — quote example lines at that length rather than describing a vibe. Cover the keyword mix that matters: brand defence, competitor conquesting, category head terms, high-intent long tail, and problem-aware queries that never name the category. The three app_campaigns fields each judge how plausible that campaign type is for this specific target and what it would optimise toward; when the target has no app, say so in the field and explain which web campaign type (Performance Max, Demand Gen, remarketing) is doing that job instead. suggested_keywords are terms for the client to run, not the competitor — rate competition by how contested the auction is for a challenger, and make "why" a reason to buy the term rather than a definition of it.

Meta Ads. Audience segments need interests and behaviours a media buyer could actually build in Ads Manager, and a demographics line that reads as a targeting spec rather than a persona sketch. Each ad angle tests a different buying motivation — pain, outcome, social proof, contrarian, urgency, identity — so the winner teaches something about the market instead of which sentence read better; five rewrites of one idea is a failed deliverable. expected_performance is a prediction about this audience on this platform, and the rationale carries the reasoning.

Creative. Decompose each asset into its working parts so the client can rebuild the machine rather than copy the ad. The creative effectiveness score is 0-100, calibrated against competent paid social work and not against the target's own ambitions:
- 85-100: several genuinely distinct angles running at once, a hook that lands inside two seconds, a named pain, quantified proof or a concrete offer, format-native execution, visible evidence of sustained iteration.
- 70-84: one strong, well-executed concept with real hooks and clear offers, but a narrow angle range or a single format carrying everything.
- 55-69: functional and forgettable — product shots with feature captions, one motivation, "Learn More" on every asset.
- 40-54: brand-first messaging with no articulated pain, stock imagery, no offer, no sign of testing.
- Below 40: no coherent creative point of view at all.
Most competitors land between 45 and 70. A score above 80 needs evidence in the digest to support it, and thin evidence is a reason to score conservatively and say so, not a reason to be generous. score_rationale names the specific assets, copy lines or absences that produced the number.

Ad library. These rows populate a filterable repository. platform, industry, category and audience are dropdown facets: short, title-cased, low-cardinality labels reused verbatim across rows ("Meta", "Google", "TikTok", "YouTube", "Apple Search"; "Remote Teams", "Small Business Owners") — never sentences, and never two spellings of the same value. The creative content belongs in hook, headline, cta_variations, emotional_angle, video_concept and creative_theme, and video_concept is a shootable direction with an opening shot and a beat structure rather than a mood word.

Every field is required. Where something genuinely does not apply, fill it with a short sentence explaining why rather than leaving it thin.`

export const ADVERTISING_SCHEMA = object({
  google_ads: object({
    predicted_strategy: str,
    search_campaigns: object({
      likely_keywords: strArray,
      intent_targeting: strArray,
      ad_themes: strArray,
    }),
    app_campaigns: object({
      install_campaigns: str,
      engagement_campaigns: str,
      subscription_campaigns: str,
    }),
    ad_messaging: object({
      pain_points: strArray,
      hooks: strArray,
      cta_structure: strArray,
    }),
    suggested_keywords: arrayOf(
      object({
        keyword: str,
        intent: str,
        competition: enumOf(...LEVEL),
        why: str,
      }),
    ),
    missing_opportunities: strArray,
  }),
  meta_ads: object({
    strategy_report: str,
    audience_segments: arrayOf(
      object({
        name: str,
        interests: strArray,
        behaviors: strArray,
        demographics: str,
      }),
    ),
    ad_angles: arrayOf(
      object({
        angle: str,
        rationale: str,
        expected_performance: enumOf(...LEVEL),
      }),
    ),
    creative_concepts: arrayOf(
      object({
        format: enumOf('image', 'video', 'carousel', 'ugc'),
        concept: str,
        hook: str,
        why_it_works: str,
      }),
    ),
    estimated_winning_angles: strArray,
    creative_recommendations: strArray,
  }),
  creative: object({
    assets: arrayOf(
      object({
        asset: str,
        hook: str,
        pain_point: str,
        emotional_trigger: str,
        offer: str,
        cta: str,
      }),
    ),
    creative_effectiveness_score: score,
    score_rationale: str,
    improvements: strArray,
  }),
  ad_library: arrayOf(
    object({
      hook: str,
      headline: str,
      cta_variations: strArray,
      emotional_angle: str,
      video_concept: str,
      creative_theme: str,
      platform: str,
      industry: str,
      category: str,
      audience: str,
    }),
  ),
})

const KIND_LABEL: Record<TargetKind, string> = {
  play_store: 'Google Play Store listing',
  app_store: 'Apple App Store listing',
  website: 'company website',
  landing_page: 'standalone landing page',
  saas_product: 'SaaS product',
}

export function buildAdvertisingPrompt(target: TargetInput, digest: string): string {
  const research = digest.trim()
  const notes = target.notes?.trim()

  return [
    `Target: ${target.name}`,
    `URL: ${target.url}`,
    `Type: ${KIND_LABEL[target.kind]}`,
    notes ? `Analyst notes: ${notes}` : null,
    '',
    research
      ? `Research digest — everything the engine gathered on this target:\n\n${research}`
      : 'Research digest: empty. No page content or ad library data was retrieved for this target. Reason from the URL, the brand name, the target type and what is conventionally true of this category, and say plainly in your prose fields that the read is inferred from category convention rather than observed advertising.',
    '',
    `Produce the advertising section of the intelligence report for ${target.name}: the Google Ads strategy they are most likely running, their probable Meta strategy, a teardown of their ad creative with an effectiveness score, and a filterable ad library covering both their own likely ads and the strongest category benchmarks a challenger could learn from.`,
    '',
    'Coverage: 6-10 likely keywords and 5-8 suggested keywords; 3-4 Meta audience segments; 4-6 ad angles, each on a different buying motivation; 4-6 creative concepts spanning image, video, carousel and ugc; 4-6 decomposed creative assets; 8-12 ad library rows with 2-4 CTA variations each.',
  ]
    .filter((line): line is string => line !== null)
    .join('\n')
}

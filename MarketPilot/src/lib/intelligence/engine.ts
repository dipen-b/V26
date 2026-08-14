import { generate } from '@/lib/ai'
import { researchTarget } from './research'
import {
  clampScore,
  computeMarketingScore,
  type AdvertisingGroup,
  type BusinessGroup,
  type ChannelsGroup,
  type FoundationGroup,
  type IntelligenceReport,
  type Scores,
  type TargetInput,
} from './types'

import { FOUNDATION_SCHEMA, FOUNDATION_SYSTEM, buildFoundationPrompt } from './groups/foundation'
import { CHANNELS_SCHEMA, CHANNELS_SYSTEM, buildChannelsPrompt } from './groups/channels'
import {
  ADVERTISING_SCHEMA,
  ADVERTISING_SYSTEM,
  buildAdvertisingPrompt,
} from './groups/advertising'
import { BUSINESS_SCHEMA, BUSINESS_SYSTEM, buildBusinessPrompt } from './groups/business'

import { foundationFixture } from './fixtures/foundation'
import { channelsFixture } from './fixtures/channels'
import { advertisingFixture } from './fixtures/advertising'
import { businessFixture } from './fixtures/business'

export type EngineSource = 'live' | 'partial' | 'fallback'

export type EngineResult = {
  report: IntelligenceReport
  source: EngineSource
  warnings: string[]
}

const APP_KINDS: TargetInput['kind'][] = ['play_store', 'app_store']

/**
 * The full 13-section report is far too large for one reliable structured call,
 * so it is split into four independent calls that share a single research
 * digest. They run concurrently, and one group failing degrades that section to
 * its fixture rather than losing the whole report.
 */
export async function runIntelligence(target: TargetInput): Promise<EngineResult> {
  const warnings: string[] = []

  const research = await researchTarget(target)
  if (research.warning) warnings.push(research.warning)

  const shared = { target, digest: research.digest }

  const [foundation, channels, advertising, business] = await Promise.all([
    generate<FoundationGroup>({
      system: FOUNDATION_SYSTEM,
      prompt: buildFoundationPrompt(shared.target, shared.digest),
      schema: FOUNDATION_SCHEMA,
      fallback: foundationFixture(target),
      effort: 'high',
      maxTokens: 16000,
    }),
    generate<ChannelsGroup>({
      system: CHANNELS_SYSTEM,
      prompt: buildChannelsPrompt(shared.target, shared.digest),
      schema: CHANNELS_SCHEMA,
      fallback: channelsFixture(target),
      effort: 'high',
      maxTokens: 16000,
    }),
    generate<AdvertisingGroup>({
      system: ADVERTISING_SYSTEM,
      prompt: buildAdvertisingPrompt(shared.target, shared.digest),
      schema: ADVERTISING_SCHEMA,
      fallback: advertisingFixture(target),
      effort: 'high',
      maxTokens: 24000,
    }),
    generate<BusinessGroup>({
      system: BUSINESS_SYSTEM,
      prompt: buildBusinessPrompt(shared.target, shared.digest),
      schema: BUSINESS_SCHEMA,
      fallback: businessFixture(target),
      effort: 'high',
      maxTokens: 20000,
    }),
  ])

  const parts = [foundation, channels, advertising, business]
  for (const part of parts) if (part.error) warnings.push(part.error)

  const liveCount = parts.filter((part) => part.source === 'live').length
  const source: EngineSource = liveCount === parts.length ? 'live' : liveCount === 0 ? 'fallback' : 'partial'

  const asoApplies = APP_KINDS.includes(target.kind) && channels.data.aso.applicable
  const scoreParts: Omit<Scores, 'marketing'> = {
    positioning: clampScore(foundation.data.positioning.positioning_score),
    aso: asoApplies ? clampScore(channels.data.aso.aso_score) : null,
    acquisition: clampScore(channels.data.acquisition.acquisition_score),
    creative: clampScore(advertising.data.creative.creative_effectiveness_score),
    monetization: clampScore(business.data.revenue.monetization_score),
    growth_opportunity: clampScore(business.data.growth.growth_opportunity_score),
  }

  const report: IntelligenceReport = {
    target,
    generated_at: new Date().toISOString(),
    research_note: buildResearchNote(research.source, research.digest, source),
    sources: research.sources,
    scores: { marketing: computeMarketingScore(scoreParts), ...scoreParts },
    foundation: foundation.data,
    channels: channels.data,
    advertising: advertising.data,
    business: business.data,
  }

  return { report, source, warnings }
}

function buildResearchNote(
  researchSource: 'live' | 'fallback',
  digest: string,
  source: EngineSource,
): string {
  if (source === 'fallback') {
    return 'No Anthropic credentials are configured, so this report is built from MarketPilot’s sample intelligence rather than an analysis of the live target. Set ANTHROPIC_API_KEY for a real report.'
  }
  if (researchSource === 'live' && digest.trim()) {
    return 'Written from a live fetch of the target plus supporting web search. Claims drawn from the fetched pages are stated as observations; everything else is labelled as inference.'
  }
  return 'The target page could not be fetched, so this analysis reasons from the URL, brand, and category conventions. Treat every claim as inference rather than observation.'
}

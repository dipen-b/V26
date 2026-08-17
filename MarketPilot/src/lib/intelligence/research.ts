import Anthropic from '@anthropic-ai/sdk'
import { anthropic, isCredentialFailure, MODEL } from '@/lib/ai'
import type { TargetInput } from './types'

export type ResearchResult = {
  digest: string
  sources: string[]
  source: 'live' | 'fallback'
  warning?: string
}

const KIND_LABEL: Record<TargetInput['kind'], string> = {
  play_store: 'Google Play Store listing',
  app_store: 'Apple App Store listing',
  website: 'company website',
  landing_page: 'landing page',
  saas_product: 'SaaS product site',
}

const RESEARCH_SYSTEM = `You are the research stage of a competitive marketing intelligence engine. You gather raw material; a later stage writes the report.

Fetch the target URL and search for what a competitive analyst would need: pricing, positioning and headline copy, the app listing if one exists, reviews and ratings, funding or company size, and any visible advertising. Follow the trail where it is useful — a pricing page linked from the homepage is worth fetching.

Write a dense factual digest, organised under plain headings. Quote the exact wording of headlines, taglines, pricing tiers, CTAs, and store metadata, because downstream stages analyze that language directly.

Separate what you observed from what you could not see. End with a short "Not observed" list naming the things you were unable to confirm — that list is as valuable as the findings, because it stops the report stating guesses as facts. Do not analyze, recommend, or score anything; that is not your job.`

/** Pull the URLs Claude actually reached, for the report's source list. */
function collectSources(blocks: Anthropic.ContentBlock[]): string[] {
  const urls = new Set<string>()

  const walk = (value: unknown) => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    const record = value as Record<string, unknown>
    if (typeof record.url === 'string' && /^https?:\/\//.test(record.url)) urls.add(record.url)
    Object.values(record).forEach(walk)
  }

  walk(blocks)
  return [...urls].slice(0, 40)
}

function textOf(blocks: Anthropic.ContentBlock[]): string {
  return blocks
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()
}

/**
 * Stage one of the engine. One research pass feeds all four section-group calls,
 * so the sections agree with each other and the page is fetched once rather than
 * four times.
 *
 * Server-side tools run an internal loop that can stop with `pause_turn`; we
 * resume by replaying the assistant turn until the model finishes.
 */
export async function researchTarget(target: TargetInput): Promise<ResearchResult> {
  if (process.env.MARKETPILOT_MOCK === '1') {
    return { digest: '', sources: [], source: 'fallback' }
  }

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Research this competitor for a marketing intelligence report.

Name: ${target.name}
Type: ${KIND_LABEL[target.kind]}
URL: ${target.url}
${target.notes ? `\nContext from the analyst: ${target.notes}` : ''}`,
    },
  ]

  const collected: Anthropic.ContentBlock[] = []

  try {
    // Each pause_turn is one continuation; the cap stops a pathological loop.
    for (let attempt = 0; attempt < 6; attempt++) {
      // Streamed for the same reason as lib/ai.ts generate(): the SDK refuses
      // non-streaming requests that its 10-minute ceiling might not cover, and a
      // tool-using research turn is exactly that shape.
      const response = await anthropic()
        .messages.stream({
          model: MODEL,
          max_tokens: 16000,
          system: RESEARCH_SYSTEM,
          thinking: { type: 'adaptive' },
          output_config: { effort: 'medium' },
          tools: [
            { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 8 },
            { type: 'web_search_20260209', name: 'web_search', max_uses: 6 },
          ],
          messages,
        })
        .finalMessage()

      collected.push(...response.content)

      if (response.stop_reason === 'refusal') {
        return {
          digest: '',
          sources: [],
          source: 'fallback',
          warning: 'The research stage was declined. The report was written without live page data.',
        }
      }

      if (response.stop_reason !== 'pause_turn') {
        return {
          digest: textOf(collected),
          sources: collectSources(collected),
          source: 'live',
        }
      }

      // Resume: replay the paused assistant turn, no extra user message.
      messages.push({ role: 'assistant', content: response.content })
    }

    return {
      digest: textOf(collected),
      sources: collectSources(collected),
      source: 'live',
      warning: 'Research hit its continuation limit; the digest may be incomplete.',
    }
  } catch (err) {
    if (isCredentialFailure(err)) {
      return { digest: '', sources: [], source: 'fallback' }
    }
    // Research is best-effort: a failure here degrades the report to
    // inference-only rather than failing the whole request.
    return {
      digest: '',
      sources: [],
      source: 'fallback',
      warning: `Live research failed (${
        err instanceof Error ? err.message : 'unknown error'
      }). The report was written from the URL and category conventions only.`,
    }
  }
}

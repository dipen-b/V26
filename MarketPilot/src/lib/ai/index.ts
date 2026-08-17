import { anthropicProvider, anthropic, ANTHROPIC_MODEL } from './providers/anthropic'
import { openaiProvider } from './providers/openai'
import { NoCredentialsError, RefusalError, type Effort, type Provider } from './providers/types'

export { anthropic }
export const MODEL = ANTHROPIC_MODEL

const REGISTRY: Record<string, Provider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
}

/**
 * Order matters: the first provider with working credentials wins. Configure
 * with AI_CHAIN, e.g. `AI_CHAIN=openai,anthropic` to prefer OpenAI. Unknown
 * names are skipped rather than throwing, so a typo degrades instead of
 * taking the app down.
 */
function chain(preferred?: string): Provider[] {
  const names = (preferred ? [preferred] : (process.env.AI_CHAIN || 'anthropic').split(','))
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean)

  const providers = names.map((n) => REGISTRY[n]).filter((p): p is Provider => Boolean(p))
  return providers.length ? providers : [anthropicProvider]
}

/** Explicit escape hatch for demos and tests. */
function mockForced() {
  return process.env.MARKETPILOT_MOCK === '1'
}

export type AiOutcome = 'live' | 'fallback'

/** Retained for callers that still import it; the chain uses typed errors internally. */
export function isCredentialFailure(err: unknown): boolean {
  return err instanceof NoCredentialsError
}

export type GenerateResult<T> = {
  data: T
  source: AiOutcome
  error?: string
  /** Which provider actually answered, for surfacing in the UI and logs. */
  provider?: string
}

/**
 * Structured module generation. Walks the provider chain, and falls back to the
 * supplied fixture only when every provider lacks credentials — a malformed
 * request or a genuine API error surfaces instead of being masked by sample data.
 */
export async function generate<T>(opts: {
  system: string
  prompt: string
  schema: Record<string, unknown>
  fallback: T
  effort?: Effort
  maxTokens?: number
  provider?: string
}): Promise<GenerateResult<T>> {
  if (mockForced()) return { data: opts.fallback, source: 'fallback' }

  const providers = chain(opts.provider)
  let lastError: string | undefined

  for (const provider of providers) {
    if (!provider.configured()) continue

    try {
      const text = await provider.generateJson({
        system: opts.system,
        prompt: opts.prompt,
        schema: opts.schema,
        effort: opts.effort,
        maxTokens: opts.maxTokens,
      })
      return { data: JSON.parse(text) as T, source: 'live', provider: provider.name }
    } catch (err) {
      if (err instanceof NoCredentialsError) continue // try the next provider

      if (err instanceof RefusalError) {
        return {
          data: opts.fallback,
          source: 'fallback',
          error: 'The model declined this request. Showing sample output instead.',
          provider: provider.name,
        }
      }

      lastError = err instanceof Error ? err.message : 'Generation failed.'
      break // a real error — do not silently retry it on another provider
    }
  }

  return { data: opts.fallback, source: 'fallback', error: lastError }
}

const NO_CREDENTIALS_NOTE =
  '\n\n---\n_Demo mode: no AI credentials found, so this reply came from built-in sample content. Set `ANTHROPIC_API_KEY` (or configure `AI_CHAIN`) for live AI._'

/**
 * Streaming chat. Emits plain text chunks; the client renders them as they land.
 * If no provider has credentials the fixture is streamed instead, so the chat UI
 * behaves identically either way.
 */
export function chatStream(opts: {
  system: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  fallback: string
  provider?: string
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let emitted = false
      const send = (text: string) => {
        emitted = true
        controller.enqueue(encoder.encode(text))
      }

      const streamFallback = async (text: string) => {
        // Chunk the fixture so the typing behaviour matches a live stream.
        const words = text.split(' ')
        for (let i = 0; i < words.length; i += 3) {
          send(words.slice(i, i + 3).join(' ') + ' ')
          await new Promise((r) => setTimeout(r, 12))
        }
      }

      try {
        if (mockForced()) {
          await streamFallback(opts.fallback)
          return
        }

        for (const provider of chain(opts.provider)) {
          if (!provider.configured()) continue

          try {
            for await (const chunk of provider.streamText({
              system: opts.system,
              messages: opts.messages,
            })) {
              send(chunk)
            }
            if (emitted) return
          } catch (err) {
            // Only move to the next provider while nothing has reached the user;
            // once tokens are out, switching would splice two different answers.
            if (err instanceof NoCredentialsError && !emitted) continue
            throw err
          }
        }

        if (!emitted) await streamFallback(opts.fallback + NO_CREDENTIALS_NOTE)
      } catch (err) {
        if (!emitted) {
          if (err instanceof RefusalError) {
            send('_I was not able to answer that request._')
          } else {
            const message = err instanceof Error ? err.message : 'Unknown error'
            send(`_The AI request failed: ${message}_`)
          }
        } else {
          // Partial answer already reached the user — say so rather than
          // silently splicing unrelated fixture text onto the end.
          send('\n\n_The response was cut short by a connection error._')
        }
      } finally {
        controller.close()
      }
    },
  })
}

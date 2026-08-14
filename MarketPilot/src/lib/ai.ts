import Anthropic from '@anthropic-ai/sdk'

export const MODEL = 'claude-opus-5'

let _client: Anthropic | null = null

export function anthropic(): Anthropic {
  // The SDK resolves credentials from ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, or an
  // `ant auth login` profile — so an unset API key does not mean "no credentials".
  // We construct the client regardless and let the request itself decide.
  if (!_client) _client = new Anthropic()
  return _client
}

const client = anthropic

/** Explicit escape hatch for demos and tests. */
function mockForced() {
  return process.env.MARKETPILOT_MOCK === '1'
}

export type AiOutcome = 'live' | 'fallback'

/**
 * True when the failure means "we have no working credentials" rather than
 * "this particular request was bad". Only the former should fall back to
 * fixtures — a malformed request should surface as a real error.
 */
export function isCredentialFailure(err: unknown): boolean {
  if (err instanceof Anthropic.AuthenticationError) return true
  if (err instanceof Anthropic.PermissionDeniedError) return true
  if (err instanceof Anthropic.APIConnectionError) return true
  if (err instanceof Anthropic.NotFoundError) return true // unknown model for this key
  if (err instanceof Error && /apiKey|authentication|credential/i.test(err.message)) return true
  return false
}

export type GenerateResult<T> = { data: T; source: AiOutcome; error?: string }

/**
 * Structured module generation. Uses structured outputs so the response is
 * guaranteed to match the schema, and falls back to the supplied fixture when
 * no credentials are configured.
 */
export async function generate<T>(opts: {
  system: string
  prompt: string
  schema: Record<string, unknown>
  fallback: T
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  maxTokens?: number
}): Promise<GenerateResult<T>> {
  if (mockForced()) return { data: opts.fallback, source: 'fallback' }

  try {
    const response = await client().messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 16000,
      system: opts.system,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: opts.effort ?? 'medium',
        format: { type: 'json_schema', schema: opts.schema },
      },
      messages: [{ role: 'user', content: opts.prompt }],
    })

    if (response.stop_reason === 'refusal') {
      return {
        data: opts.fallback,
        source: 'fallback',
        error: 'The model declined this request. Showing sample output instead.',
      }
    }

    const text = response.content.find((block) => block.type === 'text')
    if (!text || text.type !== 'text') {
      return { data: opts.fallback, source: 'fallback', error: 'Empty response from the model.' }
    }

    return { data: JSON.parse(text.text) as T, source: 'live' }
  } catch (err) {
    if (isCredentialFailure(err)) {
      return { data: opts.fallback, source: 'fallback' }
    }
    return {
      data: opts.fallback,
      source: 'fallback',
      error: err instanceof Error ? err.message : 'Generation failed.',
    }
  }
}

const NO_CREDENTIALS_NOTE =
  '\n\n---\n_Demo mode: no Anthropic credentials found, so this reply came from built-in sample content. Set `ANTHROPIC_API_KEY` for live AI._'

/**
 * Streaming chat. Emits plain text chunks; the client renders them as they land.
 * If credentials are missing the fixture is streamed instead, so the chat UI
 * behaves identically either way.
 */
export function chatStream(opts: {
  system: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  fallback: string
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

        const stream = client().messages.stream({
          model: MODEL,
          max_tokens: 64000,
          system: opts.system,
          thinking: { type: 'adaptive' },
          messages: opts.messages,
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send(event.delta.text)
          }
        }

        const final = await stream.finalMessage()
        if (final.stop_reason === 'refusal') {
          send('\n\n_I was not able to answer that request._')
        } else if (!emitted) {
          await streamFallback(opts.fallback)
        }
      } catch (err) {
        if (!emitted) {
          if (isCredentialFailure(err)) {
            await streamFallback(opts.fallback + NO_CREDENTIALS_NOTE)
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

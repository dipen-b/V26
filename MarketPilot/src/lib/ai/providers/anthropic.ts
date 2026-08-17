import Anthropic from '@anthropic-ai/sdk'
import {
  NoCredentialsError,
  RefusalError,
  type ChatArgs,
  type GenerateArgs,
  type Provider,
} from './types'

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5'

let _client: Anthropic | null = null

/** Exported because the intelligence research stage needs the raw client for server tools. */
export function anthropic(): Anthropic {
  // The SDK resolves credentials from ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, or an
  // `ant auth login` profile — so an unset API key does not mean "no credentials".
  // We construct the client regardless and let the request itself decide.
  if (!_client) _client = new Anthropic()
  return _client
}

/**
 * True when the failure means "we have no working credentials" rather than
 * "this particular request was bad". Only the former should move down the
 * provider chain — a malformed request must surface as a real error.
 */
export function isAnthropicCredentialFailure(err: unknown): boolean {
  if (err instanceof Anthropic.AuthenticationError) return true
  if (err instanceof Anthropic.PermissionDeniedError) return true
  if (err instanceof Anthropic.APIConnectionError) return true
  if (err instanceof Anthropic.NotFoundError) return true // unknown model for this key
  if (err instanceof Error && /apiKey|authentication|credential/i.test(err.message)) return true
  return false
}

function wrap(err: unknown): never {
  if (isAnthropicCredentialFailure(err)) throw new NoCredentialsError('anthropic', err)
  throw err
}

export const anthropicProvider: Provider = {
  name: 'anthropic',
  supportsSchema: true,

  configured() {
    // Credentials may come from a CLI profile rather than the environment, so
    // this is optimistic — a real answer only arrives when a request is made.
    return true
  },

  async generateJson(args: GenerateArgs): Promise<string> {
    try {
      // Streamed rather than awaited whole: the SDK rejects non-streaming requests
      // whose max_tokens could push them past its 10-minute ceiling, which these
      // long structured generations do.
      const response = await anthropic()
        .messages.stream({
          model: ANTHROPIC_MODEL,
          max_tokens: args.maxTokens ?? 16000,
          system: args.system,
          thinking: { type: 'adaptive' },
          output_config: {
            effort: args.effort ?? 'medium',
            format: { type: 'json_schema', schema: args.schema },
          },
          messages: [{ role: 'user', content: args.prompt }],
        })
        .finalMessage()

      if (response.stop_reason === 'refusal') throw new RefusalError('anthropic')

      const text = response.content.find((block) => block.type === 'text')
      if (!text || text.type !== 'text') throw new Error('Empty response from Anthropic.')
      return text.text
    } catch (err) {
      if (err instanceof RefusalError) throw err
      wrap(err)
    }
  },

  async *streamText(args: ChatArgs): AsyncIterable<string> {
    let stream
    try {
      stream = anthropic().messages.stream({
        model: ANTHROPIC_MODEL,
        max_tokens: args.maxTokens ?? 64000,
        system: args.system,
        thinking: { type: 'adaptive' },
        messages: args.messages,
      })
    } catch (err) {
      wrap(err)
    }

    try {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text
        }
      }
      const final = await stream.finalMessage()
      if (final.stop_reason === 'refusal') throw new RefusalError('anthropic')
    } catch (err) {
      if (err instanceof RefusalError) throw err
      wrap(err)
    }
  },
}

import OpenAI from 'openai'
import {
  NoCredentialsError,
  RefusalError,
  type ChatArgs,
  type GenerateArgs,
  type Provider,
} from './types'

/**
 * Deliberately has no default. OpenAI model ids change often and guessing one
 * produces a confusing 404 at request time, so the provider reports itself
 * unconfigured until OPENAI_MODEL is set explicitly.
 */
const MODEL = process.env.OPENAI_MODEL || ''

/** Optional: only meaningful on reasoning models, so it is opt-in. */
const REASONING_EFFORT = process.env.OPENAI_REASONING_EFFORT || ''

let _client: OpenAI | null = null

function openai(): OpenAI {
  if (!_client) _client = new OpenAI()
  return _client
}

function isOpenAiCredentialFailure(err: unknown): boolean {
  if (err instanceof OpenAI.AuthenticationError) return true
  if (err instanceof OpenAI.PermissionDeniedError) return true
  if (err instanceof OpenAI.APIConnectionError) return true
  if (err instanceof Error && /OPENAI_API_KEY|apiKey|authentication/i.test(err.message)) return true
  return false
}

function wrap(err: unknown): never {
  if (isOpenAiCredentialFailure(err)) throw new NoCredentialsError('openai', err)
  throw err
}

/** A 400 that means "this schema is not acceptable" rather than "your request was malformed". */
function isSchemaRejection(err: unknown): boolean {
  return (
    err instanceof OpenAI.BadRequestError &&
    /schema|json_schema|response_format|too (deep|many)|nesting/i.test(err.message)
  )
}

/**
 * OpenAI strict mode requires exactly what our schema-utils object() helper
 * already produces — every key in `required`, `additionalProperties: false` —
 * so the schemas pass through unchanged. It also caps nesting depth and total
 * property count, which the larger intelligence schemas can exceed; that case
 * degrades to json_object mode below rather than failing the request.
 */
function strictFormat(schema: Record<string, unknown>) {
  return {
    type: 'json_schema' as const,
    json_schema: { name: 'report', schema, strict: true },
  }
}

export const openaiProvider: Provider = {
  name: 'openai',
  supportsSchema: true,

  configured() {
    return Boolean(process.env.OPENAI_API_KEY) && Boolean(MODEL)
  },

  async generateJson(args: GenerateArgs): Promise<string> {
    const base = {
      model: MODEL,
      max_completion_tokens: args.maxTokens ?? 16000,
      messages: [
        { role: 'system' as const, content: args.system },
        { role: 'user' as const, content: args.prompt },
      ],
      ...(REASONING_EFFORT ? { reasoning_effort: REASONING_EFFORT as 'low' | 'medium' | 'high' } : {}),
    }

    const read = (completion: OpenAI.Chat.Completions.ChatCompletion): string => {
      const choice = completion.choices[0]
      if (choice?.message?.refusal) throw new RefusalError('openai')
      const text = choice?.message?.content
      if (!text) throw new Error('Empty response from OpenAI.')
      return text
    }

    try {
      return read(
        await openai().chat.completions.create({
          ...base,
          response_format: strictFormat(args.schema),
        }),
      )
    } catch (err) {
      if (err instanceof RefusalError) throw err

      if (isSchemaRejection(err)) {
        // The schema exceeded a strict-mode limit. Fall back to plain JSON mode
        // with the schema inlined, then verify it parses — the guarantee is lost,
        // so a bad payload has to surface rather than reach the UI half-formed.
        const completion = await openai()
          .chat.completions.create({
            ...base,
            response_format: { type: 'json_object' },
            messages: [
              base.messages[0],
              {
                role: 'user' as const,
                content: `${args.prompt}\n\nReturn JSON matching this schema exactly. Every key is required.\n\n${JSON.stringify(
                  args.schema,
                )}`,
              },
            ],
          })
          .catch(wrap)

        const text = read(completion)
        JSON.parse(text) // throws on malformed output rather than passing it on
        return text
      }

      wrap(err)
    }
  },

  async *streamText(args: ChatArgs): AsyncIterable<string> {
    let stream
    try {
      stream = await openai().chat.completions.create({
        model: MODEL,
        max_completion_tokens: args.maxTokens ?? 16000,
        stream: true,
        messages: [
          { role: 'system', content: args.system },
          ...args.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        ...(REASONING_EFFORT ? { reasoning_effort: REASONING_EFFORT as 'low' | 'medium' | 'high' } : {}),
      })
    } catch (err) {
      wrap(err)
    }

    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta
        if (delta?.refusal) throw new RefusalError('openai')
        if (delta?.content) yield delta.content
      }
    } catch (err) {
      if (err instanceof RefusalError) throw err
      wrap(err)
    }
  },
}

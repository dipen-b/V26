/**
 * The contract every AI provider implements.
 *
 * Callers never see this — they use generate()/chatStream() from '@/lib/ai',
 * which walks a configured chain of providers. Adding a provider means adding
 * one file here and one entry in the registry.
 */

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export type GenerateArgs = {
  system: string
  prompt: string
  /** Restricted JSON Schema: every key required, additionalProperties false. */
  schema: Record<string, unknown>
  effort?: Effort
  maxTokens?: number
}

export type ChatArgs = {
  system: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  maxTokens?: number
}

export type Provider = {
  name: string
  /** False when the provider cannot guarantee schema conformance and must be parse-checked. */
  supportsSchema: boolean
  /** True when credentials for this provider are plausibly present. */
  configured(): boolean
  /** Returns raw JSON text matching the schema. Throws on failure. */
  generateJson(args: GenerateArgs): Promise<string>
  /** Yields plain text chunks as they arrive. */
  streamText(args: ChatArgs): AsyncIterable<string>
}

/** Signals "this provider has no working credentials", so the chain moves on. */
export class NoCredentialsError extends Error {
  constructor(provider: string, cause?: unknown) {
    super(`No working credentials for provider "${provider}"`)
    this.name = 'NoCredentialsError'
    this.cause = cause
  }
}

/** Signals the model declined the request. Never retried on another provider. */
export class RefusalError extends Error {
  constructor(provider: string) {
    super(`Provider "${provider}" declined the request`)
    this.name = 'RefusalError'
  }
}

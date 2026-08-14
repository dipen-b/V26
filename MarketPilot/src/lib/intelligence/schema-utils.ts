/**
 * Helpers for building Anthropic structured-output schemas.
 *
 * Structured outputs accept a restricted JSON Schema subset: every object needs
 * `additionalProperties: false` and an explicit `required` list, and numeric or
 * string constraints (minimum, maxLength, …) are NOT supported. `object()`
 * enforces the first two rules; keep field descriptions in the prompt rather
 * than reaching for unsupported keywords.
 */

export const str = { type: 'string' } as const
export const num = { type: 'number' } as const
export const int = { type: 'integer' } as const
export const bool = { type: 'boolean' } as const
export const strArray = { type: 'array', items: { type: 'string' } } as const

/** Every key is required — the model must fill each field, or say so in prose. */
export function object<T extends Record<string, unknown>>(properties: T) {
  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  } as const
}

export function arrayOf(items: unknown) {
  return { type: 'array', items } as const
}

export function enumOf(...values: string[]) {
  return { type: 'string', enum: values } as const
}

/** 0–100 scores are plain integers; the range lives in the prompt, not the schema. */
export const score = int

export const LEVEL = ['high', 'medium', 'low'] as const

/** Shared shape for every recommendation surfaced across the report. */
export const OPPORTUNITY_SCHEMA = object({
  title: str,
  impact: enumOf(...LEVEL),
  effort: enumOf(...LEVEL),
  rationale: str,
  estimated_impact: str,
})

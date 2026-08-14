import { NextResponse } from 'next/server'
import { HttpError } from './auth'

export function ok(data: unknown, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 })
}

export function fail(status: number, message: string) {
  return NextResponse.json({ error: message }, { status })
}

/** Wraps a route handler so HttpError becomes the right status code. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, err.message)
    console.error('[marketpilot] route error:', err)
    return fail(500, err instanceof Error ? err.message : 'Something went wrong.')
  }
}

export async function body<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T
  } catch {
    throw new HttpError(400, 'Expected a JSON body.')
  }
}

export function requireFields<T extends Record<string, unknown>>(input: T, fields: (keyof T)[]) {
  for (const field of fields) {
    const value = input[field]
    if (value === undefined || value === null || String(value).trim() === '') {
      throw new HttpError(400, `Missing required field: ${String(field)}`)
    }
  }
}

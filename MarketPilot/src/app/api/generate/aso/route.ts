import { HttpError, requireCapability, requireWorkspace } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { generate } from '@/lib/ai'
import { ASO_SCHEMA, ASO_SYSTEM, brandContext, mockAso } from '@/lib/prompts'
import { saveAsset } from '@/lib/assets'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STORES: Record<string, string> = {
  ios: 'Apple App Store',
  android: 'Google Play Store',
}

type Payload = {
  workspaceId: string
  store: keyof typeof STORES
  appName: string
  currentTitle?: string
  shortDescription?: string
  longDescription?: string
  keywords?: string
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCapability('aso')
    const input = await body<Payload>(req)
    requireFields(input, ['workspaceId', 'store', 'appName'])

    const storeLabel = STORES[input.store]
    if (!storeLabel) throw new HttpError(400, 'Store must be ios or android.')
    const workspace = requireWorkspace(user, input.workspaceId)

    const listing = [
      `App name: ${input.appName}`,
      input.currentTitle && `Current store title: ${input.currentTitle}`,
      input.shortDescription && `Current short description / subtitle: ${input.shortDescription}`,
      input.longDescription && `Current long description:\n${input.longDescription}`,
      input.keywords && `Current keyword field: ${input.keywords}`,
    ]
      .filter(Boolean)
      .join('\n')

    const result = await generate({
      system: ASO_SYSTEM,
      prompt: `Optimize this ${storeLabel} listing.

${listing}

## Brand
${brandContext(workspace)}

Set "store" to "${storeLabel}". If a listing field was not provided, write the recommendation from scratch and say so in the summary.`,
      schema: ASO_SCHEMA,
      fallback: mockAso(storeLabel, input.appName),
      effort: 'high',
    })

    const asset = saveAsset({
      workspaceId: input.workspaceId,
      userId: user.id,
      module: 'aso',
      platform: input.store,
      title: `${storeLabel} — ${input.appName}`,
      payload: result.data,
    })

    return ok({ asset, data: result.data, source: result.source, warning: result.error }, 201)
  })
}

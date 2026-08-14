import { HttpError, requireCapability, requireWorkspace } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { generate } from '@/lib/ai'
import { brandContext, mockSocial, SOCIAL_SCHEMA, SOCIAL_SYSTEM } from '@/lib/prompts'
import { saveAsset } from '@/lib/assets'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const PLATFORMS: Record<string, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  youtube: 'YouTube',
}

type Payload = {
  workspaceId: string
  platform: keyof typeof PLATFORMS
  horizon: 7 | 30 | 90
  topics?: string
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCapability('social')
    const input = await body<Payload>(req)
    requireFields(input, ['workspaceId', 'platform', 'horizon'])

    const platformLabel = PLATFORMS[input.platform]
    if (!platformLabel) throw new HttpError(400, 'Unsupported social platform.')
    if (![7, 30, 90].includes(Number(input.horizon))) {
      throw new HttpError(400, 'Horizon must be 7, 30, or 90 days.')
    }
    const horizon = Number(input.horizon)
    const workspace = requireWorkspace(user, input.workspaceId)

    const result = await generate({
      system: SOCIAL_SYSTEM,
      prompt: `Build a ${horizon}-day ${platformLabel} content calendar.

${input.topics ? `Themes to cover: ${input.topics}` : 'Choose themes that fit the brand and its audience.'}

## Brand
${brandContext(workspace)}

Set "platform" to "${platformLabel}" and "horizon_days" to ${horizon}.`,
      schema: SOCIAL_SCHEMA,
      fallback: mockSocial(platformLabel, horizon, workspace.name),
    })

    const asset = saveAsset({
      workspaceId: input.workspaceId,
      userId: user.id,
      module: 'social',
      platform: input.platform,
      title: `${platformLabel} — ${horizon}-day calendar`,
      payload: result.data,
    })

    return ok({ asset, data: result.data, source: result.source, warning: result.error }, 201)
  })
}

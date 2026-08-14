import { HttpError, requireCapability, requireWorkspace } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'
import { generate } from '@/lib/ai'
import { AD_SCHEMA, AD_SYSTEM, brandContext, mockAds } from '@/lib/prompts'
import { saveAsset } from '@/lib/assets'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const PLATFORMS: Record<string, string> = {
  meta: 'Meta Ads (Facebook & Instagram feed placements)',
  google_search: 'Google Search ads',
  google_display: 'Google Display and Performance Max assets',
  tiktok: 'TikTok Ads (hooks and video scripts)',
  youtube: 'YouTube Ads (video scripts and storyboards)',
}

type Payload = {
  workspaceId: string
  platform: keyof typeof PLATFORMS
  product: string
  objective?: string
  audience?: string
  variants?: number
}

export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCapability('ads')
    const input = await body<Payload>(req)
    requireFields(input, ['workspaceId', 'platform', 'product'])

    const platformLabel = PLATFORMS[input.platform]
    if (!platformLabel) throw new HttpError(400, 'Unsupported ad platform.')

    const workspace = requireWorkspace(user, input.workspaceId)
    const count = Math.min(Math.max(input.variants ?? 4, 2), 6)

    const result = await generate({
      system: AD_SYSTEM,
      prompt: `Generate ${count} ad variants for ${platformLabel}.

What is being advertised: ${input.product}
Campaign objective: ${input.objective || 'Drive qualified signups or installs from cold traffic'}
${input.audience ? `Audience: ${input.audience}` : ''}

## Brand
${brandContext(workspace)}

Set the "platform" field to "${platformLabel}". Each variant must test a different psychological angle.`,
      schema: AD_SCHEMA,
      fallback: mockAds(platformLabel, input.product),
    })

    const asset = saveAsset({
      workspaceId: input.workspaceId,
      userId: user.id,
      module: 'ads',
      platform: input.platform,
      title: `${platformLabel} — ${input.product}`.slice(0, 120),
      payload: result.data,
    })

    return ok({ asset, data: result.data, source: result.source, warning: result.error }, 201)
  })
}

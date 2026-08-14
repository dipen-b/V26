import { createWorkspace, listWorkspaces, requireCapability, requireUser } from '@/lib/auth'
import { body, handle, ok, requireFields } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Payload = {
  name: string
  industry?: string
  website?: string
  audience?: string
  isClient?: boolean
}

export async function GET() {
  return handle(async () => {
    const user = await requireUser()
    return ok({ workspaces: listWorkspaces(user.id) })
  })
}

export async function POST(req: Request) {
  return handle(async () => {
    const input = await body<Payload>(req)
    requireFields(input, ['name'])

    // Only Founders and Agency Owners may create workspaces; a client workspace
    // additionally requires the agency capability.
    const user = await requireCapability(input.isClient ? 'workspace:clients' : 'workspace:create')

    const workspace = createWorkspace(user.id, user.role, {
      name: input.name.trim(),
      industry: input.industry,
      website: input.website,
      audience: input.audience,
      isClient: input.isClient,
    })
    return ok({ workspace }, 201)
  })
}

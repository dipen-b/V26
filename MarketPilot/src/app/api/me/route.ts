import { listWorkspaces, requireUser } from '@/lib/auth'
import { handle, ok } from '@/lib/api'
import { capabilitiesOf } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return handle(async () => {
    const user = await requireUser()
    return ok({
      user,
      workspaces: listWorkspaces(user.id),
      capabilities: capabilitiesOf(user.role),
    })
  })
}

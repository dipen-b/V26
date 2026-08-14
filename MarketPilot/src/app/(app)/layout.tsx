import { redirect } from 'next/navigation'
import { currentUser, listWorkspaces } from '@/lib/auth'
import { capabilitiesOf } from '@/lib/types'
import { AppProvider } from '@/components/app-provider'
import { Shell } from '@/components/shell'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (!user) redirect('/login')

  return (
    <AppProvider user={user} capabilities={capabilitiesOf(user.role)} workspaces={listWorkspaces(user.id)}>
      <Shell>{children}</Shell>
    </AppProvider>
  )
}

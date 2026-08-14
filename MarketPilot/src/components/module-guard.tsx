'use client'

import { useApp } from './app-provider'
import { EmptyState } from './ui'
import { IconSettings } from './icons'
import type { Capability } from '@/lib/types'

/**
 * Client-side mirror of the server capability check. The API enforces access
 * independently — this just avoids showing a module the role cannot use.
 */
export function ModuleGuard({
  capability,
  children,
}: {
  capability: Capability
  children: React.ReactNode
}) {
  const { can, user } = useApp()
  if (can(capability)) return <>{children}</>

  return (
    <EmptyState
      icon={<IconSettings className="h-5 w-5" />}
      title="This module is not available on your role"
      description={`Your account is set up as ${user.role.replace(
        /_/g,
        ' ',
      )}. Ask a Founder or Agency Owner on your team to upgrade your access.`}
    />
  )
}

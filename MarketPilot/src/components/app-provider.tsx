'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Capability, SessionUser, Workspace } from '@/lib/types'

type AppState = {
  user: SessionUser
  capabilities: Capability[]
  workspaces: Workspace[]
  workspace: Workspace
  setWorkspaceId: (id: string) => void
  addWorkspace: (workspace: Workspace) => void
  can: (capability: Capability) => boolean
}

const Ctx = createContext<AppState | null>(null)

const STORAGE_KEY = 'marketpilot:workspace'

export function AppProvider({
  user,
  capabilities,
  workspaces: initialWorkspaces,
  children,
}: {
  user: SessionUser
  capabilities: Capability[]
  workspaces: Workspace[]
  children: React.ReactNode
}) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces)
  const [workspaceId, setWorkspaceIdState] = useState(initialWorkspaces[0]?.id ?? '')

  // Restore the last-used workspace after mount so server and client render
  // the same markup on the first pass.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && workspaces.some((w) => w.id === stored)) setWorkspaceIdState(stored)
  }, [workspaces])

  const setWorkspaceId = useCallback((id: string) => {
    setWorkspaceIdState(id)
    window.localStorage.setItem(STORAGE_KEY, id)
  }, [])

  const addWorkspace = useCallback(
    (workspace: Workspace) => {
      setWorkspaces((list) => [...list, workspace])
      setWorkspaceId(workspace.id)
    },
    [setWorkspaceId],
  )

  const workspace = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0]

  const value = useMemo<AppState>(
    () => ({
      user,
      capabilities,
      workspaces,
      workspace,
      setWorkspaceId,
      addWorkspace,
      can: (capability) => capabilities.includes(capability),
    }),
    [user, capabilities, workspaces, workspace, setWorkspaceId, addWorkspace],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

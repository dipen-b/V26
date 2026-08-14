export type Role = 'founder' | 'marketing_manager' | 'marketing_executive' | 'agency_owner'

export const ROLES: { value: Role; label: string; blurb: string }[] = [
  {
    value: 'founder',
    label: 'Founder',
    blurb: 'Full access — workspaces, data sources, reports, billing.',
  },
  {
    value: 'marketing_manager',
    label: 'Marketing Manager',
    blurb: 'Campaigns, content, competitor analysis, analytics.',
  },
  {
    value: 'marketing_executive',
    label: 'Marketing Executive',
    blurb: 'Execute assigned work — ads and social content.',
  },
  {
    value: 'agency_owner',
    label: 'Agency Owner',
    blurb: 'Multiple client workspaces, white-label reports.',
  },
]

export type Capability =
  | 'chat'
  | 'competitors'
  | 'intelligence'
  | 'ads'
  | 'social'
  | 'aso'
  | 'analytics'
  | 'workspace:create'
  | 'workspace:clients'
  | 'billing'

/**
 * Capability map straight from the four role definitions in the product spec.
 * Enforced server-side in every route handler, not just hidden in the sidebar.
 */
const MATRIX: Record<Role, Capability[]> = {
  founder: [
    'chat',
    'competitors',
    'intelligence',
    'ads',
    'social',
    'aso',
    'analytics',
    'workspace:create',
    'billing',
  ],
  marketing_manager: ['chat', 'competitors', 'intelligence', 'ads', 'social', 'aso', 'analytics'],
  marketing_executive: ['chat', 'ads', 'social'],
  agency_owner: [
    'chat',
    'competitors',
    'intelligence',
    'ads',
    'social',
    'aso',
    'analytics',
    'workspace:create',
    'workspace:clients',
    'billing',
  ],
}

export function can(role: Role, capability: Capability): boolean {
  return MATRIX[role]?.includes(capability) ?? false
}

export function capabilitiesOf(role: Role): Capability[] {
  return MATRIX[role] ?? []
}

export type SessionUser = {
  id: string
  email: string
  name: string
  role: Role
}

export type Workspace = {
  id: string
  name: string
  owner_id: string
  industry: string
  website: string
  audience: string
  is_client: number
  created_at: string
}

export type ChatMessage = {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type Asset = {
  id: string
  workspace_id: string
  user_id: string
  module: string
  platform: string
  title: string
  payload: string
  created_at: string
}

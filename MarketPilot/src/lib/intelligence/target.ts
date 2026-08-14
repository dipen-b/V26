import type { TargetKind } from './types'

export const TARGET_KINDS: { value: TargetKind; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'landing_page', label: 'Landing page' },
  { value: 'saas_product', label: 'SaaS product' },
  { value: 'play_store', label: 'Play Store listing' },
  { value: 'app_store', label: 'App Store listing' },
]

/** Infers the target type from the URL so the analyst rarely has to pick one. */
export function inferKind(url: string): TargetKind {
  const value = url.toLowerCase()
  if (value.includes('play.google.com')) return 'play_store'
  if (value.includes('apps.apple.com') || value.includes('itunes.apple.com')) return 'app_store'
  return 'website'
}

/** Falls back to the hostname label when the analyst does not name the target. */
export function inferName(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('play.google.com')) {
      const packageId = parsed.searchParams.get('id')
      if (packageId) {
        const last = packageId.split('.').pop() ?? packageId
        return last.charAt(0).toUpperCase() + last.slice(1)
      }
    }
    if (parsed.hostname.includes('apps.apple.com')) {
      // /us/app/<slug>/id123456789
      const slug = parsed.pathname.split('/').find((part) => part && !/^(id\d+|[a-z]{2}|app)$/.test(part))
      if (slug) {
        return slug
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }
    const host = parsed.hostname.replace(/^www\./, '')
    const label = host.split('.')[0]
    return label.charAt(0).toUpperCase() + label.slice(1)
  } catch {
    return 'Competitor'
  }
}

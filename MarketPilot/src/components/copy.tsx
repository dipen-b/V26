'use client'

import { useState } from 'react'
import { IconCopy } from './icons'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        } catch {
          // Clipboard permission denied — leave the label unchanged.
        }
      }}
      className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium text-faint transition hover:bg-elevated hover:text-ink"
    >
      <IconCopy className="h-3.5 w-3.5" />
      {copied ? 'Copied' : label}
    </button>
  )
}

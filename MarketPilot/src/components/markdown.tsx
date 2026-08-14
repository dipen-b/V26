'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/** Renders model output. Raw HTML is not enabled, so model text cannot inject markup. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}

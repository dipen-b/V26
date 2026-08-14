import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'MarketPilot AI — AI Marketing Operating System',
  description:
    'Tell the AI your goal. MarketPilot analyzes, plans, generates, and optimizes your marketing — competitor intelligence, ad creative, social content, ASO, and analytics in one workspace.',
}

export const viewport: Viewport = {
  themeColor: '#0F172A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

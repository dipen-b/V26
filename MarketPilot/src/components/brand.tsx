export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none">
        <path
          d="M4 19 12 5l8 14-8-4-8 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Logo size={size} />
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        MarketPilot <span className="text-muted">AI</span>
      </span>
    </span>
  )
}

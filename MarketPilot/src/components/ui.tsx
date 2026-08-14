'use client'

import clsx from 'clsx'
import { forwardRef } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

// --- Button -----------------------------------------------------------------

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
        variant === 'primary' &&
          'bg-primary text-white hover:bg-primary/85 active:bg-primary/95 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset]',
        variant === 'secondary' && 'border border-line bg-elevated text-ink hover:border-primary/50 hover:bg-elevated/70',
        variant === 'ghost' && 'text-muted hover:bg-elevated hover:text-ink',
        variant === 'danger' && 'bg-error text-white hover:bg-error/85',
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
})

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={clsx('h-4 w-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// --- Surfaces ---------------------------------------------------------------

export function Card({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('rounded-xl border border-line bg-card', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight text-ink">{title}</h3>
        {subtitle && <p className="mt-1 text-[13px] leading-5 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-8 py-6">
      <div className="max-w-2xl">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </div>
  )
}

// --- Form controls ----------------------------------------------------------

const controlClass =
  'w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-faint transition focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={clsx(controlClass, 'h-10', className)} {...rest} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={clsx(controlClass, 'resize-none', className)} {...rest} />
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={clsx(controlClass, 'h-10 appearance-none pr-8', className)} {...rest}>
      {children}
    </select>
  )
})

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
    </label>
  )
}

// --- Feedback ---------------------------------------------------------------

const TONES = {
  neutral: 'border-line bg-elevated text-muted',
  primary: 'border-primary-border bg-primary-soft text-primary',
  success: 'border-success/40 bg-success-soft text-success',
  warning: 'border-warning/40 bg-warning-soft text-warning',
  error: 'border-error/40 bg-error-soft text-error',
} as const

export type Tone = keyof typeof TONES

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        TONES[tone],
      )}
    >
      {children}
    </span>
  )
}

export function Alert({ tone = 'error', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={clsx('rounded-lg border px-3.5 py-2.5 text-[13px] leading-5', TONES[tone])}>{children}</div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-elevated text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Marks output that came from built-in fixtures rather than a live model call. */
export function SourceBadge({ source }: { source: 'live' | 'fallback' }) {
  return source === 'live' ? (
    <Badge tone="success">Live AI</Badge>
  ) : (
    <Badge tone="warning">Demo content</Badge>
  )
}

export function ImpactBadge({ level }: { level: string }) {
  const tone: Tone = level === 'high' ? 'success' : level === 'medium' ? 'warning' : 'neutral'
  return <Badge tone={tone}>{level}</Badge>
}

/** Small labelled list used across the module reports. */
export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[13px] leading-5 text-ink/85">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

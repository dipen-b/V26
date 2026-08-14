import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette from the MarketPilot AI product spec.
        primary: {
          DEFAULT: '#4F46E5',
          soft: 'rgba(79, 70, 229, 0.14)',
          border: 'rgba(79, 70, 229, 0.38)',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          soft: 'rgba(124, 58, 237, 0.14)',
        },
        success: { DEFAULT: '#10B981', soft: 'rgba(16, 185, 129, 0.14)' },
        warning: { DEFAULT: '#F59E0B', soft: 'rgba(245, 158, 11, 0.14)' },
        error: { DEFAULT: '#EF4444', soft: 'rgba(239, 68, 68, 0.14)' },
        canvas: '#0F172A',
        card: '#1E293B',
        ink: '#F8FAFC',
        // Derived neutrals that keep the surface hierarchy readable.
        elevated: '#243247',
        line: 'rgba(248, 250, 252, 0.10)',
        muted: 'rgba(248, 250, 252, 0.62)',
        faint: 'rgba(248, 250, 252, 0.42)',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'fade-up': 'fade-up 200ms ease-out',
        'pulse-soft': 'pulse-soft 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config

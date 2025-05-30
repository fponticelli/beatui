// Color Design Tokens
// TypeScript-defined colors that generate CSS variables at build time

export const colors = {
  // Primary color scale
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Secondary color scale
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Neutral/Gray scale
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
} as const

// CSS Variable accessors
export const colorPrimary = 'var(--color-primary-500)'
export const colorSecondary = 'var(--color-secondary-500)'
export const colorNeutral = 'var(--color-neutral-500)'
export const colorSuccess = 'var(--color-success-500)'
export const colorWarning = 'var(--color-warning-500)'
export const colorError = 'var(--color-error-500)'
export const colorInfo = 'var(--color-info-500)'

// Background colors
export const colorBackground = 'var(--color-neutral-50)'
export const colorBackgroundDark = 'var(--color-neutral-900)'
export const colorSurface = 'var(--color-neutral-100)'
export const colorSurfaceDark = 'var(--color-neutral-800)'

// Text colors
export const colorText = 'var(--color-neutral-900)'
export const colorTextDark = 'var(--color-neutral-100)'
export const colorTextMuted = 'var(--color-neutral-600)'
export const colorTextMutedDark = 'var(--color-neutral-400)'

// Border colors
export const colorBorder = 'var(--color-neutral-200)'
export const colorBorderDark = 'var(--color-neutral-700)'

// Helper function to get color CSS variable
export function getColorVar(
  color: keyof typeof colors,
  shade: keyof typeof colors.primary
): string {
  return `var(--color-${color}-${shade})`
}

// Generate CSS variables from color tokens
export function generateColorVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  Object.entries(colors).forEach(([colorName, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      variables[`--color-${colorName}-${shade}`] = value
    })
  })

  return variables
}

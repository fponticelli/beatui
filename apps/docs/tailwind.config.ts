import type { Config } from 'tailwindcss'
import { beatuiPreset } from '@tempots/beatui/tailwind'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  presets: [beatuiPreset()],
  darkMode: ['class', '.b-dark'],
} satisfies Config

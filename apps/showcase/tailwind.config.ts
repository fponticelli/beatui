import { beatuiPreset } from '@tempots/beatui/tailwind/preset'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,js,tsx,jsx,md,mdx}'],
  presets: [beatuiPreset],
}

export default config

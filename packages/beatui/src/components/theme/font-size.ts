import { ControlSize } from './types'

const CONTROL_FONT_SIZE_MAP: Record<ControlSize, string> = {
  xs: 'var(--font-size-xs)',
  sm: 'var(--font-size-sm)',
  md: 'var(--font-size-base)',
  lg: 'var(--font-size-lg)',
  xl: 'var(--font-size-xl)',
}

export function controlFontSize(size: ControlSize): string {
  return CONTROL_FONT_SIZE_MAP[size]
}

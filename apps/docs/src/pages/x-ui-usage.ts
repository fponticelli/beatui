import { attr } from '@tempots/dom'
import { Stack } from '@tempots/beatui'
// Import markdown as raw string via Vite
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite adds the ?raw loader
import content from '../content/x-ui-usage.md?raw'
import { Markdown } from '@tempots/beatui/markdown'

export default function XUIUsagePage() {
  return Stack(
    attr.class('p-4 gap-4 h-full overflow-auto'),
    Markdown({ content, features: { gfm: true } })
  )
}

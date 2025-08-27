import { AppearancePreference, Theme } from '@/components/theme'
import { attr, html, TNode, Use, Value } from '@tempots/dom'
import { Icon } from '@/components/data'
import { SegmentedInput } from './segmented-input'

export type AppearanceSelectorOptions = {
  value: Value<AppearancePreference>
  onChange?: (value: AppearancePreference) => void
}

export function AppearanceSelector({
  value,
  onChange,
}: AppearanceSelectorOptions) {
  return SegmentedInput<Record<AppearancePreference, TNode>>({
    size: 'sm',
    value,
    options: {
      system: html.span(
        attr.title('System'),
        Icon({ icon: 'line-md:laptop', color: 'gray' })
      ),
      light: html.span(
        attr.title('Light'),
        Icon({ icon: 'line-md:sunny-twotone-loop', color: 'yellow' })
      ),
      dark: html.span(
        attr.title('Dark'),
        Icon({
          icon: 'line-md:sunny-outline-to-moon-alt-loop-transition',
          color: 'blue',
        })
      ),
    },
    onChange,
  })
}

export function StandaloneAppearanceSelector() {
  return Use(Theme, ({ appearancePreference, setAppearancePreference }) =>
    AppearanceSelector({
      value: appearancePreference,
      onChange: setAppearancePreference,
    })
  )
}

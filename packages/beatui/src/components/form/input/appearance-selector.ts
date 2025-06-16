import { AppearancePreference, Theme } from '@/components/theme'
import { attr, html, TNode, Use, Value } from '@tempots/dom'
import { SegmentedControl } from '../control'
import { Icon } from '@/components/data'

export type AppearanceSelectorOptions = {
  value: Value<AppearancePreference>
  onChange?: (value: AppearancePreference) => void
}

export function AppearanceSelector({
  value,
  onChange,
}: AppearanceSelectorOptions) {
  return SegmentedControl<Record<AppearancePreference, TNode>>({
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
    // segments: [
    //   {
    //     label: html.span(
    //       attr.title('System'),
    //       Icon({ icon: 'line-md:laptop', color: 'gray' })
    //     ),
    //     onSelect: () => onChange?.('system'),
    //   },
    //   {
    //     label: html.span(
    //       attr.title('Light'),
    //       Icon({ icon: 'line-md:sunny-twotone-loop', color: 'yellow' })
    //     ),
    //     onSelect: () => onChange?.('light'),
    //   },
    //   {
    //     label: html.span(
    //       attr.title('Dark'),
    //       Icon({
    //         icon: 'line-md:sunny-outline-to-moon-alt-loop-transition',
    //         color: 'blue',
    //       })
    //     ),
    //     onSelect: () => onChange?.('dark'),
    //   },
    // ],
    // activeSegment: Value.map(value, (v): number => {
    //   if (v === 'system') {
    //     return 0
    //   }
    //   if (v === 'light') {
    //     return 1
    //   }
    //   return 2
    // }),
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

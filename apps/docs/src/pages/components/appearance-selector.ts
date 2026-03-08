import {
  AppearanceSelector,
  StandaloneAppearanceSelector,
} from '@tempots/beatui'
import type { AppearancePreference } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'AppearanceSelector',
  category: 'Selection',
  component: 'AppearanceSelector',
  description:
    'A segmented input for selecting the application appearance: light, dark, or system. Connects to the theme provider or can be controlled manually.',
  icon: 'lucide:sun-moon',
  order: 14,
}

export default function AppearanceSelectorPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('AppearanceSelector', signals => {
      const value = signals.value as Prop<AppearancePreference>
      return AppearanceSelector({
        ...signals,
        value,
        onChange: (v: AppearancePreference) => value.set(v),
      })
    }),
    sections: [
      Section(
        'Controlled',
        () => {
          const pref = prop<AppearancePreference>('system')
          return html.div(
            attr.class('flex flex-col gap-4 items-start'),
            AppearanceSelector({
              value: pref,
              onChange: pref.set,
            })
          )
        },
        'Use AppearanceSelector with a controlled value prop and onChange callback to manage the preference externally.'
      ),
      Section(
        'Standalone (Theme-Connected)',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 items-start'),
            StandaloneAppearanceSelector({ size: 'sm' })
          ),
        'StandaloneAppearanceSelector automatically reads and writes the appearance preference from the Theme provider — no props required.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 items-start'),
            AppearanceSelector({
              value: prop<AppearancePreference>('system'),
              onChange: () => {},
              disabled: true,
            })
          ),
        'AppearanceSelector supports a disabled state that prevents the user from changing the appearance.'
      ),
      Section(
        'All Preferences',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 items-start'),
            ...(['system', 'light', 'dark'] as const).map(pref =>
              html.div(
                attr.class('flex items-center gap-3'),
                html.div(
                  attr.class('text-xs font-mono text-gray-500 w-12'),
                  pref
                ),
                AppearanceSelector({
                  value: prop<AppearancePreference>(pref),
                  onChange: () => {},
                })
              )
            )
          ),
        'The three appearance preferences are system (follows OS), light, and dark.'
      ),
    ],
  })
}

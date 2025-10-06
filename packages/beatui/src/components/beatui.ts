import { Fragment, Provide, Task, TNode, WithProvider } from '@tempots/dom'
import { Theme, ThemeAppearance } from './theme'
import { Locale } from '@/components/i18n'
import { Location, NavigationService } from '@tempots/ui'
import { BeatUII18n } from '@/beatui-i18n'
import { LocaleDirection } from './i18n/locale-direction'

export type BeatUIOptions = {
  includeAuthI18n?: boolean
}

export function BeatUI(
  { includeAuthI18n = false }: BeatUIOptions,
  ...children: TNode[]
) {
  return WithProvider(({ set, use }) => {
    set(Location, {})
    set(Locale, {})
    set(BeatUII18n, {})
    set(Theme, {})
    NavigationService.attach(use(Location))
    const fragment = Fragment(ThemeAppearance(), LocaleDirection(), ...children)
    if (includeAuthI18n) {
      return Task(
        () => import('@/auth-i18n/translations'),
        ({ AuthI18n }) => {
          return Provide(AuthI18n, {}, () => fragment)
        }
      )
    } else {
      return fragment
    }
  })
}

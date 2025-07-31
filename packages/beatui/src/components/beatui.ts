import { Fragment, TNode, WithProvider } from '@tempots/dom'
import { Theme, ThemeAppearance } from './theme'
import { Locale } from '@/components/i18n'
import { Location } from '@tempots/ui'
import { BeatUII18n } from '@/beatui-i18n'
import { LocaleDirection } from './i18n/locale-direction'

export function BeatUI(...children: TNode[]) {
  return WithProvider(({ set }) => {
    set(Location, {})
    set(Locale, {})
    set(BeatUII18n, {})
    set(Theme, {})
    return Fragment(ThemeAppearance(), LocaleDirection(), ...children)
  })
}

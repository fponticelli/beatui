import { Fragment, TNode, WithProvider } from '@tempots/dom'
import { Theme, ThemeAppearance } from './theme'
import { Locale } from '@/i18n'
import { Location } from '@tempots/ui'

export function BeatUI(...children: TNode[]) {
  return WithProvider(({ set }) => {
    set(Theme, {})
    set(Locale, {})
    set(Location, {})
    return Fragment(ThemeAppearance(), ...children)
  })
}

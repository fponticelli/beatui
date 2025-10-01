import { Locale } from '@/components/i18n'
import { InputWrapper, NativeSelect } from '../form'
import { attr, Use, Value } from '@tempots/dom'
import { BeatUII18n } from '@/beatui-i18n'
import { Group } from '../layout'
import { Icon } from '../data'
import { Option, SelectOption } from '../form/input/option'

export type LocaleItem = {
  code: string
  name: string
  nativeName?: string
}

export type LocaleSelectorOptions = {
  locales: Value<LocaleItem[]>
  onChange?: (locale: string) => void
  updateLocale?: boolean
}

export function LocaleSelector({
  locales,
  onChange,
  updateLocale = true,
}: LocaleSelectorOptions) {
  return Use(BeatUII18n, t =>
    Use(Locale, ({ locale, setLocale }) => {
      return InputWrapper({
        horizontal: true,
        content: Group(
          attr.class('bc-group--align-center bc-group--gap-2'),
          Icon({
            icon: 'ic:twotone-language',
            size: 'lg',
            color: 'neutral',
            title: t.$.locale as Value<string | undefined>,
          }),
          NativeSelect({
            options: Value.map(locales, locales =>
              locales.map(l => {
                let name = l.name
                if (l.nativeName != null && l.nativeName !== l.name) {
                  name += ` (${l.nativeName})`
                }
                return Option.value(l.code, name) as SelectOption<string>
              })
            ),
            value: locale,
            onChange: value => {
              if (updateLocale) {
                setLocale(value)
              }
              onChange?.(value)
            },
          })
        ),
      })
    })
  )
}

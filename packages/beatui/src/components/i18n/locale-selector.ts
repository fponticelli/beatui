import { Locale } from '@/i18n'
import { InputWrapper, NativeSelect, SelectOption } from '../form'
import { Use, Value } from '@tempots/dom'
import { BeatUII18n } from '@/beatui-i18n'

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
        label: t.locale(),
        content: NativeSelect({
          options: Value.map(locales, locales =>
            locales.map(l => {
              let name = l.name
              if (l.nativeName != null && l.nativeName !== l.name) {
                name += ` (${l.nativeName})`
              }
              return SelectOption.value(l.code, name) as SelectOption<string>
            })
          ),
          value: locale,
          onChange: value => {
            if (updateLocale) {
              setLocale(value)
            }
            onChange?.(value)
          },
        }),
      })
    })
  )
}

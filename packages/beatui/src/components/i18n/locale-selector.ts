import { Locale } from '@/i18n'
import { InputWrapper, NativeSelect, SelectOption } from '../form'
import { Use } from '@tempots/dom'
import { BeatUII18n } from '@/beatui-i18n'

export type LocalePair = {
  code: string
  name: string
}

export type LocaleSelectorOptions = {
  locales: LocalePair[]
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
          options: locales.map(l => SelectOption.value(l.code, l.name)),
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

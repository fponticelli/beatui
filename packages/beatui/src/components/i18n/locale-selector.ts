import { Locale } from '@/i18n'
import { InputWrapper, NativeSelect, SelectOption } from '../form'
import { Use } from '@tempots/dom'

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
  return Use(Locale, ({ locale, setLocale }) => {
    return InputWrapper({
      label: 'Locale',
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
}

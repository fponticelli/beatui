import { makeMessages, ReactiveMessages } from '@/i18n'
import { makeProviderMark, Provider } from '@tempots/dom'
import { Locale } from './locale'

export function makeI18nProvider<M extends object>({
  defaultLocale,
  defaultMessages,
  localeLoader,
  providerName = 'I18nProvider',
}: {
  defaultLocale: string
  defaultMessages: M
  localeLoader: (locale: string) => Promise<M>
  providerName?: string
}): Provider<ReactiveMessages<M>, object> {
  return {
    mark: makeProviderMark(providerName),
    create: (_options: unknown, ctx) => {
      const {
        value: { locale },
      } = ctx.getProvider(Locale.mark)
      const { t, dispose } = makeMessages({
        locale,
        defaultMessages,
        defaultLocale,
        localeLoader,
      })
      return {
        value: t,
        dispose,
      }
    },
  }
}

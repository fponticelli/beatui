import { defaultLocale, defaultMessages, Messages } from './default'
import { makeI18nProvider } from '@/components/i18n'

export const BeatUII18n = makeI18nProvider<Messages>({
  defaultLocale,
  defaultMessages,
  localeLoader: locale => import(`./locales/${locale}.ts`),
  providerName: 'BeatUII18n',
})

import { defaultLocale, defaultMessages, BeatUIMessages } from './default'
import { makeI18nProvider } from '../components/i18n'

export const BeatUII18n = makeI18nProvider<BeatUIMessages>({
  defaultLocale,
  defaultMessages,
  localeLoader: async locale =>
    (await import(`./locales/${locale}.ts`)).default,
  providerName: 'BeatUII18n',
})

import { defaultLocale, defaultMessages, AuthMessages } from './default'
import { makeI18nProvider } from '../components/i18n/make-i18nprovider'

export const AuthI18n = makeI18nProvider<AuthMessages>({
  defaultLocale,
  defaultMessages,
  localeLoader: async locale =>
    (await import(`./locales/${locale}.ts`)).default,
  providerName: 'AuthI18n',
})

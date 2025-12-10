import { defaultLocale, defaultMessages, AuthMessages } from './default'
import { makeI18nProvider } from '../components/i18n/make-i18nprovider'

const localeLoaders = import.meta.glob(['./locales/*.ts', '!./locales/en.ts'], {
  import: 'default',
}) as Record<string, () => Promise<AuthMessages>>

export const AuthI18n = makeI18nProvider<AuthMessages>({
  defaultLocale,
  defaultMessages,
  localeLoader: async locale => {
    if (locale === defaultLocale) return defaultMessages
    const load = localeLoaders[`./locales/${locale}.ts`]
    return load ? await load() : defaultMessages
  },
  providerName: 'AuthI18n',
})

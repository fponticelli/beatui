import { defaultLocale, defaultMessages, BetterAuthMessages } from './default'
import { makeI18nProvider } from '../../components/i18n/make-i18nprovider'

const localeLoaders = import.meta.glob(['./locales/*.ts', '!./locales/en.ts'], {
  import: 'default',
}) as Record<string, () => Promise<BetterAuthMessages>>

export const BetterAuthI18n = makeI18nProvider<BetterAuthMessages>({
  defaultLocale,
  defaultMessages,
  localeLoader: async locale => {
    if (locale === defaultLocale) return defaultMessages
    const load = localeLoaders[`./locales/${locale}.ts`]
    return load ? await load() : defaultMessages
  },
  providerName: 'BetterAuthI18n',
})

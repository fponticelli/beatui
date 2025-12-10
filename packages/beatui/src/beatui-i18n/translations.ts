import { defaultLocale, defaultMessages, BeatUIMessages } from './default'
import { makeI18nProvider } from '../components/i18n'

const localeLoaders = import.meta.glob(['./locales/*.ts', '!./locales/en.ts'], {
  import: 'default',
}) as Record<string, () => Promise<BeatUIMessages>>

export const BeatUII18n = makeI18nProvider<BeatUIMessages>({
  defaultLocale,
  defaultMessages,
  localeLoader: async locale => {
    if (locale === defaultLocale) return defaultMessages
    const load = localeLoaders[`./locales/${locale}.ts`]
    return load ? await load() : defaultMessages
  },
  providerName: 'BeatUII18n',
})

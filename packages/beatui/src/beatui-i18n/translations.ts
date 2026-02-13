import { defaultLocale, defaultMessages, BeatUIMessages } from './default'
import { makeI18nProvider } from '../components/i18n'

/**
 * Vite glob import of all locale translation files except the default English locale.
 *
 * Each entry maps a relative module path (e.g., `'./locales/es.ts'`) to a lazy loader
 * function that returns the locale's default export.
 *
 * @internal
 */
const localeLoaders = import.meta.glob(['./locales/*.ts', '!./locales/en.ts'], {
  import: 'default',
}) as Record<string, () => Promise<BeatUIMessages>>

/**
 * The BeatUI internationalization provider.
 *
 * This provider manages the loading and reactive delivery of BeatUI component
 * translations. It lazily loads locale files from the `./locales/` directory
 * and falls back to the default English messages when a locale file is unavailable.
 *
 * Supported locales: `en`, `es`, `fr`, `de`, `it`, `pt`, `ja`, `zh`, `ko`, `ru`,
 * `ar`, `nl`, `pl`, `tr`, `vi`, `hi`, `fa`, `he`, `ur`.
 *
 * Must be used within a `Provide(Locale, ...)` context so it can react to locale changes.
 *
 * @example
 * ```typescript
 * import { Use, Provide } from '@tempots/dom'
 * import { Locale, BeatUII18n } from '@tempots/beatui'
 *
 * Provide(Locale, {}, () =>
 *   Provide(BeatUII18n, {}, () =>
 *     Use(BeatUII18n, t => html.p(t.$.confirm))
 *   )
 * )
 * ```
 */
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

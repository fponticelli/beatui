import { makeMessages } from '../../i18n'
import { makeProviderMark, Provider, Signal } from '@tempots/dom'
import { Locale } from './locale'

/**
 * Creates an i18n provider that manages reactive translations for a given message type.
 *
 * The factory creates a `Provider` that automatically hooks into the `Locale` provider
 * to detect locale changes and dynamically load the corresponding translation messages.
 * It uses `makeMessages` internally for reactive translation management with fallback support.
 *
 * @typeParam M - The shape of the messages object (must extend `object`)
 *
 * @param config - Configuration object for the i18n provider
 * @param config.defaultLocale - The default locale code to use as fallback (e.g., `'en'`)
 * @param config.defaultMessages - The default messages object used before any locale is loaded
 * @param config.localeLoader - Async function that loads messages for a given locale string
 * @param config.providerName - Optional name for the provider mark, used for debugging
 * @default config.providerName `'I18nProvider'`
 *
 * @returns A `Provider<Signal<M>>` that provides a reactive signal of the current messages
 *
 * @example
 * ```typescript
 * import { makeI18nProvider } from '@tempots/beatui'
 *
 * type MyMessages = { greeting: string; farewell: string }
 *
 * const MyI18n = makeI18nProvider<MyMessages>({
 *   defaultLocale: 'en',
 *   defaultMessages: { greeting: 'Hello', farewell: 'Goodbye' },
 *   localeLoader: async (locale) => {
 *     const mod = await import(`./locales/${locale}.ts`)
 *     return mod.default
 *   },
 *   providerName: 'MyI18n',
 * })
 *
 * // Use in a component
 * Use(MyI18n, t => html.p(t.$.greeting))
 * ```
 */
export function makeI18nProvider<M extends object>({
  defaultLocale,
  defaultMessages,
  localeLoader,
  providerName = 'I18nProvider',
}: {
  /** The default locale code to use as fallback (e.g., `'en'`) */
  defaultLocale: string
  /** The default messages object used before any locale is loaded */
  defaultMessages: M
  /** Async function that loads messages for a given locale string */
  localeLoader: (locale: string) => Promise<M>
  /** Optional name for the provider mark, used for debugging. @default 'I18nProvider' */
  providerName?: string
}): Provider<Signal<M>> {
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

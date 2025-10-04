import { prop, Signal } from '@tempots/dom'

/**
 * Gets fallback locales for a given locale string.
 * e.g., 'en-US' -> ['en-US', 'en']
 */
function getLocaleFallbacks(locale: string): string[] {
  const parts = locale.split('-')
  const fallbacks: string[] = [locale]

  // Add base language (e.g., 'en' from 'en-US')
  if (parts.length > 1) {
    fallbacks.push(parts[0])
  }

  return fallbacks
}

/**
 * Creates a reactive translation system that dynamically loads locale-specific messages.
 *
 * Features:
 * - Type-safe translation functions with parameter validation
 * - Dynamic loading of locale-specific message bundles
 * - Reactive translations that update when locale changes
 * - Automatic fallback to default locale on loading errors
 * - Proper cleanup and memory management
 *
 * @param config Configuration object for the translation system
 * @param config.locale Reactive signal containing the current locale
 * @param config.defaultLocale Default locale to fall back to (default: 'en-US')
 * @param config.defaultMessages Default message functions used as fallback
 * @param config.localeLoader Async function to load locale-specific messages
 *
 * @returns Object containing translation functions (`t`) and cleanup (`dispose`)
 *
 * @example
 * ```typescript
 * import { prop, Use } from '@tempots/dom'
 * import { Locale, makeMessages } from '@tempots/beatui'
 *
 * const defaultMessages = {
 *   welcome: () => 'Welcome!',
 *   userGreeting: (name: string) => `Hello, ${name}!`,
 *   itemCount: (count: number) => `${count} item${count !== 1 ? 's' : ''}`
 * }
 *
 * const { locale } = Use(Locale, ({ locale }) => {
 *   // Create translation system
 *   const { t, dispose } = makeMessages({
 *     locale,
 *     defaultMessages,
 *     localeLoader: locale => import(`./locales/${locale}.js`)
 *   })
 *
 *   return html.div(
 *     html.h1(t.welcome()),
 *     html.p(t.userGreeting(prop('User')))
 *   )
 * })
 *
 * // Use reactive translations
 * const greeting = t.greeting(prop('John')) // Signal<string>
 * const count = t.itemCount(prop(5)) // Signal<string>
 *
 * // Clean up when done
 * dispose()
 * ```
 */
export function makeMessages<M extends object>({
  locale,
  defaultLocale = 'en-US',
  defaultMessages,
  localeLoader,
}: {
  /** Reactive signal containing the current locale string */
  locale: Signal<string>
  /** Default locale to use as fallback (default: 'en-US') */
  defaultLocale: string
  /** Default message functions used as fallback and type reference */
  defaultMessages: M
  /** Async function that loads locale-specific message bundles */
  localeLoader: (locale: string) => Promise<M>
}) {
  // Store current locale and messages in reactive property
  const currentLocale = prop(defaultLocale)
  const currentMessages = prop(defaultMessages)

  // Listen for locale changes and load new messages
  const cancel = locale.on(async newLocale => {
    // Skip if locale hasn't actually changed
    if (newLocale === currentLocale.value) return

    // Immediately update locale (keep old messages temporarily)
    currentLocale.set(newLocale)

    const locales = getLocaleFallbacks(newLocale)
    for (const locale of locales) {
      try {
        const messages = await localeLoader(locale)
        if (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          typeof (messages as any).default === 'object' &&
          Object.keys(messages).length === 1
        ) {
          console.error(
            'It appears that you are trying to load a translation module without referencing the default export. Please use `(await import(...)).default` in your loader function.'
          )
          return
        }

        if (newLocale === currentLocale.value) {
          currentMessages.set(messages)
          return
        }
      } catch {
        continue
      }
    }
    console.warn(`No locale found for "${locale.value}", using fallback`)
    if (newLocale === currentLocale.value) {
      currentMessages.set(defaultMessages)
    }
  })

  return {
    /** Clean up all resources and event listeners */
    dispose: () => {
      cancel()
      currentLocale.dispose()
      currentMessages.dispose()
    },
    /** Translation functions that return reactive signals */
    t: currentMessages,
  }
}

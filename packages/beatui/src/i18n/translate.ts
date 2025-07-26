import { computedOf, prop, Signal, Value } from '@tempots/dom'

/**
 * Utility type that wraps each element of a tuple in a Value<T>.
 * Used to convert function parameters to reactive values.
 */
type WrapInValue<T extends unknown[]> = {
  [K in keyof T]: Value<T[K]>
}

/**
 * Transforms a messages object into a computed version where each message function
 * returns a reactive Signal instead of a direct value.
 */
type MessagesToComputed<M extends object> = {
  [K in keyof M]: M[K] extends (...args: infer Args) => infer R
    ? (...args: WrapInValue<Args>) => Signal<R>
    : never
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
  const localizedMessages = prop({
    locale: defaultLocale,
    messages: defaultMessages,
  })

  // Listen for locale changes and load new messages
  const cancel = locale.on(newLocale => {
    // Skip if locale hasn't actually changed
    if (newLocale === localizedMessages.value.locale) return

    // Immediately update locale (keep old messages temporarily)
    localizedMessages.set({
      locale: newLocale,
      messages: localizedMessages.value.messages,
    })

    // Load new messages asynchronously
    localeLoader(newLocale)
      .then(newMessages => {
        // Prevent race condition: only update if locale is still current
        if (newLocale !== localizedMessages.value.locale) return
        localizedMessages.set({ locale: newLocale, messages: newMessages })
      })
      .catch(error => {
        // Fall back to default locale and messages on error
        localizedMessages.set({
          locale: defaultLocale,
          messages: defaultMessages,
        })
        console.error('Failed to load locale', error)
      })
  })
  // Extract messages signal for easier access
  const messages = localizedMessages.$.messages

  // Create proxy-based translation functions that return reactive signals
  const t = new Proxy({} as unknown as MessagesToComputed<M>, {
    get: (_target, prop) => {
      type K = keyof M & string
      const fnSignal = messages.at(prop as K)

      // Return a function that creates reactive computed translations
      return function (...args: WrapInValue<unknown[]>) {
        return computedOf(
          fnSignal,
          ...args
        )((fn, ...args) =>
          // Call the message function with provided arguments
          // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
          (fn as Function)(...args)
        )
      }
    },
  })

  return {
    /** Clean up all resources and event listeners */
    dispose: () => {
      cancel()
      localizedMessages.dispose()
    },
    /** Translation functions that return reactive signals */
    t,
  }
}

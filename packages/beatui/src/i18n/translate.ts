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
export type ReactiveMessages<M extends object> = {
  [K in keyof M]: M[K] extends (...args: infer Args) => infer R
    ? (...args: WrapInValue<Args>) => Signal<R>
    : never
}

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
    console.warn(`No locale found for "'${locale}", using fallback`)
    if (newLocale === currentLocale.value) {
      currentMessages.set(defaultMessages)
    }
  })

  // Create proxy-based translation functions that return reactive signals
  const t = new Proxy({} as unknown as ReactiveMessages<M>, {
    get: (_target, prop) => {
      // Return a function that creates reactive computed translations
      return function (...args: WrapInValue<unknown[]>) {
        type K = keyof M & string
        const fnSignal = currentMessages.at(prop as K)
        const signal = computedOf(
          fnSignal,
          ...args
        )((fn, ...args) => {
          // Call the message function with provided arguments
          // Handle cases where fn.fn might be undefined, null, or not a function
          if (typeof fn === 'function') {
            return fn(...args)
          }

          // Fallback to default message if available
          const defaultFn = defaultMessages[prop as K]
          if (typeof defaultFn === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            return (defaultFn as Function)(...args)
          }

          // Last resort: return a placeholder message
          return `[Missing translation: ${String(prop)}]`
        })
        signal.onDispose(fnSignal.dispose)
        return signal
      }
    },
  })

  return {
    /** Clean up all resources and event listeners */
    dispose: () => {
      console.log('Dispose!!!')
      cancel()
      currentLocale.dispose()
      currentMessages.dispose()
    },
    /** Translation functions that return reactive signals */
    t,
  }
}

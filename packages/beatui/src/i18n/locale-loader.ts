/**
 * Creates a locale loader that dynamically imports locale files from a specified path.
 * Uses Vite's dynamic import capabilities to load only the needed locale files.
 *
 * @param basePath Base path to the locale files (e.g., '/locales', './i18n')
 * @returns Function that loads locale-specific message modules
 *
 * @example
 * ```typescript
 * const loader = makeImportLoader('./locales')
 * // Loads ./locales/en-US.ts, ./locales/fr.ts, etc.
 *
 * const { t } = makeMessages({
 *   locale,
 *   defaultMessages,
 *   localeLoader: loader
 * })
 * ```
 */
export function makeImportLocaleLoader<M extends object>(
  basePath: string,
  fallback: M
) {
  return async (locale: string): Promise<M> => {
    // Try common locale fallbacks
    const locales = getLocaleFallbacks(locale)
    for (const locale of locales) {
      try {
        const module = await import(`${basePath}/${locale}.ts`)
        return module.default ?? module
      } catch {
        continue
      }
    }
    return fallback
  }
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

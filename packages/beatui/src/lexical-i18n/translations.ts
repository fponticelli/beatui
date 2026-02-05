import type { LexicalMessages } from './default'
import { defaultMessages, defaultLocale } from './default'

/**
 * Get a translated message by key from a messages object
 */
export function t(
  messages: LexicalMessages,
  key: keyof LexicalMessages,
  ...args: unknown[]
): string {
  const message = messages[key]

  if (typeof message === 'function') {
    return (message as (...args: unknown[]) => string)(...args)
  }

  return message as string
}

/**
 * Get messages for a locale. Falls back to English if locale not found.
 */
export async function getMessagesForLocale(
  locale: string
): Promise<LexicalMessages> {
  try {
    const module = await import(`./locales/${locale}`)
    return module.default
  } catch {
    return defaultMessages
  }
}

/**
 * Determine text direction based on locale
 */
export function getDirectionForLocale(locale: string): 'ltr' | 'rtl' {
  // RTL languages
  const rtlLocales = ['ar', 'he', 'fa', 'ur']
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr'
}

/**
 * Get default locale
 */
export function getDefaultLocale(): string {
  return defaultLocale
}

/**
 * Get default messages
 */
export function getDefaultMessages(): LexicalMessages {
  return defaultMessages
}

import { Provide, TNode } from '@tempots/dom'
import { BeatUII18n } from '../../src/beatui-i18n/translations'
import { Locale } from '../../src/components/i18n/locale'
import { Theme } from '../../src/components/theme/theme'

// Re-export Provide for tests that need it
export { Provide }

/**
 * Test helper that provides all necessary providers for BeatUI components
 */
export function WithProviders(children: () => TNode) {
  return Provide(Theme, {}, () =>
    Provide(Locale, {}, () => Provide(BeatUII18n, {}, () => children()))
  )
}

/**
 * Test helper that provides only the i18n providers (Locale + BeatUII18n)
 */
export function WithI18nProviders(children: () => TNode) {
  return Provide(Locale, {}, () => Provide(BeatUII18n, {}, () => children()))
}

/**
 * Test helper that provides only the Theme provider
 */
export function WithThemeProvider(children: () => TNode) {
  return Provide(Theme, {}, () => children())
}

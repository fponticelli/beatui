import { Provide, TNode, Use } from '@tempots/dom'
import { BeatUII18n } from '../../src/beatui-i18n/translations'
import { AuthI18n } from '../../src/auth-i18n/translations'
import { Locale } from '../../src/components/i18n/locale'
import { Theme } from '../../src/components/theme/theme'
import { Location } from '@tempots/ui'
import type { LocationData } from '@tempots/ui'

// Re-export Provide for tests that need it
export { Provide }

type TestLocationInit = {
  pathname: string
  search?: Record<string, string> | string
  hash?: string | null | undefined
}

const normalizeLocationInit = (
  location: TestLocationInit
): LocationData => {
  const searchSource = location.search ?? {}
  const searchEntries =
    typeof searchSource === 'string'
      ? new URLSearchParams(
          searchSource.startsWith('?') ? searchSource.slice(1) : searchSource
        )
      : new URLSearchParams(searchSource)

  const hashValue = location.hash ?? undefined
  const normalizedHash =
    hashValue && hashValue !== ''
      ? hashValue.startsWith('#')
        ? hashValue.slice(1)
        : hashValue
      : undefined

  return {
    pathname: location.pathname,
    search: Object.fromEntries(searchEntries.entries()),
    hash: normalizedHash,
  }
}

const locationsEqual = (a: LocationData, b: LocationData) =>
  a.pathname === b.pathname &&
  JSON.stringify(a.search) === JSON.stringify(b.search) &&
  (a.hash ?? undefined) === (b.hash ?? undefined)

export function WithLocation(location: TestLocationInit, children: () => TNode) {
  const normalized = normalizeLocationInit(location)
  return Provide(Location, {}, () =>
    Use(Location, handle => {
      if (!locationsEqual(handle.location.value, normalized)) {
        handle.setLocation(normalized, { replace: true })
      }
      return children()
    })
  )
}

/**
 * Test helper that provides all necessary providers for BeatUI components
 */
export function WithProviders(children: () => TNode) {
  return Provide(Theme, {}, () =>
    Provide(Locale, {}, () =>
      Provide(BeatUII18n, {}, () => Provide(AuthI18n, {}, () => children()))
    )
  )
}

/**
 * Test helper that provides only the i18n providers (Locale + BeatUII18n + AuthI18n)
 */
export function WithI18nProviders(children: () => TNode) {
  return Provide(Locale, {}, () =>
    Provide(BeatUII18n, {}, () => Provide(AuthI18n, {}, () => children()))
  )
}

/**
 * Test helper that provides only the Theme provider
 */
export function WithThemeProvider(children: () => TNode) {
  return Provide(Theme, {}, () => children())
}

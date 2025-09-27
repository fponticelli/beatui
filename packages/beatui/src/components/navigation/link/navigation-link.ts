import { computedOf, TNode, Use, Value } from '@tempots/dom'
import { Location } from '@tempots/ui'
import type { LocationData, LocationHandle } from '@tempots/ui'
import { Link, LinkOptions } from './link'

export type UrlMatchMode = 'exact' | 'prefix' | 'params'

export interface NavigationLinkOptions extends Omit<LinkOptions, 'disabled'> {
  /**
   * How to match the current URL against the link's href
   * - 'exact': URL must match exactly (default)
   * - 'prefix': Current URL must start with the link's href
   * - 'params': Match pathname and search params, ignore hash
   */
  matchMode?: UrlMatchMode
  /**
   * Whether to disable the link when it matches the current location
   * @default true
   */
  disableWhenActive?: Value<boolean>
}

const normalizeHash = (hash: string | undefined): string => {
  if (!hash) return ''
  return hash.startsWith('#') ? hash : `#${hash}`
}

const toSearchParams = (
  search: Record<string, string> | string | URLSearchParams | undefined
) => {
  if (!search) return new URLSearchParams()
  if (typeof search === 'string') {
    const trimmed = search.startsWith('?') ? search.slice(1) : search
    return new URLSearchParams(trimmed)
  }
  if (search instanceof URLSearchParams) {
    return new URLSearchParams(search)
  }
  return new URLSearchParams(search)
}

export function isUrlMatch(
  location: LocationData,
  targetHref: string,
  matchMode: UrlMatchMode
): boolean {
  const searchParams = toSearchParams(location.search)
  const searchParamsString = searchParams.toString()
  const searchString = searchParamsString ? `?${searchParamsString}` : ''
  const hashString = normalizeHash(location.hash)

  switch (matchMode) {
    case 'exact':
      return location.pathname + searchString + hashString === targetHref

    case 'prefix':
      return (
        location.pathname.startsWith(targetHref) ||
        (location.pathname + searchString).startsWith(targetHref)
      )

    case 'params':
      try {
        // Use document.baseURI to avoid relying on window.location mutability in tests
        const base =
          typeof document !== 'undefined' && document.baseURI
            ? document.baseURI
            : 'http://localhost/'
        const targetUrl = new URL(targetHref, base)
        // Compare pathname first
        if (location.pathname !== targetUrl.pathname) {
          return false
        }

        // Compare search params by checking each key-value pair
        // This handles different parameter orders correctly
        const targetEntries = Array.from(
          new URLSearchParams(targetUrl.search).entries()
        ).sort()
        const currentEntries = Array.from(searchParams.entries()).sort()

        if (targetEntries.length !== currentEntries.length) {
          return false
        }

        return targetEntries.every(([key, value], index) => {
          const [currentKey, currentValue] = currentEntries[index]
          return key === currentKey && value === currentValue
        })
      } catch {
        // If URL parsing fails, fall back to simple pathname comparison
        return location.pathname === targetHref
      }

    default:
      return false
  }
}

type LocationMatcher = string | RegExp | ((location: LocationData) => boolean)

export function createLocationMatcher(
  href: Value<string>,
  matchMode: UrlMatchMode
): Value<LocationMatcher> {
  if (matchMode === 'exact') {
    return computedOf(href)<LocationMatcher>(hrefValue => hrefValue)
  }

  return computedOf(href)<LocationMatcher>(
    (hrefValue: string) => (location: LocationData) =>
      isUrlMatch(location, hrefValue, matchMode)
  )
}

export function NavigationLink(
  {
    href,
    matchMode = 'exact',
    disableWhenActive = true,
    ...linkOptions
  }: NavigationLinkOptions,
  ...children: TNode[]
) {
  return Use(Location, (locationHandle: LocationHandle) => {
    const matchSignal = locationHandle.matchSignal(
      createLocationMatcher(href, matchMode)
    )

    const isActive = computedOf(
      matchSignal,
      disableWhenActive
    )((matches, disableWhenActive) => {
      const shouldDisable = disableWhenActive ?? true
      if (!shouldDisable) return false

      return matches
    })

    return Link(
      {
        ...linkOptions,
        href,
        disabled: isActive,
      },
      ...children
    )
  })
}

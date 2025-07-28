import { computedOf, TNode, Use, Value } from '@tempots/dom'
import { Location } from '@tempots/ui'
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

export function isUrlMatch(
  location: { pathname: string; search: Record<string, string>; hash?: string },
  targetHref: string,
  matchMode: UrlMatchMode
): boolean {
  // Convert search object to string for comparison
  const searchString =
    Object.keys(location.search).length > 0
      ? '?' + new URLSearchParams(location.search).toString()
      : ''
  const hashString = location.hash || ''

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
        const targetUrl = new URL(targetHref, window.location.origin)
        const targetSearchParams = new URLSearchParams(targetUrl.search)
        const currentSearchParams = new URLSearchParams(location.search)

        // Compare pathname first
        if (location.pathname !== targetUrl.pathname) {
          return false
        }

        // Compare search params by checking each key-value pair
        // This handles different parameter orders correctly
        const targetEntries = Array.from(targetSearchParams.entries()).sort()
        const currentEntries = Array.from(currentSearchParams.entries()).sort()

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

export function NavigationLink(
  {
    href,
    matchMode = 'exact',
    disableWhenActive = true,
    ...linkOptions
  }: NavigationLinkOptions,
  ...children: TNode[]
) {
  return Use(Location, location => {
    const isActive = computedOf(
      location,
      href,
      disableWhenActive
    )((location, href, disableWhenActive) => {
      const shouldDisable = disableWhenActive ?? true
      if (!shouldDisable) return false

      return isUrlMatch(location, Value.get(href), matchMode)
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

import {
  aria,
  attr,
  computedOf,
  ForEach,
  html,
  on,
  TNode,
  Use,
  Value,
  When,
} from '@tempots/dom'
import { ControlSize } from '../theme/types'
import { Icon } from '../data/icon'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Represents a single item in the breadcrumb navigation trail.
 */
export interface BreadcrumbItem {
  /** Display text for the breadcrumb item. */
  label: string
  /** Optional URL for navigation (renders as `<a>` if provided). */
  href?: string
  /** Optional click handler (renders as `<button>` if provided without href). */
  onClick?: () => void
  /** Optional Iconify icon name (e.g., `'mdi:home'`). */
  icon?: string
  /** Whether this item represents the current page. @default false */
  current?: boolean
}

/**
 * Configuration options for the {@link Breadcrumbs} component.
 */
export interface BreadcrumbsOptions {
  /** Array of breadcrumb items to display. */
  items: Value<BreadcrumbItem[]>
  /**
   * Separator character or string displayed between items.
   * @default '/'
   */
  separator?: Value<string>
  /**
   * Maximum number of items to display. When exceeded, middle items
   * are collapsed into an ellipsis ("...").
   * @default undefined (show all items)
   */
  maxItems?: Value<number>
  /**
   * Size of the breadcrumb text and icons.
   * @default 'md'
   */
  size?: Value<ControlSize>
}

/**
 * Generates the CSS class string for the breadcrumbs component.
 *
 * @param size - The control size
 * @returns A space-separated CSS class string
 */
function generateBreadcrumbsClasses(size: ControlSize): string {
  return ['bc-breadcrumbs', `bc-breadcrumbs--size-${size}`].join(' ')
}

/**
 * Collapses a breadcrumb items array by showing the first item,
 * an ellipsis, and the last `maxItems - 1` items.
 *
 * @param items - The full breadcrumb items array
 * @param maxItems - Maximum number of items to show
 * @returns Collapsed array with ellipsis placeholder
 */
function collapseItems(
  items: BreadcrumbItem[],
  maxItems: number
): (BreadcrumbItem | { isEllipsis: true })[] {
  if (items.length <= maxItems) {
    return items
  }

  const firstItem = items[0]
  const lastItems = items.slice(-(maxItems - 1))

  return [firstItem, { isEllipsis: true }, ...lastItems]
}

/**
 * Navigation breadcrumbs component that displays a hierarchical trail of links
 * leading to the current page.
 *
 * Breadcrumbs help users understand their location within a site hierarchy and
 * provide a convenient way to navigate back to parent pages. The component supports
 * collapsing middle items when the trail becomes too long, and can display icons
 * alongside labels.
 *
 * Each item can be rendered as:
 * - An anchor (`<a>`) if `href` is provided
 * - A button (`<button>`) if `onClick` is provided
 * - A plain span (`<span>`) if neither is provided
 *
 * The last item is automatically marked with `aria-current="page"` if its `current`
 * property is true, indicating the current page to screen readers.
 *
 * @param options - Configuration for items, separator, max items, and size
 * @returns A `<nav>` element containing the breadcrumb trail
 *
 * @example
 * ```typescript
 * Breadcrumbs({
 *   items: [
 *     { label: 'Home', href: '/', icon: 'mdi:home' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Electronics', href: '/products/electronics' },
 *     { label: 'Laptop', current: true }
 *   ]
 * })
 * ```
 *
 * @example
 * ```typescript
 * // With max items to collapse long trails
 * Breadcrumbs({
 *   items: longItemsList,
 *   maxItems: 3,
 *   separator: '>',
 *   size: 'sm'
 * })
 * ```
 *
 * @example
 * ```typescript
 * // With click handlers instead of links
 * Breadcrumbs({
 *   items: [
 *     { label: 'Home', onClick: () => navigate('/') },
 *     { label: 'Settings', onClick: () => navigate('/settings') },
 *     { label: 'Profile', current: true }
 *   ]
 * })
 * ```
 */
export function Breadcrumbs({
  items,
  separator = '/',
  maxItems,
  size = 'md',
}: BreadcrumbsOptions): TNode {
  // Compute the potentially collapsed items list
  const displayItems = computedOf(
    items,
    maxItems
  )((items, maxItems) => {
    if (maxItems && maxItems > 0) {
      return collapseItems(items, maxItems)
    }
    return items
  })

  return Use(BeatUII18n, t =>
    html.nav(
      attr.class(Value.map(size, s => generateBreadcrumbsClasses(s ?? 'md'))),
      aria.label(t.$.breadcrumbs),
      html.ol(
        attr.class('bc-breadcrumbs__list'),
        ForEach(
          displayItems,
          itemSignal => {
            const isEllipsis = itemSignal.map(
              item => 'isEllipsis' in item && item.isEllipsis === true
            )
            const isCurrent = itemSignal.map(
              item => !('isEllipsis' in item) && item.current === true
            )

            return When(
              isEllipsis,
              () =>
                html.li(
                  attr.class('bc-breadcrumbs__item bc-breadcrumbs__ellipsis'),
                  aria.hidden(true),
                  '...'
                ),
              () => {
                const hasHref = itemSignal.map(
                  i => !('isEllipsis' in i) && i.href != null
                )
                const hasOnClick = itemSignal.map(
                  i =>
                    !('isEllipsis' in i) && i.href == null && i.onClick != null
                )
                const hasIcon = itemSignal.map(
                  i => !('isEllipsis' in i) && i.icon != null
                )

                const iconAndLabel = (cls: string) => [
                  attr.class(cls),
                  When(hasIcon, () =>
                    Icon({
                      icon: itemSignal.map(i =>
                        'isEllipsis' in i ? '' : (i.icon ?? '')
                      ),
                      size,
                      accessibility: 'decorative',
                    })
                  ),
                  html.span(
                    itemSignal.map(i => ('isEllipsis' in i ? '' : i.label))
                  ),
                ]

                return html.li(
                  attr.class(
                    Value.map(isCurrent, current =>
                      current
                        ? 'bc-breadcrumbs__item bc-breadcrumbs__item--current'
                        : 'bc-breadcrumbs__item'
                    )
                  ),
                  When(isCurrent, () => aria.current('page')),
                  // Render as link, button, or span based on item properties
                  When(
                    hasHref,
                    () =>
                      html.a(
                        attr.href(
                          itemSignal.map(i =>
                            'isEllipsis' in i ? '' : (i.href ?? '')
                          )
                        ),
                        ...iconAndLabel('bc-breadcrumbs__link')
                      ),
                    () =>
                      When(
                        hasOnClick,
                        () =>
                          html.button(
                            attr.type('button'),
                            on.click(() => {
                              const item = Value.get(itemSignal)
                              if (!('isEllipsis' in item)) {
                                item.onClick?.()
                              }
                            }),
                            ...iconAndLabel('bc-breadcrumbs__button')
                          ),
                        () => html.span(...iconAndLabel('bc-breadcrumbs__text'))
                      )
                  )
                )
              }
            )
          },
          // Native separator between items
          () =>
            html.li(
              attr.class('bc-breadcrumbs__separator'),
              aria.hidden(true),
              separator
            )
        )
      )
    )
  )
}

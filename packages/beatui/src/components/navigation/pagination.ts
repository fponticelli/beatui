import {
  attr,
  aria,
  html,
  OnDispose,
  Value,
  computedOf,
  ForEach,
  on,
  When,
  WithElement,
  Use,
} from '@tempots/dom'
import { delayedAnimationFrame } from '@tempots/std'
import { ControlSize, PaginationVariant } from '../theme'
import { ThemeColorName, getColorVar } from '../../tokens'
import {
  backgroundValue,
  textColorValue,
  borderColorValue,
} from '../theme/style-utils'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Configuration options for the {@link Pagination} component.
 */
export interface PaginationOptions {
  /** Current page number (1-indexed). */
  currentPage: Value<number>
  /** Total number of pages available. */
  totalPages: Value<number>
  /** Callback invoked when a page is selected. */
  onPageChange: (page: number) => void
  /** Number of page siblings to show around the current page. @default 1 */
  siblings?: Value<number>
  /** Whether to show Previous/Next navigation buttons. @default true */
  showPrevNext?: Value<boolean>
  /** Whether to show First/Last page buttons. @default false */
  showFirstLast?: Value<boolean>
  /** Size affecting button dimensions and font size. @default 'md' */
  size?: Value<ControlSize>
  /** Visual style variant for the pagination items. @default 'filled' */
  variant?: Value<PaginationVariant>
  /** Theme color for the active page indicator. @default 'primary' */
  color?: Value<ThemeColorName>
  /** Whether to distribute items across the full available width. @default false */
  justify?: Value<boolean>
  /** Whether to dynamically adjust the number of visible page numbers to fit available space. @default false */
  responsive?: Value<boolean>
}

/**
 * Generates an array of page numbers and ellipsis markers for pagination display.
 *
 * The algorithm shows:
 * - The first page (if not in range)
 * - An ellipsis if there's a gap after first page
 * - Page numbers around the current page (siblings)
 * - An ellipsis if there's a gap before last page
 * - The last page (if not in range)
 *
 * @param current - The current page number (1-indexed)
 * @param total - The total number of pages
 * @param siblings - Number of page numbers to show on each side of current
 * @returns Array of page numbers and 'dots' markers for ellipsis
 *
 * @example
 * ```typescript
 * generatePaginationRange(5, 10, 1) // [1, 'dots', 4, 5, 6, 'dots', 10]
 * generatePaginationRange(1, 10, 1) // [1, 2, 'dots', 10]
 * generatePaginationRange(10, 10, 1) // [1, 'dots', 9, 10]
 * ```
 */
export function generatePaginationRange(
  current: number,
  total: number,
  siblings: number
): (number | 'dots')[] {
  const range: (number | 'dots')[] = []
  const left = Math.max(1, current - siblings)
  const right = Math.min(total, current + siblings)

  if (left > 1) {
    range.push(1)
    if (left > 2) range.push('dots')
  }

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  if (right < total) {
    if (right < total - 1) range.push('dots')
    range.push(total)
  }

  return range
}

/**
 * Generates inline CSS custom properties for pagination theming based on variant and color.
 *
 * @param variant - The visual style variant
 * @param color - The theme color
 * @returns Semicolon-separated CSS custom property declarations
 */
export function generatePaginationStyles(
  variant: PaginationVariant,
  color: ThemeColorName
): string {
  const styles = new Map<string, string>()

  // Active state colors
  switch (variant) {
    case 'filled':
    case 'pill': {
      const bgLight = backgroundValue(color, 'solid', 'light')
      const bgDark = backgroundValue(color, 'solid', 'dark')
      styles.set('--pagination-active-bg', bgLight.backgroundColor)
      styles.set('--pagination-active-text', bgLight.textColor)
      styles.set('--pagination-active-bg-dark', bgDark.backgroundColor)
      styles.set('--pagination-active-text-dark', bgDark.textColor)
      break
    }
    case 'outline': {
      styles.set('--pagination-active-bg', 'transparent')
      styles.set('--pagination-active-text', textColorValue(color, 'light'))
      styles.set('--pagination-active-border', borderColorValue(color, 'light'))
      styles.set('--pagination-active-bg-dark', 'transparent')
      styles.set('--pagination-active-text-dark', textColorValue(color, 'dark'))
      styles.set(
        '--pagination-active-border-dark',
        borderColorValue(color, 'dark')
      )
      // Non-active items: subtle border
      styles.set('--pagination-item-border', getColorVar('base', 300))
      styles.set('--pagination-item-border-dark', getColorVar('base', 600))
      break
    }
    case 'light': {
      const bgLight = backgroundValue(color, 'light', 'light')
      const bgDark = backgroundValue(color, 'light', 'dark')
      styles.set('--pagination-active-bg', bgLight.backgroundColor)
      styles.set('--pagination-active-text', textColorValue(color, 'light'))
      styles.set('--pagination-active-bg-dark', bgDark.backgroundColor)
      styles.set('--pagination-active-text-dark', textColorValue(color, 'dark'))
      // Non-active items: faint background
      styles.set('--pagination-item-bg', getColorVar('base', 100))
      styles.set('--pagination-item-bg-dark', getColorVar('base', 800))
      break
    }
    case 'subtle': {
      styles.set('--pagination-active-bg', 'transparent')
      styles.set('--pagination-active-text', textColorValue(color, 'light'))
      styles.set('--pagination-active-bg-dark', 'transparent')
      styles.set('--pagination-active-text-dark', textColorValue(color, 'dark'))
      break
    }
  }

  // Hover state colors (shared across variants)
  const hoverBgLight = getColorVar('base', 100)
  const hoverBgDark = getColorVar('base', 700)
  styles.set('--pagination-hover-bg', hoverBgLight)
  styles.set('--pagination-hover-bg-dark', hoverBgDark)

  return Array.from(styles.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * A pagination component for navigating through multiple pages of content.
 *
 * Features:
 * - Configurable number of sibling pages shown around current page
 * - Optional First/Last page navigation buttons
 * - Optional Previous/Next navigation buttons
 * - Ellipsis indicators for collapsed page ranges
 * - Responsive sizing with theme support
 * - Full keyboard navigation and ARIA support
 *
 * @param options - Configuration for appearance and behavior
 * @returns A navigation element with pagination controls
 *
 * @example
 * ```typescript
 * const currentPage = prop(1)
 * const totalPages = prop(10)
 *
 * Pagination({
 *   currentPage,
 *   totalPages,
 *   onPageChange: (page) => {
 *     currentPage.set(page)
 *     // Load page data...
 *   },
 *   siblings: 1,
 *   showPrevNext: true,
 *   showFirstLast: false,
 *   size: 'md'
 * })
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
  showPrevNext = true,
  showFirstLast = false,
  size = 'md',
  variant = 'filled',
  color = 'primary',
  justify = false,
  responsive = false,
}: PaginationOptions) {
  const responsiveSiblings = Value.deriveProp(siblings)

  // When responsive, use measured siblings; otherwise use user-provided value
  const effectiveSiblings = computedOf(
    responsive,
    responsiveSiblings,
    siblings
  )((isResponsive, rSibs, userSibs) => (isResponsive ? rSibs : userSibs))

  return Use(BeatUII18n, t =>
    html.nav(
      attr.class(
        computedOf(
          size,
          variant,
          justify
        )((s, v, j) => {
          const classes = [
            'bc-pagination',
            `bc-pagination--size-${s}`,
            `bc-pagination--variant-${v}`,
          ]
          if (j) classes.push('bc-pagination--justify')
          return classes.join(' ')
        })
      ),
      attr.style(
        computedOf(variant, color)((v, c) => generatePaginationStyles(v, c))
      ),
      aria.label(t.$.paginationLabel),

      // Responsive ResizeObserver setup
      When(responsive, () =>
        WithElement(navEl => {
          const updateSiblings = () => {
            const containerWidth = navEl.clientWidth
            if (containerWidth === 0) return

            // Measure actual item dimensions from the DOM
            const firstItem = navEl.querySelector(
              '.bc-pagination__item'
            ) as HTMLElement
            if (!firstItem) return
            const itemWidth = firstItem.offsetWidth
            const computedGap = parseFloat(getComputedStyle(navEl).gap) || 0
            const slotWidth = itemWidth + computedGap
            const totalSlots = Math.floor(
              (containerWidth + computedGap) / slotWidth
            )

            // Calculate nav button count
            const navButtons =
              (Value.get(showPrevNext) ? 2 : 0) +
              (Value.get(showFirstLast) ? 2 : 0)

            // Range items = 2*siblings + 5 (current + first + last + 2 dots max)
            // But cap to total pages available
            const total = Value.get(totalPages)
            const availableSlots = totalSlots - navButtons
            const maxSiblings = Math.max(
              0,
              Math.floor((availableSlots - 5) / 2)
            )
            // Don't exceed what's needed for the total pages
            const needed = Math.floor((total - 3) / 2)
            responsiveSiblings.set(Math.min(maxSiblings, Math.max(0, needed)))
          }

          const observer = new ResizeObserver(updateSiblings)
          observer.observe(navEl)
          delayedAnimationFrame(updateSiblings)

          return OnDispose(() => observer.disconnect())
        })
      ),

      // First page button
      When(showFirstLast, () =>
        html.button(
          attr.class('bc-pagination__item'),
          attr.disabled(
            computedOf(
              currentPage,
              totalPages
            )((current, total) => current <= 1 || total <= 1)
          ),
          aria.label(t.$.firstPage),
          on.click(e => {
            e.preventDefault()
            const total = Value.get(totalPages)
            if (total > 1) {
              onPageChange(1)
            }
          }),
          '\u00AB' // «
        )
      ),

      // Previous page button
      When(showPrevNext, () =>
        html.button(
          attr.class('bc-pagination__item'),
          attr.disabled(
            computedOf(
              currentPage,
              totalPages
            )((current, total) => current <= 1 || total <= 1)
          ),
          aria.label(t.$.previousPage),
          on.click(e => {
            e.preventDefault()
            const current = Value.get(currentPage)
            if (current > 1) {
              onPageChange(current - 1)
            }
          }),
          '\u2039' // ‹
        )
      ),

      // Page numbers and ellipsis
      ForEach(
        computedOf(
          currentPage,
          totalPages,
          effectiveSiblings
        )((current, total, sibs) =>
          generatePaginationRange(current, total, sibs)
        ),
        itemSignal => {
          const isDots = itemSignal.map(item => item === 'dots')
          const isActive = computedOf(
            itemSignal,
            currentPage
          )((item, current) => item === current)

          return When(
            isDots,
            () => html.span(attr.class('bc-pagination__dots'), '\u2026'),
            () =>
              html.button(
                attr.class(
                  Value.map(isActive, (active): string =>
                    active
                      ? 'bc-pagination__item bc-pagination__item--active'
                      : 'bc-pagination__item'
                  )
                ),
                WithElement(el => {
                  Value.on(isActive, active => {
                    if (active) {
                      el.setAttribute('aria-current', 'page')
                    } else {
                      el.removeAttribute('aria-current')
                    }
                  })
                }),
                on.click(e => {
                  e.preventDefault()
                  const item = Value.get(itemSignal)
                  if (item !== 'dots' && item !== Value.get(currentPage)) {
                    onPageChange(item)
                  }
                }),
                itemSignal.map(item => String(item))
              )
          )
        }
      ),

      // Next page button
      When(showPrevNext, () =>
        html.button(
          attr.class('bc-pagination__item'),
          attr.disabled(
            computedOf(
              currentPage,
              totalPages
            )((current, total) => current >= total || total <= 1)
          ),
          aria.label(t.$.nextPage),
          on.click(e => {
            e.preventDefault()
            const current = Value.get(currentPage)
            const total = Value.get(totalPages)
            if (current < total) {
              onPageChange(current + 1)
            }
          }),
          '\u203A' // ›
        )
      ),

      // Last page button
      When(showFirstLast, () =>
        html.button(
          attr.class('bc-pagination__item'),
          attr.disabled(
            computedOf(
              currentPage,
              totalPages
            )((current, total) => current >= total || total <= 1)
          ),
          aria.label(t.$.lastPage),
          on.click(e => {
            e.preventDefault()
            const total = Value.get(totalPages)
            if (total > 1) {
              onPageChange(total)
            }
          }),
          '\u00BB' // »
        )
      )
    )
  )
}

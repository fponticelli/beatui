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
  prop,
} from '@tempots/dom'
import { ControlSize } from '../theme'

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
  justify = false,
  responsive = false,
}: PaginationOptions) {
  const responsiveSiblings = prop(Value.get(siblings))

  // When responsive, use measured siblings; otherwise use user-provided value
  const effectiveSiblings = computedOf(
    responsive,
    responsiveSiblings,
    siblings
  )((isResponsive, rSibs, userSibs) => (isResponsive ? rSibs : userSibs))

  return html.nav(
    attr.class(
      computedOf(
        size,
        justify
      )((s, j) => {
        const classes = ['bc-pagination', `bc-pagination--size-${s}`]
        if (j) classes.push('bc-pagination--justify')
        return classes.join(' ')
      })
    ),
    aria.label('Pagination'),

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
          const maxSiblings = Math.max(0, Math.floor((availableSlots - 5) / 2))
          // Don't exceed what's needed for the total pages
          const needed = Math.floor((total - 3) / 2)
          responsiveSiblings.set(Math.min(maxSiblings, Math.max(0, needed)))
        }

        const observer = new ResizeObserver(updateSiblings)
        observer.observe(navEl)
        requestAnimationFrame(updateSiblings)

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
        aria.label('First page'),
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
        aria.label('Previous page'),
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
                Value.map(isActive, active =>
                  active
                    ? 'bc-pagination__item bc-pagination__item--active'
                    : 'bc-pagination__item'
                )
              ),
              WithElement(el => {
                return OnDispose(
                  Value.on(isActive, active => {
                    if (active) {
                      el.setAttribute('aria-current', 'page')
                    } else {
                      el.removeAttribute('aria-current')
                    }
                  })
                )
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
        aria.label('Next page'),
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
        aria.label('Last page'),
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
}

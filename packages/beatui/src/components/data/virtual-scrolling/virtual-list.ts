import {
  aria,
  attr,
  computedOf,
  Fragment,
  html,
  MapSignal,
  OnDispose,
  prop,
  style,
  TNode,
  Use,
  Value,
  WithElement,
} from '@tempots/dom'
import { BeatUII18n } from '../../../beatui-i18n'

/**
 * Configuration options for the {@link VirtualList} component.
 *
 * A virtualized list that renders only visible items for performance with
 * large datasets. Items outside the visible viewport are not rendered in the
 * DOM, dramatically reducing memory usage and rendering time.
 *
 * @typeParam T - The type of items in the list
 */
export interface VirtualListOptions<T> {
  /** The array of items to render. May be a static array or a reactive signal. */
  items: Value<T[]>
  /**
   * A function that renders a single item. Called only for visible items.
   *
   * @param item - The item data
   * @param index - The item's index in the full items array
   * @returns A TNode representing the rendered item
   */
  renderItem: (item: T, index: number) => TNode
  /**
   * The height of each item. Can be a fixed number (pixels) for uniform-height
   * lists, or a function that returns the height for a given index for
   * variable-height lists.
   *
   * Fixed heights are more performant as they avoid cumulative height calculations.
   */
  itemHeight: number | ((index: number) => number)
  /**
   * Number of extra items to render above and below the visible viewport.
   * Larger values reduce the chance of blank flickers during fast scrolling
   * at the cost of rendering more items.
   *
   * @default 5
   */
  overscan?: number
  /**
   * The height of the scroll container. Can be a pixel number (e.g. 400) or
   * a CSS string (e.g. '100%', '50vh').
   */
  containerHeight: Value<number | string>
  /** Additional CSS class names to apply to the outer container element. */
  class?: Value<string>
}

function buildCumulativeHeights(
  count: number,
  heightFn: (index: number) => number
): number[] {
  const cumulative = new Array<number>(count + 1)
  cumulative[0] = 0
  for (let i = 0; i < count; i++) {
    cumulative[i + 1] = cumulative[i]! + heightFn(i)
  }
  return cumulative
}

function binarySearchStart(cumulative: number[], scrollTop: number): number {
  let lo = 0
  let hi = cumulative.length - 2
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cumulative[mid + 1]! <= scrollTop) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  return lo
}

interface VisibleRange {
  startIndex: number
  endIndex: number
  offset: number
}

function computeFixedRange(
  scrollTop: number,
  viewportHeight: number,
  itemCount: number,
  fixedHeight: number,
  overscan: number
): VisibleRange {
  const rawStart = Math.floor(scrollTop / fixedHeight) - overscan
  const rawEnd =
    Math.ceil((scrollTop + viewportHeight) / fixedHeight) + overscan
  const startIndex = Math.max(0, rawStart)
  const endIndex = Math.min(itemCount - 1, rawEnd)
  const offset = startIndex * fixedHeight
  return { startIndex, endIndex, offset }
}

function computeVariableRange(
  scrollTop: number,
  viewportHeight: number,
  itemCount: number,
  cumulative: number[],
  overscan: number
): VisibleRange {
  const rawStart = binarySearchStart(cumulative, scrollTop) - overscan
  const startIndex = Math.max(0, rawStart)

  let rawEnd = startIndex
  const scrollBottom = scrollTop + viewportHeight
  while (rawEnd < itemCount && cumulative[rawEnd]! < scrollBottom) {
    rawEnd++
  }
  const endIndex = Math.min(itemCount - 1, rawEnd + overscan)
  const offset = cumulative[startIndex] ?? 0
  return { startIndex, endIndex, offset }
}

/**
 * A virtualized list component that renders only visible items for high
 * performance with large datasets (10,000+ items).
 *
 * The component maintains a scroll container with a spacer element sized to
 * the total height of all items. Only items within the visible viewport (plus
 * an overscan buffer) are rendered in the DOM.
 *
 * Supports both fixed-height items (more performant) and variable-height items
 * via a height function.
 *
 * @typeParam T - The type of items in the list
 * @param options - Configuration for the virtual list
 * @returns A scroll container with virtualized item rendering
 *
 * @example
 * ```typescript
 * // Fixed-height virtual list with 10,000 items
 * const items = prop(Array.from({ length: 10000 }, (_, i) => ({ id: i, label: `Item ${i}` })))
 *
 * VirtualList({
 *   items,
 *   itemHeight: 48,
 *   containerHeight: 400,
 *   renderItem: (item, index) =>
 *     html.div(
 *       attr.class('flex items-center px-4 border-b'),
 *       attr.style('height: 48px'),
 *       `${index}: ${item.label}`
 *     ),
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Variable-height items
 * VirtualList({
 *   items: myItems,
 *   itemHeight: index => index % 3 === 0 ? 72 : 48,
 *   containerHeight: '100%',
 *   overscan: 10,
 *   renderItem: (item) => html.div(item.label),
 * })
 * ```
 */
export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  containerHeight,
  class: className,
}: VirtualListOptions<T>): TNode {
  const isFixedHeight = typeof itemHeight === 'number'

  // Reactive state
  const scrollTop = prop(0)
  // We store the rendered container height as a number for calculations.
  // We use 400 as a reasonable default; it will be updated by scroll events.
  const renderedContainerHeight = prop(400)

  // Total height of all items (spacer size)
  const totalHeight = computedOf(items)((itemList: T[]) => {
    if (isFixedHeight) {
      return itemList.length * (itemHeight as number)
    }
    const heightFn = itemHeight as (index: number) => number
    let total = 0
    for (let i = 0; i < itemList.length; i++) {
      total += heightFn(i)
    }
    return total
  })

  // Cumulative heights for variable-height mode (only computed when needed)
  const cumulativeHeights = isFixedHeight
    ? null
    : computedOf(items)((itemList: T[]) =>
        buildCumulativeHeights(
          itemList.length,
          itemHeight as (i: number) => number
        )
      )

  // Equality check: only re-render when the visible index range actually changes
  const rangeEqual = (a: VisibleRange | undefined, b: VisibleRange | undefined): boolean => {
    if (a == null || b == null) return a === b
    return a.startIndex === b.startIndex &&
      a.endIndex === b.endIndex &&
      a.offset === b.offset
  }

  // Compute visible range and offset
  const visibleRangeSignal = isFixedHeight
    ? computedOf(
        scrollTop,
        renderedContainerHeight,
        items
      )(
        (st, ch, itemList) =>
          computeFixedRange(
            st,
            ch,
            itemList.length,
            itemHeight as number,
            overscan
          ),
        rangeEqual
      )
    : computedOf(
        scrollTop,
        renderedContainerHeight,
        items,
        cumulativeHeights!
      )(
        (st, ch, itemList, cumulative) =>
          computeVariableRange(st, ch, itemList.length, cumulative, overscan),
        rangeEqual
      )

  // Derive the visible items slice including item data and absolute index
  const visibleItemsSignal = computedOf(
    visibleRangeSignal,
    items
  )((range, itemList) => {
    const { startIndex, endIndex } = range
    const result: Array<{ item: T; index: number }> = []
    for (let i = startIndex; i <= endIndex && i < itemList.length; i++) {
      result.push({ item: itemList[i]!, index: i })
    }
    return result
  })

  // Derive the transform offset for the viewport div
  const transformSignal = computedOf(visibleRangeSignal)(
    range => `translateY(${range.offset}px)`
  )

  // Derive container height as CSS string
  const containerHeightStyle = computedOf(containerHeight)(h =>
    typeof h === 'number' ? `${h}px` : h
  )

  // Derive combined class
  const containerClass = computedOf(className ?? '')(cls =>
    cls ? `bc-virtual-list ${cls}` : 'bc-virtual-list'
  )

  return Use(BeatUII18n, t =>
    html.div(
      attr.class(containerClass),
      style.height(containerHeightStyle),
      aria.label(t.$.virtualList.$.listLabel),
      attr.role('list'),

      // Attach scroll listener and resize observer using WithElement
      WithElement((el: HTMLElement) => {
        const handleScroll = () => {
          scrollTop.set(el.scrollTop)
        }

        // Capture initial dimensions
        renderedContainerHeight.set(el.clientHeight || 400)

        el.addEventListener('scroll', handleScroll, { passive: true })

        // Observe container size changes so height stays accurate
        const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            renderedContainerHeight.set(entry.contentRect.height || 400)
          }
        })
        resizeObserver.observe(el)

        return OnDispose(() => {
          el.removeEventListener('scroll', handleScroll)
          resizeObserver.disconnect()
        })
      }),

      // Spacer: establishes total scrollable height
      html.div(
        attr.class('bc-virtual-list__spacer'),
        style.height(Value.map(totalHeight, h => `${h}px`))
      ),

      // Viewport: absolutely positioned, translated to show only visible items
      html.div(
        attr.class('bc-virtual-list__viewport'),
        style.transform(transformSignal),

        MapSignal(visibleItemsSignal, visibleItems =>
          Fragment(
            ...visibleItems.map(({ item, index }) => renderItem(item, index))
          )
        )
      )
    )
  )
}

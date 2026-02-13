import {
  attr,
  computedOf,
  Fragment,
  html,
  on,
  OnDispose,
  prop,
  style,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'
import { biMax, biMin } from '@tempots/std'

/**
 * Controls how the end sidebar and footer regions are anchored relative
 * to the body content or the container edge.
 *
 * - `'container-edge'` - Anchors to the container edge (fixed position)
 * - `'body-end'` - Anchors the end sidebar to the body content's right edge
 * - `'body-bottom'` - Anchors the footer to the body content's bottom edge
 * - `'body-end-bottom'` - Anchors both end sidebar and footer to the body content edges
 */
export type AnchorMode =
  | 'container-edge'
  | 'body-end'
  | 'body-bottom'
  | 'body-end-bottom'

/**
 * Configuration options for the {@link NineSliceScrollView} component.
 *
 * The nine-slice layout divides the view into nine regions arranged in a 3x3 grid:
 * ```
 * +------------+----------+----------+
 * | topStart   | header   | topEnd   |
 * +------------+----------+----------+
 * | sideStart  |   body   | sideEnd  |
 * +------------+----------+----------+
 * | bottomStart| footer   | bottomEnd|
 * +------------+----------+----------+
 * ```
 *
 * The body region scrolls while surrounding regions remain fixed. Header and
 * footer translate horizontally with the body, while sidebars translate vertically.
 * Corner regions remain completely fixed.
 */
export type NineSliceScrollViewOptions = {
  /** The main scrollable content area (center cell of the nine-slice grid). */
  body: TNode
  /** Total width of the scrollable content in the body, as a bigint in pixels. */
  contentWidth: Value<bigint>
  /** Total height of the scrollable content in the body, as a bigint in pixels. */
  contentHeight: Value<bigint>

  /**
   * Content for the top-center header region. Scrolls horizontally with the body
   * but remains fixed vertically.
   */
  header?: TNode
  /**
   * Fixed pixel height of the header region.
   * @default 0
   */
  headerHeight?: Value<number>
  /** Content for the top-start corner (top-left in LTR, top-right in RTL). */
  topStart?: TNode
  /** Content for the top-end corner (top-right in LTR, top-left in RTL). */
  topEnd?: TNode

  /**
   * Content for the bottom-center footer region. Scrolls horizontally with the body
   * but remains fixed vertically.
   */
  footer?: TNode
  /**
   * Fixed pixel height of the footer region.
   * @default 0
   */
  footerHeight?: Value<number>
  /** Content for the bottom-start corner (bottom-left in LTR, bottom-right in RTL). */
  bottomStart?: TNode
  /** Content for the bottom-end corner (bottom-right in LTR, bottom-left in RTL). */
  bottomEnd?: TNode

  /**
   * Content for the start sidebar (left in LTR, right in RTL). Scrolls vertically
   * with the body but remains fixed horizontally.
   */
  sidebarStart?: TNode
  /**
   * Fixed pixel width of the start sidebar.
   * @default 0
   */
  sidebarStartWidth?: Value<number>
  /**
   * Content for the end sidebar (right in LTR, left in RTL). Scrolls vertically
   * with the body but remains fixed horizontally.
   */
  sidebarEnd?: TNode
  /**
   * Fixed pixel width of the end sidebar.
   * @default 0
   */
  sidebarEndWidth?: Value<number>

  /**
   * Controls how the end sidebar and footer anchor relative to the body content.
   * @default 'container-edge'
   */
  anchorMode?: Value<AnchorMode>
}

function toPx(v: Value<number>): string {
  return `${v}px`
}

function valueToPx(v: Value<number>) {
  return Value.map(v, toPx)
}

/**
 * Renders a nine-slice scrolling layout where the central body region scrolls
 * in both axes while surrounding regions (header, footer, sidebars, and corners)
 * remain fixed or scroll in only one axis. This is ideal for spreadsheet-like
 * UIs, data grids with frozen rows/columns, or any layout requiring synchronized
 * scrolling with fixed periphery.
 *
 * The component manages its own scroll state via wheel event throttling and
 * custom scrollbars, providing consistent cross-browser behavior. Content
 * dimensions must be provided explicitly since the body content is translated
 * rather than natively scrolled.
 *
 * @param options - Configuration options for the nine-slice scroll view.
 * @returns A renderable nine-slice container element.
 *
 * @example
 * ```typescript
 * const contentW = prop(5000n)
 * const contentH = prop(10000n)
 *
 * NineSliceScrollView({
 *   body: html.div(
 *     // Large scrollable content
 *     ...cells
 *   ),
 *   contentWidth: contentW,
 *   contentHeight: contentH,
 *   header: html.div('Column Headers'),
 *   headerHeight: 40,
 *   sidebarStart: html.div('Row Labels'),
 *   sidebarStartWidth: 200,
 *   topStart: html.div('Corner'),
 * })
 * ```
 */
export function NineSliceScrollView({
  body,
  contentWidth,
  contentHeight,
  header,
  headerHeight = 0,
  topStart,
  topEnd,
  footer,
  footerHeight = 0,
  bottomStart,
  bottomEnd,
  sidebarStart,
  sidebarStartWidth = 0,
  sidebarEnd,
  sidebarEndWidth = 0,
  anchorMode = 'container-edge',
}: NineSliceScrollViewOptions) {
  const verticalScrollPosition = prop(0n)
  const horizontalScrollPosition = prop(0n)

  const headerHeightPx = valueToPx(headerHeight)
  // const footerHeightPx = valueToPx(footerHeight)
  const sidebarStartWidthPx = valueToPx(sidebarStartWidth)
  // const sidebarEndWidthPx = valueToPx(sidebarEndWidth)
  const scrollbarThickness = prop(16)

  return html.div(
    attr.class('bc-nine-slice-container'),
    ElementRect(rect => {
      const viewportWidth = computedOf(
        rect.$.width,
        sidebarStartWidth,
        sidebarEndWidth
      )((width, startWidth, endWidth) => {
        return width - startWidth - endWidth
      })
      const viewportHeight = computedOf(
        rect.$.height,
        headerHeight,
        footerHeight
      )((height, headerHeight, footerHeight) => {
        return height - headerHeight - footerHeight
      })
      const needsHorizontalScroll = computedOf(
        contentWidth,
        viewportWidth
      )((contentWidth, viewportWidth) => {
        return contentWidth > BigInt(viewportWidth)
      })
      const needsVerticalScroll = computedOf(
        contentHeight,
        viewportHeight
      )((contentHeight, viewportHeight) => {
        return contentHeight > BigInt(viewportHeight)
      })
      const visibleAreaWidth = computedOf(
        viewportWidth,
        needsVerticalScroll,
        scrollbarThickness
      )((width, hasScrollbar, thickness) => {
        return hasScrollbar ? width - thickness : width
      })
      const visibleAreaHeight = computedOf(
        viewportHeight,
        needsHorizontalScroll,
        scrollbarThickness
      )((height, hasScrollbar, thickness) => {
        return hasScrollbar ? height - thickness : height
      })
      // const visibleAreaWidthPx = valueToPx(visibleAreaWidth)
      // const visibleAreaHeightPx = valueToPx(visibleAreaHeight)

      const scrollRatioHorizontal = computedOf(
        contentWidth,
        visibleAreaWidth
      )((contentWidth, visibleWidth) => {
        return Number(contentWidth / BigInt(Math.max(1, visibleWidth)))
      })
      const scrollRatioVertical = computedOf(
        contentHeight,
        visibleAreaHeight
      )((contentHeight, visibleHeight) => {
        return Number(contentHeight / BigInt(Math.max(1, visibleHeight)))
      })

      // Calculate positioning based on anchor mode
      const shouldAnchorEndToBody = Value.map(
        anchorMode,
        mode => mode === 'body-end' || mode === 'body-end-bottom'
      )
      const EndAnchor = When(
        shouldAnchorEndToBody,
        () =>
          style.left(
            computedOf(
              sidebarStartWidth,
              contentWidth,
              visibleAreaWidth,
              sidebarEndWidth
            )((startWidth, contentW, visibleW, endWidth) => {
              // When content is smaller than viewport, anchor to content end
              // When content is larger, fix to viewport edge to keep visible
              const contentEnd = startWidth + Number(contentW)
              const viewportEnd = startWidth + visibleW
              const position = Math.min(contentEnd, viewportEnd)
              // Ensure end sidebar stays fully visible
              return `${Math.max(startWidth + endWidth, position)}px`
            })
          ),
        () => style.right('0')
      )
      const shouldAnchorFooterToBody = Value.map(
        anchorMode,
        mode => mode === 'body-bottom' || mode === 'body-end-bottom'
      )
      const FooterAnchor = When(
        shouldAnchorFooterToBody,
        () =>
          style.top(
            computedOf(
              headerHeight,
              contentHeight,
              visibleAreaHeight,
              footerHeight
            )((headerH, contentH, visibleH, footerH) => {
              // When content is smaller than viewport, anchor to content bottom
              // When content is larger, fix to viewport edge to keep visible
              const contentBottom = headerH + Number(contentH)
              const viewportBottom = headerH + visibleH
              const position = Math.min(contentBottom, viewportBottom)
              // Ensure footer stays fully visible
              return `${Math.max(headerH + footerH, position)}px`
            })
          ),
        () => style.bottom('0')
      )

      const endSideOffset = computedOf(
        needsVerticalScroll,
        scrollbarThickness
      )((hasScrollbar, thickness) => {
        return hasScrollbar ? `${thickness}px` : '0'
      })
      const bottomOffset = computedOf(
        needsHorizontalScroll,
        scrollbarThickness
      )((hasScrollbar, thickness) => {
        return hasScrollbar ? `${thickness}px` : '0'
      })

      const contentTransform = style.transform(
        computedOf(
          horizontalScrollPosition,
          verticalScrollPosition,
          needsHorizontalScroll,
          needsVerticalScroll
        )((hPos, vPos, needsH, needsV) => {
          const hTransform = needsH ? `translateX(-${hPos}px)` : ''
          const vTransform = needsV ? `translateY(-${vPos}px)` : ''
          return `${hTransform} ${vTransform}`.trim() || 'none'
        })
      )
      const horizontalTransform = style.transform(
        horizontalScrollPosition.map(scrollPos => `translateX(-${scrollPos}px)`)
      )
      const verticalTransform = style.transform(
        verticalScrollPosition.map(scrollPos => `translateY(-${scrollPos}px)`)
      )

      // Cache max scroll values as computed values to avoid recalculation in event handlers
      const maxVerticalScroll = computedOf(
        contentHeight,
        visibleAreaHeight
      )((content, visible) => content - BigInt(Math.max(1, visible)))

      const maxHorizontalScroll = computedOf(
        contentWidth,
        visibleAreaWidth
      )((content, visible) => content - BigInt(Math.max(1, visible)))

      // Throttle mechanism for wheel events
      let wheelThrottleTimer: ReturnType<typeof setTimeout> | null = null
      let accumulatedDeltaX = 0
      let accumulatedDeltaY = 0

      const processWheelEvent = () => {
        // Use cached values instead of reading directly
        const maxV = maxVerticalScroll.value
        const maxH = maxHorizontalScroll.value
        const needsV = needsVerticalScroll.value
        const needsH = needsHorizontalScroll.value

        if (needsV && accumulatedDeltaY !== 0) {
          const newVerticalPosition = biMin(
            biMax(0n, maxV),
            biMax(
              0n,
              verticalScrollPosition.value +
                BigInt(Math.round(accumulatedDeltaY))
            )
          )
          verticalScrollPosition.set(newVerticalPosition)
        }

        if (needsH && accumulatedDeltaX !== 0) {
          const newHorizontalPosition = biMin(
            biMax(0n, maxH),
            biMax(
              0n,
              horizontalScrollPosition.value +
                BigInt(Math.round(accumulatedDeltaX))
            )
          )
          horizontalScrollPosition.set(newHorizontalPosition)
        }

        accumulatedDeltaX = 0
        accumulatedDeltaY = 0
        wheelThrottleTimer = null
      }

      needsHorizontalScroll.on(need => {
        if (!need) horizontalScrollPosition.set(0n)
      })
      needsVerticalScroll.on(need => {
        if (!need) verticalScrollPosition.set(0n)
      })
      return Fragment(
        OnDispose(() => {
          if (wheelThrottleTimer) {
            clearTimeout(wheelThrottleTimer)
          }
        }),
        on.wheel(event => {
          event.preventDefault()
          const { deltaX, deltaY } = event

          // Accumulate deltas
          accumulatedDeltaX += deltaX
          accumulatedDeltaY += deltaY

          // Throttle to 60fps (16ms)
          if (!wheelThrottleTimer) {
            wheelThrottleTimer = setTimeout(processWheelEvent, 16)
          }
        }),
        html.div(
          attr.class('bc-nine-slice-pane-container'),
          style.right(endSideOffset),
          style.bottom(bottomOffset),
          // top-start corner
          topStart != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-top-start'),
                style.top('0'),
                style.left('0'),
                // style.height(headerHeightPx),
                // style.width(sidebarStartWidthPx),
                topStart
              )
            : null,
          // top-center
          header != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-header'),
                style.top('0'),
                style.left(sidebarStartWidthPx),
                // style.height(headerHeightPx),
                // style.width(visibleAreaWidthPx),
                html.div(
                  attr.class('bc-nine-slice-pane-content'),
                  horizontalTransform,
                  header
                )
              )
            : null,
          // top-end corner
          topEnd != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-top-end'),
                style.top('0'),
                EndAnchor,
                // style.height(headerHeightPx),
                // style.width(sidebarEndWidthPx),
                topEnd
              )
            : null,
          // middle-start sidebar
          sidebarStart != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-sidebar-start'),
                style.left('0'),
                style.top(headerHeightPx),
                // style.height(visibleAreaHeightPx),
                // style.width(sidebarStartWidthPx),
                html.div(
                  attr.class('bc-nine-slice-pane-content'),
                  verticalTransform,
                  sidebarStart
                )
              )
            : null,
          // middle-center (main body)
          html.div(
            attr.class('bc-nine-slice-pane bc-nine-slice-body'),
            style.left(sidebarStartWidthPx),
            style.top(headerHeightPx),
            // style.width(visibleAreaWidth.map(toPx)),
            // style.height(visibleAreaHeight.map(toPx)),
            html.div(
              attr.class('bc-nine-slice-pane-content'),
              contentTransform,
              body
            )
          ),
          // middle-end sidebar
          sidebarEnd != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-sidebar-end'),
                EndAnchor,
                style.top(headerHeightPx),
                // style.height(visibleAreaHeightPx),
                // style.width(sidebarEndWidthPx),
                html.div(
                  attr.class('bc-nine-slice-pane-content'),
                  verticalTransform,
                  sidebarEnd
                )
              )
            : null,
          // bottom-start corner
          bottomStart != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-bottom-start'),
                style.left('0'),
                FooterAnchor,
                // style.height(footerHeightPx),
                // style.width(sidebarStartWidthPx),
                bottomStart
              )
            : null,
          // bottom-center
          footer != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-footer'),
                style.left(sidebarStartWidthPx),
                FooterAnchor,
                // style.height(footerHeightPx),
                // style.width(visibleAreaWidthPx),
                html.div(
                  attr.class('bc-nine-slice-pane-content'),
                  horizontalTransform,
                  footer
                )
              )
            : null,
          // bottom-end corner
          bottomEnd != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-bottom-end'),
                EndAnchor,
                FooterAnchor,
                // style.height(footerHeightPx),
                // style.width(sidebarEndWidthPx),
                bottomEnd
              )
            : null
        ),
        // horizontal scrollbar
        html.div(
          attr.class('bc-nine-slice-pane bc-nine-slice-horizontal-scrollbar'),
          style.overflowX('scroll'),
          style.left('0'),
          style.right(
            computedOf(
              needsVerticalScroll,
              scrollbarThickness
            )((hasScrollbar, thickness) => {
              return hasScrollbar ? `${thickness}px` : '0'
            })
          ),
          style.bottom('0'),
          style.height(
            needsHorizontalScroll.map((hasScrollbar): string =>
              hasScrollbar ? '16px' : '0'
            )
          ),
          html.div(
            attr.class(
              'bc-nine-slice-pane bc-nine-slice-horizontal-scrollbar-thumb'
            ),
            style.width(
              scrollRatioHorizontal.map(ratio => `${100 / Math.max(1, ratio)}%`)
            ),
            style.height('100%'),
            style.backgroundColor('#ff000066')
          ),
          on.scroll(event => {
            const target = event.target as HTMLElement
            const scrollLeft = target.scrollLeft
            const scrollableWidth = target.scrollWidth - target.clientWidth
            if (scrollableWidth > 0) {
              const scrollFraction = scrollLeft / scrollableWidth
              // Use cached max value instead of recalculating
              const maxH = maxHorizontalScroll.value
              horizontalScrollPosition.set(
                BigInt(Math.round(Number(maxH) * scrollFraction))
              )
            }
          })
        ),
        // vertical scrollbar
        html.div(
          attr.class('bc-nine-slice-pane bc-nine-slice-vertical-scrollbar'),
          style.overflowY('scroll'),
          style.top('0'),
          style.bottom(
            computedOf(
              needsHorizontalScroll,
              scrollbarThickness
            )((hasScrollbar, thickness) => {
              return hasScrollbar ? `${thickness}px` : '0'
            })
          ),
          style.right('0'),
          style.width(
            needsVerticalScroll.map((hasScrollbar): string =>
              hasScrollbar ? '16px' : '0'
            )
          ),
          html.div(
            attr.class(
              'bc-nine-slice-pane bc-nine-slice-vertical-scrollbar-thumb'
            ),
            style.width('100%'),
            style.height(
              computedOf(
                headerHeight,
                footerHeight,
                contentHeight,
                scrollRatioVertical
              )((_headerHeight, _footerHeight, _contentHeight, scrollRatio) => {
                return `${100 / Math.max(1, scrollRatio)}%`
              })
            ),
            style.backgroundColor('#ff000066')
          ),
          on.scroll(event => {
            const target = event.target as HTMLElement
            const scrollTop = target.scrollTop
            const scrollableHeight = target.scrollHeight - target.clientHeight
            if (scrollableHeight > 0) {
              const scrollFraction = scrollTop / scrollableHeight
              // Use cached max value instead of recalculating
              const maxV = maxVerticalScroll.value
              verticalScrollPosition.set(
                BigInt(Math.round(Number(maxV) * scrollFraction))
              )
            }
          })
        )
      )
    })
  )
}

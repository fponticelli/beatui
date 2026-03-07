import {
  aria,
  attr,
  computedOf,
  createInertiaHandler,
  Fragment,
  html,
  on,
  OnDispose,
  prop,
  style,
  TNode,
  Value,
  When,
  WithElement,
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

const SCROLLBAR_SIZE = 12
const KEYBOARD_STEP = 40

function toPx(v: Value<number>): string {
  return `${v}px`
}

function valueToPx(v: Value<number>) {
  return Value.map(v, toPx)
}

function clampScroll(position: bigint, maxScroll: bigint): bigint {
  return biMin(biMax(0n, maxScroll), biMax(0n, position))
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
  const sidebarStartWidthPx = valueToPx(sidebarStartWidth)

  return html.div(
    attr.class('bc-nine-slice-container'),
    attr.tabindex(0),
    attr.role('group'),
    aria.label('Scrollable grid view'),
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
      )((height, hh, fh) => {
        return height - hh - fh
      })

      const needsHorizontalScroll = computedOf(
        contentWidth,
        viewportWidth
      )((cw, vw) => cw > BigInt(Math.max(0, vw)))

      const needsVerticalScroll = computedOf(
        contentHeight,
        viewportHeight
      )((ch, vh) => ch > BigInt(Math.max(0, vh)))

      const visibleAreaWidth = computedOf(
        viewportWidth,
        needsVerticalScroll
      )((width, hasVScroll) => {
        return hasVScroll ? width - SCROLLBAR_SIZE : width
      })

      const visibleAreaHeight = computedOf(
        viewportHeight,
        needsHorizontalScroll
      )((height, hasHScroll) => {
        return hasHScroll ? height - SCROLLBAR_SIZE : height
      })

      const maxVerticalScroll = computedOf(
        contentHeight,
        visibleAreaHeight
      )((content, visible) => biMax(0n, content - BigInt(Math.max(1, visible))))

      const maxHorizontalScroll = computedOf(
        contentWidth,
        visibleAreaWidth
      )((content, visible) => biMax(0n, content - BigInt(Math.max(1, visible))))

      // Anchor mode computations
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
              const contentEnd = startWidth + Number(contentW)
              const viewportEnd = startWidth + visibleW
              const position = Math.min(contentEnd, viewportEnd)
              return `${Math.max(startWidth + endWidth, position)}px`
            })
          ),
        () => style.right(`${SCROLLBAR_SIZE}px`)
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
            )((hh, contentH, visibleH, fh) => {
              const contentBottom = hh + Number(contentH)
              const viewportBottom = hh + visibleH
              const position = Math.min(contentBottom, viewportBottom)
              return `${Math.max(hh + fh, position)}px`
            })
          ),
        () => style.bottom(`${SCROLLBAR_SIZE}px`)
      )

      const endSideOffset = computedOf(needsVerticalScroll)((
        hasScrollbar
      ): string => {
        return hasScrollbar ? `${SCROLLBAR_SIZE}px` : '0'
      })
      const bottomOffset = computedOf(needsHorizontalScroll)((
        hasScrollbar
      ): string => {
        return hasScrollbar ? `${SCROLLBAR_SIZE}px` : '0'
      })

      // Content transforms
      const contentTransform = style.transform(
        computedOf(
          horizontalScrollPosition,
          verticalScrollPosition,
          needsHorizontalScroll,
          needsVerticalScroll
        )((hPos, vPos, needsH, needsV) => {
          const hT = needsH ? `translateX(-${hPos}px)` : ''
          const vT = needsV ? `translateY(-${vPos}px)` : ''
          return `${hT} ${vT}`.trim() || 'none'
        })
      )
      const horizontalTransform = style.transform(
        horizontalScrollPosition.map(p => `translateX(-${p}px)`)
      )
      const verticalTransform = style.transform(
        verticalScrollPosition.map(p => `translateY(-${p}px)`)
      )

      // Wheel event throttling
      let wheelThrottleTimer: ReturnType<typeof setTimeout> | null = null
      let accumulatedDeltaX = 0
      let accumulatedDeltaY = 0

      const processWheelEvent = () => {
        const maxV = maxVerticalScroll.value
        const maxH = maxHorizontalScroll.value
        const needsV = needsVerticalScroll.value
        const needsH = needsHorizontalScroll.value

        if (needsV && accumulatedDeltaY !== 0) {
          verticalScrollPosition.set(
            clampScroll(
              verticalScrollPosition.value +
                BigInt(Math.round(accumulatedDeltaY)),
              maxV
            )
          )
        }

        if (needsH && accumulatedDeltaX !== 0) {
          horizontalScrollPosition.set(
            clampScroll(
              horizontalScrollPosition.value +
                BigInt(Math.round(accumulatedDeltaX)),
              maxH
            )
          )
        }

        accumulatedDeltaX = 0
        accumulatedDeltaY = 0
        wheelThrottleTimer = null
      }

      // Reset scroll when content fits
      needsHorizontalScroll.on(need => {
        if (!need) horizontalScrollPosition.set(0n)
      })
      needsVerticalScroll.on(need => {
        if (!need) verticalScrollPosition.set(0n)
      })

      // Inertia handler for body drag
      const inertia = createInertiaHandler(
        (dx, dy) => {
          const maxH = maxHorizontalScroll.value
          const maxV = maxVerticalScroll.value
          if (needsHorizontalScroll.value) {
            horizontalScrollPosition.set(
              clampScroll(
                horizontalScrollPosition.value - BigInt(Math.round(dx)),
                maxH
              )
            )
          }
          if (needsVerticalScroll.value) {
            verticalScrollPosition.set(
              clampScroll(
                verticalScrollPosition.value - BigInt(Math.round(dy)),
                maxV
              )
            )
          }
        },
        { friction: 0.92, minVelocity: 0.5 }
      )

      let inertiaCancel: { dispose: () => void } | null = null

      // Scrollbar thumb size and position computations
      const hThumbFraction = computedOf(
        visibleAreaWidth,
        contentWidth
      )((visible, content) => {
        const c = Number(content)
        return c > 0 ? Math.max(24, (visible * visible) / c) : 0
      })

      const hTrackUsable = computedOf(
        visibleAreaWidth,
        hThumbFraction
      )((track, thumb) => Math.max(1, track - thumb))

      const hThumbOffset = computedOf(
        horizontalScrollPosition,
        maxHorizontalScroll,
        hTrackUsable
      )((pos, maxS, usable) => {
        const max = Number(maxS)
        return max > 0 ? (Number(pos) / max) * usable : 0
      })

      const vThumbFraction = computedOf(
        visibleAreaHeight,
        contentHeight
      )((visible, content) => {
        const c = Number(content)
        return c > 0 ? Math.max(24, (visible * visible) / c) : 0
      })

      const vTrackUsable = computedOf(
        visibleAreaHeight,
        vThumbFraction
      )((track, thumb) => Math.max(1, track - thumb))

      const vThumbOffset = computedOf(
        verticalScrollPosition,
        maxVerticalScroll,
        vTrackUsable
      )((pos, maxS, usable) => {
        const max = Number(maxS)
        return max > 0 ? (Number(pos) / max) * usable : 0
      })

      // Drag handler factory for scrollbar thumbs
      function makeScrollbarDrag(
        orientation: 'horizontal' | 'vertical',
        scrollPosition: ReturnType<typeof prop<bigint>>,
        maxScroll: Value<bigint>,
        trackUsable: Value<number>
      ) {
        return on.pointerdown((e: PointerEvent) => {
          e.preventDefault()
          e.stopPropagation()
          const startClient =
            orientation === 'horizontal' ? e.clientX : e.clientY
          const startScroll = Number(scrollPosition.value)

          const onPointerMove = (moveEvt: PointerEvent) => {
            const delta =
              orientation === 'horizontal'
                ? moveEvt.clientX - startClient
                : moveEvt.clientY - startClient
            const usable = Value.get(trackUsable)
            const max = Number(Value.get(maxScroll))
            if (usable > 0 && max > 0) {
              const newScroll = startScroll + (delta / usable) * max
              scrollPosition.set(
                clampScroll(BigInt(Math.round(newScroll)), Value.get(maxScroll))
              )
            }
          }

          const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
          }

          window.addEventListener('pointermove', onPointerMove)
          window.addEventListener('pointerup', onPointerUp)
        })
      }

      // Track click handler factory
      function makeTrackClick(
        orientation: 'horizontal' | 'vertical',
        scrollPosition: ReturnType<typeof prop<bigint>>,
        maxScroll: Value<bigint>,
        trackUsable: Value<number>,
        thumbSize: Value<number>
      ) {
        return on.pointerdown((e: PointerEvent) => {
          const target = e.target as HTMLElement
          if (!target.classList.contains('bc-nine-slice-scrollbar-track'))
            return
          e.preventDefault()
          const rect = target.getBoundingClientRect()
          const clickPos =
            orientation === 'horizontal'
              ? e.clientX - rect.left
              : e.clientY - rect.top
          const thumbHalf = Value.get(thumbSize) / 2
          const usable = Value.get(trackUsable)
          const max = Number(Value.get(maxScroll))
          if (usable > 0 && max > 0) {
            const fraction = Math.max(
              0,
              Math.min(1, (clickPos - thumbHalf) / usable)
            )
            scrollPosition.set(
              clampScroll(BigInt(Math.round(fraction * max)), Value.get(maxScroll))
            )
          }
        })
      }

      return Fragment(
        OnDispose(() => {
          if (wheelThrottleTimer) clearTimeout(wheelThrottleTimer)
          if (inertiaCancel) inertiaCancel.dispose()
        }),
        // Wheel handler
        on.wheel(event => {
          event.preventDefault()
          accumulatedDeltaX += event.deltaX
          accumulatedDeltaY += event.deltaY
          if (!wheelThrottleTimer) {
            wheelThrottleTimer = setTimeout(processWheelEvent, 16)
          }
        }),
        // Keyboard handler
        on.keydown(event => {
          const needsH = needsHorizontalScroll.value
          const needsV = needsVerticalScroll.value
          let handled = false

          switch (event.key) {
            case 'ArrowUp':
              if (needsV) {
                verticalScrollPosition.set(
                  clampScroll(
                    verticalScrollPosition.value - BigInt(KEYBOARD_STEP),
                    maxVerticalScroll.value
                  )
                )
                handled = true
              }
              break
            case 'ArrowDown':
              if (needsV) {
                verticalScrollPosition.set(
                  clampScroll(
                    verticalScrollPosition.value + BigInt(KEYBOARD_STEP),
                    maxVerticalScroll.value
                  )
                )
                handled = true
              }
              break
            case 'ArrowLeft':
              if (needsH) {
                horizontalScrollPosition.set(
                  clampScroll(
                    horizontalScrollPosition.value - BigInt(KEYBOARD_STEP),
                    maxHorizontalScroll.value
                  )
                )
                handled = true
              }
              break
            case 'ArrowRight':
              if (needsH) {
                horizontalScrollPosition.set(
                  clampScroll(
                    horizontalScrollPosition.value + BigInt(KEYBOARD_STEP),
                    maxHorizontalScroll.value
                  )
                )
                handled = true
              }
              break
            case 'PageUp':
              if (needsV) {
                verticalScrollPosition.set(
                  clampScroll(
                    verticalScrollPosition.value -
                      BigInt(Math.round(visibleAreaHeight.value)),
                    maxVerticalScroll.value
                  )
                )
                handled = true
              }
              break
            case 'PageDown':
              if (needsV) {
                verticalScrollPosition.set(
                  clampScroll(
                    verticalScrollPosition.value +
                      BigInt(Math.round(visibleAreaHeight.value)),
                    maxVerticalScroll.value
                  )
                )
                handled = true
              }
              break
            case 'Home':
              if (needsV) {
                verticalScrollPosition.set(0n)
                handled = true
              }
              if (needsH) {
                horizontalScrollPosition.set(0n)
                handled = true
              }
              break
            case 'End':
              if (needsV) {
                verticalScrollPosition.set(maxVerticalScroll.value)
                handled = true
              }
              if (needsH) {
                horizontalScrollPosition.set(maxHorizontalScroll.value)
                handled = true
              }
              break
          }

          if (handled) event.preventDefault()
        }),
        // Pane container
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
                topStart
              )
            : null,
          // header
          header != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-header'),
                style.top('0'),
                style.left(sidebarStartWidthPx),
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
                topEnd
              )
            : null,
          // sidebar start
          sidebarStart != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-sidebar-start'),
                style.left('0'),
                style.top(headerHeightPx),
                html.div(
                  attr.class('bc-nine-slice-pane-content'),
                  verticalTransform,
                  sidebarStart
                )
              )
            : null,
          // body
          html.div(
            attr.class('bc-nine-slice-pane bc-nine-slice-body'),
            style.left(sidebarStartWidthPx),
            style.top(headerHeightPx),
            // Body drag via pointer events for inertia
            on.pointerdown((e: PointerEvent) => {
              if (e.button !== 0) return
              if (inertiaCancel) {
                inertiaCancel.dispose()
                inertiaCancel = null
              }
              inertia.track(e.clientX, e.clientY)

              const onPointerMove = (moveEvt: PointerEvent) => {
                const dx = moveEvt.clientX - lastX
                const dy = moveEvt.clientY - lastY
                lastX = moveEvt.clientX
                lastY = moveEvt.clientY
                inertia.track(moveEvt.clientX, moveEvt.clientY)

                const maxH = maxHorizontalScroll.value
                const maxV = maxVerticalScroll.value
                if (needsHorizontalScroll.value) {
                  horizontalScrollPosition.set(
                    clampScroll(
                      horizontalScrollPosition.value - BigInt(Math.round(dx)),
                      maxH
                    )
                  )
                }
                if (needsVerticalScroll.value) {
                  verticalScrollPosition.set(
                    clampScroll(
                      verticalScrollPosition.value - BigInt(Math.round(dy)),
                      maxV
                    )
                  )
                }
              }

              let lastX = e.clientX
              let lastY = e.clientY

              const onPointerUp = () => {
                inertiaCancel = inertia.release()
                window.removeEventListener('pointermove', onPointerMove)
                window.removeEventListener('pointerup', onPointerUp)
              }

              window.addEventListener('pointermove', onPointerMove)
              window.addEventListener('pointerup', onPointerUp)
            }),
            style.cursor(
              computedOf(
                needsHorizontalScroll,
                needsVerticalScroll
              )((h, v): string => (h || v ? 'grab' : 'default'))
            ),
            html.div(
              attr.class('bc-nine-slice-pane-content'),
              contentTransform,
              body
            )
          ),
          // sidebar end
          sidebarEnd != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-sidebar-end'),
                EndAnchor,
                style.top(headerHeightPx),
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
                bottomStart
              )
            : null,
          // footer
          footer != null
            ? html.div(
                attr.class('bc-nine-slice-pane bc-nine-slice-footer'),
                style.left(sidebarStartWidthPx),
                FooterAnchor,
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
                bottomEnd
              )
            : null
        ),
        // Horizontal scrollbar
        html.div(
          attr.class(
            needsHorizontalScroll.map(
              needs =>
                `bc-nine-slice-scrollbar bc-nine-slice-scrollbar--horizontal${needs ? '' : ' bc-nine-slice-scrollbar--hidden'}`
            )
          ),
          style.left(valueToPx(sidebarStartWidth)),
          style.right(endSideOffset),
          makeTrackClick(
            'horizontal',
            horizontalScrollPosition,
            maxHorizontalScroll,
            hTrackUsable,
            hThumbFraction
          ),
          WithElement(el => {
            return Fragment(
              attr.role('scrollbar'),
              aria.orientation('horizontal'),
              aria.valuemin(0),
              OnDispose(
                Value.on(maxHorizontalScroll, max => {
                  el.setAttribute('aria-valuemax', String(max))
                }),
                Value.on(horizontalScrollPosition, pos => {
                  el.setAttribute('aria-valuenow', String(pos))
                })
              ),
              html.div(
                attr.class('bc-nine-slice-scrollbar-track'),
                html.div(
                  attr.class('bc-nine-slice-scrollbar-thumb'),
                  style.width(hThumbFraction.map(w => `${w}px`)),
                  style.transform(hThumbOffset.map(o => `translateX(${o}px)`)),
                  makeScrollbarDrag(
                    'horizontal',
                    horizontalScrollPosition,
                    maxHorizontalScroll,
                    hTrackUsable
                  )
                )
              )
            )
          })
        ),
        // Vertical scrollbar
        html.div(
          attr.class(
            needsVerticalScroll.map(
              needs =>
                `bc-nine-slice-scrollbar bc-nine-slice-scrollbar--vertical${needs ? '' : ' bc-nine-slice-scrollbar--hidden'}`
            )
          ),
          style.top(headerHeightPx),
          style.bottom(bottomOffset),
          makeTrackClick(
            'vertical',
            verticalScrollPosition,
            maxVerticalScroll,
            vTrackUsable,
            vThumbFraction
          ),
          WithElement(el => {
            return Fragment(
              attr.role('scrollbar'),
              aria.orientation('vertical'),
              aria.valuemin(0),
              OnDispose(
                Value.on(maxVerticalScroll, max => {
                  el.setAttribute('aria-valuemax', String(max))
                }),
                Value.on(verticalScrollPosition, pos => {
                  el.setAttribute('aria-valuenow', String(pos))
                })
              ),
              html.div(
                attr.class('bc-nine-slice-scrollbar-track'),
                html.div(
                  attr.class('bc-nine-slice-scrollbar-thumb'),
                  style.height(vThumbFraction.map(h => `${h}px`)),
                  style.transform(vThumbOffset.map(o => `translateY(${o}px)`)),
                  makeScrollbarDrag(
                    'vertical',
                    verticalScrollPosition,
                    maxVerticalScroll,
                    vTrackUsable
                  )
                )
              )
            )
          })
        )
      )
    })
  )
}

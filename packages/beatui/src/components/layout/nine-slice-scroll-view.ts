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

export type AnchorMode =
  | 'container-edge' // Current behavior: anchor to container edge
  | 'body-end' // Anchor end sidebar to body end
  | 'body-bottom' // Anchor footer to body bottom
  | 'body-end-bottom' // Anchor both end sidebar and footer to body

export type NineSliceScrollViewOptions = {
  // Main content area
  body: TNode
  // Content dimensions (actual size of scrollable content)
  contentWidth: Value<bigint>
  contentHeight: Value<bigint>

  // Top row sections
  header?: TNode
  headerHeight?: Value<number>
  topStart?: TNode // top-left in LTR, top-right in RTL
  topEnd?: TNode // top-right in LTR, top-left in RTL

  // Bottom row sections
  footer?: TNode
  footerHeight?: Value<number>
  bottomStart?: TNode // bottom-left in LTR, bottom-right in RTL
  bottomEnd?: TNode // bottom-right in LTR, bottom-left in RTL

  // Side sections (start/end for RTL support)
  sidebarStart?: TNode // left in LTR, right in RTL
  sidebarStartWidth?: Value<number>
  sidebarEnd?: TNode // right in LTR, left in RTL
  sidebarEndWidth?: Value<number>

  // Anchoring behavior for end sidebar and footer
  anchorMode?: Value<AnchorMode>
}

function toPx(v: Value<number>): string {
  return `${v}px`
}

function valueToPx(v: Value<number>) {
  return Value.map(v, toPx)
}

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
    OnDispose(
      verticalScrollPosition.dispose,
      horizontalScrollPosition.dispose,
      scrollbarThickness.dispose
    ),
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
        return Number(contentWidth / BigInt(visibleWidth))
      })
      const scrollRatioVertical = computedOf(
        contentHeight,
        visibleAreaHeight
      )((contentHeight, visibleHeight) => {
        return Number(contentHeight / BigInt(visibleHeight))
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
              contentWidth
            )((startWidth, visibleWidth) => {
              console.log(startWidth, visibleWidth)
              return `${startWidth + Number(visibleWidth)}px`
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
              contentHeight
            )((headerHeight, visibleHeight) => {
              return `${headerHeight + Number(visibleHeight)}px`
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

      return Fragment(
        OnDispose(
          needsHorizontalScroll.on(need => {
            if (!need) horizontalScrollPosition.set(0n)
          }),
          needsVerticalScroll.on(need => {
            if (!need) verticalScrollPosition.set(0n)
          })
        ),
        on.wheel(event => {
          event.preventDefault()
          const { deltaX, deltaY } = event
          const maxVerticalScroll =
            Value.get(contentHeight) - BigInt(visibleAreaHeight.value)
          const newVerticalPosition = biMin(
            maxVerticalScroll,
            biMax(0n, verticalScrollPosition.value + BigInt(deltaY))
          )
          verticalScrollPosition.set(newVerticalPosition)

          const maxHorizontalScroll =
            Value.get(contentWidth) - BigInt(visibleAreaWidth.value)
          const newHorizontalPosition = biMin(
            maxHorizontalScroll,
            biMax(0n, horizontalScrollPosition.value + BigInt(deltaX))
          )
          horizontalScrollPosition.set(newHorizontalPosition)
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
              scrollRatioHorizontal.map(ratio => `${10000 / ratio}%`)
            ),
            style.height('100%'),
            style.backgroundColor('#ff000066')
          )
          // on.scroll(event => {
          //   const target = event.target as HTMLElement
          //   horizontalOffset.set(BigInt(target.scrollLeft))
          // })
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
              )((headerHeight, footerHeight, contentHeight, scrollRatio) => {
                const adjustedContentHeight =
                  contentHeight - BigInt(headerHeight) - BigInt(footerHeight)
                return `${Number((adjustedContentHeight * 100n) / BigInt(Math.max(1, scrollRatio))) / 100}%`
              })
            ),
            style.backgroundColor('#ff000066')
          )
          // on.scroll(event => {
          //   const target = event.target as HTMLElement
          //   verticalOffset.set(BigInt(target.scrollTop))
          // })
        )
      )
    })
  )
}

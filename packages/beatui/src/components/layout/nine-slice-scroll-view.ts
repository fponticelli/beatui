import {
  attr,
  computedOf,
  html,
  on,
  OnDispose,
  prop,
  style,
  TNode,
  Value,
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'
import { biMax, biMin } from '@tempots/std'

export type NineSliceScrollViewOptions = {
  body: TNode
  header?: TNode
  footer?: TNode
  start?: TNode
  end?: TNode
  startHeader?: TNode
  startFooter?: TNode
  endHeader?: TNode
  endFooter?: TNode

  bodyWidth: Value<bigint>
  bodyHeight: Value<bigint>

  headerHeight?: Value<number>
  footerHeight?: Value<number>
  startWidth?: Value<number>
  endWidth?: Value<number>
}

function toPx(v: Value<number>): string {
  return `${v}px`
}

function valueToPx(v: Value<number>) {
  return Value.map(v, toPx)
}

export function NineSliceScrollView({
  body,
  header,
  footer,
  start,
  end,
  startHeader,
  startFooter,
  endHeader,
  endFooter,
  headerHeight = 0,
  footerHeight = 0,
  startWidth = 0,
  endWidth = 0,
  bodyWidth,
  bodyHeight,
}: NineSliceScrollViewOptions) {
  const verticalOffset = prop(0n)
  const horizontalOffset = prop(0n)

  const headerHeightPx = valueToPx(headerHeight)
  const footerHeightPx = valueToPx(footerHeight)
  const startWidthPx = valueToPx(startWidth)
  const endWidthPx = valueToPx(endWidth)
  const scrollbarSize = prop(16)

  return html.div(
    OnDispose(
      verticalOffset.dispose,
      horizontalOffset.dispose,
      scrollbarSize.dispose
    ),
    attr.class('bc-nine-slice-container'),
    ElementRect(rect => {
      const bodyRealWidth = computedOf(
        rect.$.width,
        startWidth,
        endWidth
      )((width, startWidth, endWidth) => {
        return width - startWidth - endWidth
      })
      const bodyRealHeight = computedOf(
        rect.$.height,
        headerHeight,
        footerHeight
      )((height, headerHeight, footerHeight) => {
        return height - headerHeight - footerHeight
      })
      const displayHorizontalScrollbar = computedOf(
        bodyWidth,
        bodyRealWidth
      )((bodyWidth, bodyRealWidth) => {
        return bodyWidth > BigInt(bodyRealWidth)
      })
      const displayVerticalScrollbar = computedOf(
        bodyHeight,
        bodyRealHeight
      )((bodyHeight, bodyRealHeight) => {
        return bodyHeight > BigInt(bodyRealHeight)
      })
      const actualBodyWidth = computedOf(
        bodyRealWidth,
        displayVerticalScrollbar,
        scrollbarSize
      )((w, display, size) => {
        return display ? w - size : w
      })
      const actualBodyHeight = computedOf(
        bodyRealHeight,
        displayHorizontalScrollbar,
        scrollbarSize
      )((h, display, size) => {
        return display ? h - size : h
      })
      const bodyRealWidthPx = valueToPx(actualBodyWidth)
      const bodyRealHeightPx = valueToPx(actualBodyHeight)

      const sliderWidth = computedOf(
        bodyWidth,
        actualBodyWidth
      )((bodyWidth, bodyRealWidth) => {
        return Number(bodyWidth / BigInt(bodyRealWidth))
      })
      const sliderHeight = computedOf(
        bodyHeight,
        actualBodyHeight
      )((bodyHeight, bodyRealHeight) => {
        return Number(bodyHeight / BigInt(bodyRealHeight))
      })

      const endOffset = computedOf(
        displayVerticalScrollbar,
        scrollbarSize
      )((display, size) => {
        return display ? `${size}px` : '0'
      })
      const footerOffset = computedOf(
        displayHorizontalScrollbar,
        scrollbarSize
      )((display, size) => {
        return display ? `${size}px` : '0'
      })

      const moveBoth = style.transform(
        computedOf(
          horizontalOffset,
          verticalOffset,
          displayHorizontalScrollbar,
          displayVerticalScrollbar
        )((h, v, displayH, displayV) => {
          const hTransform = displayH ? `translateX(-${h}px)` : ''
          const vTransform = displayV ? `translateY(-${v}px)` : ''
          return `${hTransform} ${vTransform}`.trim() || 'none'
        })
      )
      const moveHorizontal = style.transform(
        horizontalOffset.map(
          horizontalOffset => `translateX(-${horizontalOffset}px)`
        )
      )
      const moveVertical = style.transform(
        verticalOffset.map(verticalOffset => `translateY(-${verticalOffset}px)`)
      )

      return html.div(
        attr.class('bc-nine-slice-container'),
        on.wheel(event => {
          event.preventDefault()
          const { deltaX, deltaY } = event
          const newVO = biMin(
            Value.get(bodyHeight) - BigInt(actualBodyHeight.value),
            biMax(0n, verticalOffset.value + BigInt(deltaY))
          )
          verticalOffset.set(newVO)

          const newHO = biMin(
            Value.get(bodyWidth) - BigInt(actualBodyWidth.value),
            biMax(0n, horizontalOffset.value + BigInt(deltaX))
          )
          horizontalOffset.set(newHO)
        }),
        // top-left
        startHeader != null
          ? html.div(
              attr.class('bc-nine-slice-pane bc-nine-slice-start-header'),
              style.top('0'),
              style.left('0'),
              style.height(headerHeightPx),
              style.width(startWidthPx),
              startHeader
            )
          : null,
        // top-center
        header != null
          ? html.div(
              attr.class('bc-nine-slice-pane bc-nine-slice-header'),
              style.top('0'),
              style.left(startWidthPx),
              style.height(headerHeightPx),
              style.width(bodyRealWidthPx),
              html.div(
                attr.class('bc-nine-slice-pane-content'),
                moveHorizontal,
                header
              )
            )
          : null,
        // top-right
        endHeader != null
          ? html.div(
              attr.class('bc-nine-slice-pane bc-nine-slice-end-header'),
              style.top('0'),
              style.right(endOffset),
              style.height(headerHeightPx),
              style.width(endWidthPx),
              endHeader
            )
          : null,
        // middle-left
        start != null
          ? html.div(
              attr.class('bc-nine-slice-pane bc-nine-slice-start'),
              style.left('0'),
              style.top(headerHeightPx),
              style.height(bodyRealHeightPx),
              style.width(startWidthPx),
              html.div(
                attr.class('bc-nine-slice-pane-content'),
                moveVertical,
                start
              )
            )
          : null,
        // middle-center
        html.div(
          attr.class('bc-nine-slice-pane bc-nine-slice-body'),
          style.left(startWidthPx),
          style.top(headerHeightPx),
          style.width(actualBodyWidth.map(toPx)),
          style.height(actualBodyHeight.map(toPx)),
          html.div(attr.class('bc-nine-slice-pane-content'), moveBoth, body)
        ),
        // middle-right
        end != null
          ? html.div(
              attr.class('bc-nine-slice-pane bc-nine-slice-end'),
              style.right(endOffset),
              style.top(headerHeightPx),
              style.height(bodyRealHeightPx),
              style.width(endWidthPx),
              html.div(
                attr.class('bc-nine-slice-pane-content'),
                moveVertical,
                end
              )
            )
          : null,
        // bottom-left
        startFooter != null
          ? html.div(
              attr.class('bc-nine-slice-pane bc-nine-slice-start-footer'),
              style.left('0'),
              style.bottom(footerOffset),
              style.height(footerHeightPx),
              style.width(startWidthPx),
              startFooter
            )
          : null,
        // bottom-center
        footer != null
          ? html.div(
              attr.class('bc-nine-slice-pane bc-nine-slice-footer'),
              style.left(startWidthPx),
              style.bottom(footerOffset),
              style.height(footerHeightPx),
              style.width(bodyRealWidthPx),
              html.div(
                attr.class('bc-nine-slice-pane-content'),
                moveHorizontal,
                footer
              )
            )
          : null,
        // bottom-right
        endFooter != null
          ? html.div(
              attr.class('bc-nine-slice-pane bc-nine-slice-end-footer'),
              style.right(endOffset),
              style.bottom(footerOffset),
              style.height(footerHeightPx),
              style.width(endWidthPx),
              endFooter
            )
          : null,
        // horizontal scrollbar
        html.div(
          attr.class('bc-nine-slice-pane bc-nine-slice-horizontal-scrollbar'),
          style.overflowX('scroll'),
          style.left('0'),
          style.right(
            computedOf(
              displayVerticalScrollbar,
              scrollbarSize
            )((display, size) => {
              return display ? `${size}px` : '0'
            })
          ),
          style.bottom('0'),
          style.height(
            displayHorizontalScrollbar.map((v): string => (v ? '16px' : '0'))
          ),
          html.div(
            attr.class(
              'bc-nine-slice-pane bc-nine-slice-horizontal-scrollbar-thumb'
            ),
            style.width(sliderWidth.map(w => `${10000 / w}%`)),
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
              displayHorizontalScrollbar,
              scrollbarSize
            )((display, size) => {
              return display ? `${size}px` : '0'
            })
          ),
          style.right('0'),
          style.width(
            displayVerticalScrollbar.map((v): string => (v ? '16px' : '0'))
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
                bodyHeight,
                sliderHeight
              )((headerHeight, footerHeight, bodyHeight, sliderHeight) => {
                const fullHeight =
                  bodyHeight - BigInt(headerHeight) - BigInt(footerHeight)
                return `${Number((fullHeight * 100n) / BigInt(Math.max(1, sliderHeight))) / 100}%`
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

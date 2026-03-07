import {
  attr,
  html,
  TNode,
  Value,
  OnDispose,
  WithElement,
  prop,
  on,
  computedOf,
} from '@tempots/dom'

/**
 * Configuration options for the {@link ScrollablePanel} component.
 */
export type ScrollablePanelOptions = {
  /**
   * Optional header content rendered above the scrollable body.
   * Remains fixed while the body scrolls.
   */
  header?: TNode
  /**
   * Optional footer content rendered below the scrollable body.
   * Remains fixed while the body scrolls.
   */
  footer?: TNode
  /**
   * The main scrollable content area of the panel.
   */
  body: TNode
  /**
   * Whether to display scroll shadow indicators at the top/bottom edges
   * when the body content overflows. Shadows help indicate scrollable content
   * that is currently out of view.
   * @default true
   */
  shadowOnScroll?: Value<boolean>
}

/**
 * Renders a panel with a scrollable body and optional fixed header/footer.
 * Automatically displays scroll shadow indicators at the top and bottom
 * edges when content overflows, providing a visual cue that more content
 * is available.
 *
 * The shadow state updates reactively based on the scroll position:
 * - No shadow when content fits without scrolling
 * - Bottom shadow when scrolled to top (more content below)
 * - Top shadow when scrolled to bottom (more content above)
 * - Both shadows when scrolled to the middle
 *
 * @param options - Configuration options for the scrollable panel.
 * @param children - Additional content nodes appended after the footer.
 * @returns A scrollable panel element with shadow indicators.
 *
 * @example
 * ```typescript
 * // Panel with header and scrollable body
 * ScrollablePanel({
 *   header: html.h2('File Browser'),
 *   body: html.div(
 *     ...files.map(file => html.div(file.name))
 *   ),
 *   footer: html.div('10 files'),
 * })
 *
 * // Panel without scroll shadows
 * ScrollablePanel({
 *   body: html.div('Content here'),
 *   shadowOnScroll: false,
 * })
 * ```
 */
export function ScrollablePanel(
  { header, footer, body, shadowOnScroll = true }: ScrollablePanelOptions,
  ...children: TNode[]
) {
  const scrollShadow = prop<'both' | 'top' | 'bottom' | 'none'>('none')

  function updateShadow(target: HTMLElement) {
    const isAtTop = target.scrollTop <= 1
    const isAtBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 2
    if (isAtTop && isAtBottom) {
      scrollShadow.set('none')
    } else if (isAtTop) {
      scrollShadow.set('bottom')
    } else if (isAtBottom) {
      scrollShadow.set('top')
    } else {
      scrollShadow.set('both')
    }
  }

  const panelElement = html.div(
    attr.class(
      computedOf(
        scrollShadow,
        shadowOnScroll
      )((shadow, enabled): string => {
        const classes = ['bc-scrollable-panel']
        if (enabled) {
          if (shadow === 'top' || shadow === 'both')
            classes.push('bc-scrollable-panel--scrolled-down')
          if (shadow === 'bottom' || shadow === 'both')
            classes.push('bc-scrollable-panel--scrolled-up')
        }
        return classes.join(' ')
      })
    ),
    header && html.div(attr.class('bc-scrollable-panel__header'), header),
    html.div(attr.class('bc-scrollable-panel--header-shadow'), html.div()),
    html.div(
      attr.class('bc-scrollable-panel__body'),
      WithElement(el => {
        updateShadow(el)
        const ro = new ResizeObserver(() => updateShadow(el))
        ro.observe(el)
        // Also observe children so shadow updates when content size changes
        const mo = new MutationObserver(() => {
          requestAnimationFrame(() => updateShadow(el))
        })
        mo.observe(el, { childList: true, subtree: true })
        return OnDispose(() => {
          ro.disconnect()
          mo.disconnect()
        })
      }),
      on.scroll(event => {
        const target = event.target as HTMLElement
        updateShadow(target)
      }),
      body
    ),
    html.div(attr.class('bc-scrollable-panel--footer-shadow'), html.div()),
    footer && html.div(attr.class('bc-scrollable-panel__footer'), footer),
    ...children
  )

  return panelElement
}

import {
  attr,
  computedOf,
  html,
  on,
  prop,
  TNode,
  Value,
  Fragment,
  aria,
} from '@tempots/dom'
import { ControlSize } from '../theme'
import { sessionId } from '../../utils/session-id'
import { Collapse } from './collapse'

/**
 * Describes a single item in an {@link Accordion}.
 *
 * Each item has a unique key, a header (rendered as the clickable trigger),
 * and body content revealed when the item is expanded.
 */
export interface AccordionItem {
  /** Unique key identifying this item within the accordion */
  key: string
  /** Content rendered in the clickable header area */
  header: TNode
  /** Content revealed when the item is expanded */
  body: TNode
  /** Whether this item is initially open. @default false */
  defaultOpen?: boolean
  /** Whether this item is disabled and cannot be toggled. @default false */
  disabled?: boolean
}

/**
 * Configuration options for the {@link Accordion} component.
 */
export interface AccordionOptions {
  /** The accordion items to render */
  items: AccordionItem[]
  /**
   * Whether multiple items can be open simultaneously.
   * When false, opening an item closes all others.
   * @default false
   */
  multiple?: boolean
  /** Visual size of the accordion. @default 'md' */
  size?: Value<ControlSize>
  /**
   * Visual variant of the accordion.
   * - `'default'` has visible borders between items
   * - `'separated'` renders each item as a standalone card with gaps between
   * @default 'default'
   */
  variant?: Value<'default' | 'separated'>
}

function generateAccordionClasses(
  size: ControlSize,
  variant: 'default' | 'separated'
): string {
  const classes = [
    'bc-accordion',
    `bc-accordion--size-${size}`,
    `bc-accordion--${variant}`,
  ]
  return classes.join(' ')
}

/**
 * An accordion component that renders a list of collapsible sections.
 *
 * Each section has a clickable header that toggles the visibility of its content.
 * Supports single-expand mode (default) where opening one item closes others,
 * and multi-expand mode where any combination of items can be open.
 *
 * Includes full keyboard accessibility with `Enter` and `Space` to toggle,
 * and proper ARIA attributes for `role="region"` and `aria-expanded`.
 *
 * @param options - Configuration for the accordion
 * @returns An accordion element with collapsible sections
 *
 * @example
 * ```ts
 * Accordion({
 *   items: [
 *     { key: '1', header: 'Section 1', body: html.p('Content 1') },
 *     { key: '2', header: 'Section 2', body: html.p('Content 2') },
 *   ],
 * })
 * ```
 *
 * @example
 * ```ts
 * // Multiple items open at once
 * Accordion({
 *   items: [...],
 *   multiple: true,
 *   variant: 'separated',
 *   size: 'lg',
 * })
 * ```
 */
export function Accordion({
  items,
  multiple = false,
  size = 'md',
  variant = 'default',
}: AccordionOptions) {
  const accordionId = sessionId('accordion')

  // Track open state for each item
  const openStates = new Map<string, ReturnType<typeof prop<boolean>>>()
  for (const item of items) {
    openStates.set(item.key, prop(item.defaultOpen ?? false))
  }

  const toggleItem = (key: string) => {
    const state = openStates.get(key)
    if (state == null) return

    if (!multiple) {
      // Close all other items
      for (const [k, s] of openStates) {
        if (k !== key) {
          s.set(false)
        }
      }
    }
    state.update(v => !v)
  }

  return html.div(
    attr.class(
      computedOf(size, variant)((s, v) =>
        generateAccordionClasses(s ?? 'md', v ?? 'default')
      )
    ),
    attr.role('presentation'),
    ...items.map((item, index) => {
      const open = openStates.get(item.key)!
      const headerId = `${accordionId}-header-${index}`
      const panelId = `${accordionId}-panel-${index}`

      return html.div(
        attr.class('bc-accordion__item'),
        attr.class(
          open.map(v =>
            v ? 'bc-accordion__item--open' : 'bc-accordion__item--closed'
          )
        ),
        item.disabled
          ? attr.class('bc-accordion__item--disabled')
          : Fragment(),
        // Header / trigger
        html.button(
          attr.type('button'),
          attr.class('bc-accordion__header'),
          attr.id(headerId),
          aria.expanded(open),
          aria.controls(panelId),
          attr.disabled(item.disabled ?? false),
          on.click(e => {
            e.preventDefault()
            if (!item.disabled) {
              toggleItem(item.key)
            }
          }),
          html.span(attr.class('bc-accordion__header-content'), item.header),
          html.span(
            attr.class('bc-accordion__chevron'),
            attr.class(
              open.map(v =>
                v
                  ? 'bc-accordion__chevron--open'
                  : 'bc-accordion__chevron--closed'
              )
            ),
            // CSS-only chevron via border trick
            html.span(attr.class('bc-accordion__chevron-icon'))
          )
        ),
        // Panel
        html.div(
          attr.id(panelId),
          attr.role('region'),
          aria.labelledby(headerId),
          Collapse(
            { open },
            html.div(attr.class('bc-accordion__body'), item.body)
          )
        )
      )
    })
  )
}

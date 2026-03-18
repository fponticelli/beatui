import {
  TNode,
  Value,
  html,
  attr,
  computedOf,
  prop,
  on,
  When,
  Provide,
  Empty,
} from '@tempots/dom'
import { Collapse } from '../../layout'
import { Icon } from '../../data'
import { FieldLayout, FieldLayoutOptions } from '../input/field-layout'
import type { ControlSize } from '../../theme'
import type { FieldLabelLayout } from '../input/field'

/**
 * Configuration options for the `Fieldset` component.
 */
export interface FieldsetOptions {
  /** Legend content (always visible header for the fieldset) */
  legend?: TNode
  /** Description text displayed below the legend */
  description?: TNode
  /** Visual variant of the fieldset container. @default 'plain' */
  variant?: Value<'bordered' | 'plain' | 'card'>
  /** Whether the fieldset body can be collapsed/expanded. @default false */
  collapsible?: Value<boolean>
  /** Initial collapsed state (only used when collapsible is true). @default false */
  defaultCollapsed?: Value<boolean>
  /** Whether the entire fieldset (and all children) is disabled. @default false */
  disabled?: Value<boolean>
  /** Label position cascaded to descendant Field components. @default 'vertical' */
  layout?: Value<FieldLabelLayout>
  /** Label column width cascaded to descendant Field components. @default '7.5rem' */
  labelWidth?: Value<string>
  /** Control size cascaded to descendant Field components. @default 'md' */
  size?: Value<ControlSize>
  /** Gap between fields in the grid. @default 'md' */
  gap?: Value<ControlSize>
  /** Number of explicit grid columns. When > 1, overrides auto-fit behaviour. @default 1 */
  columns?: Value<number>
  /** Minimum field width before columns auto-collapse. @default '15rem' */
  minFieldWidth?: Value<string>
  /** Reduced spacing mode cascaded to descendant Field components. @default false */
  compact?: Value<boolean>
}

/** Maps ControlSize to CSS spacing variable. */
function gapToSpacing(gap: ControlSize): string {
  const map: Record<ControlSize, string> = {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)',
  }
  return map[gap] ?? map['md']
}

/**
 * Groups related `Field` components with a shared layout context and optional header.
 *
 * Fieldset wraps its children in a `FieldLayout` provider, cascading layout configuration
 * (layout mode, label width, column count, etc.) to all descendant `Field` components.
 * Individual fields can still override provider values locally.
 *
 * Supports three visual variants (`bordered`, `plain`, `card`) and optional
 * animated collapse behaviour.
 *
 * @example
 * ```ts
 * Fieldset(
 *   {
 *     legend: 'Personal Information',
 *     variant: 'bordered',
 *     layout: 'horizontal-fixed',
 *     labelWidth: '160px',
 *     columns: 2,
 *   },
 *   Field({ label: 'First Name', content: TextInput({ ... }) }),
 *   Field({ label: 'Last Name', content: TextInput({ ... }) }),
 * )
 * ```
 */
export function Fieldset(
  {
    legend,
    description,
    variant = 'plain',
    collapsible = false,
    defaultCollapsed = false,
    disabled = false,
    layout,
    labelWidth,
    size,
    gap = 'md',
    columns,
    minFieldWidth,
    compact,
  }: FieldsetOptions,
  ...children: TNode[]
) {
  // Reactive open/close state — initialised from defaultCollapsed
  const isOpen = prop(!Value.get(defaultCollapsed))

  const fieldsetClass = Value.map(variant, v => `bc-fieldset bc-fieldset--${v}`)

  // Build FieldLayout options — only pass defined values so the provider's
  // create function correctly resolves the cascade.
  const layoutOptions: FieldLayoutOptions = {}
  if (layout !== undefined) layoutOptions.layout = layout
  if (labelWidth !== undefined) layoutOptions.labelWidth = labelWidth
  if (size !== undefined) layoutOptions.size = size
  if (gap !== undefined) layoutOptions.gap = gap
  if (columns !== undefined) layoutOptions.columns = columns
  if (minFieldWidth !== undefined) layoutOptions.minFieldWidth = minFieldWidth
  if (compact !== undefined) layoutOptions.compact = compact

  return html.fieldset(
    attr.class(fieldsetClass),
    attr.disabled(disabled),

    // Legend
    legend != null
      ? html.legend(
          attr.class('bc-fieldset__legend'),
          When(
            collapsible,
            () =>
              html.button(
                attr.type('button'),
                attr.class('bc-fieldset__legend-toggle'),
                on.click(() => isOpen.update(v => !v)),
                html.span(attr.class('bc-fieldset__legend-text'), legend),
                Icon(
                  {
                    icon: 'lucide:chevron-down',
                    size: 'sm',
                    color: 'neutral',
                  },
                  attr.class(
                    isOpen.map(
                      o =>
                        `bc-fieldset__collapse-icon${o ? '' : ' bc-fieldset__collapse-icon--collapsed'}`
                    )
                  )
                )
              ),
            () => html.span(attr.class('bc-fieldset__legend-text'), legend)
          )
        )
      : Empty,

    // Description
    description != null
      ? html.div(attr.class('bc-fieldset__description'), description)
      : Empty,

    // Content with FieldLayout provider
    Provide(FieldLayout, layoutOptions, () => {
      const contentNode = html.div(
        attr.class('bc-fieldset__content'),
        attr.style(
          computedOf(
            gap,
            columns ?? undefined,
            minFieldWidth ?? undefined
          )((g, c, mfw) => {
            const gapValue = gapToSpacing(
              Value.get(g as Value<ControlSize>) ?? 'md'
            )
            const parts = [`--fieldset-gap: ${gapValue}`]
            const colVal = Value.get(c as Value<number | undefined>)
            const mfwVal = Value.get(mfw as Value<string | undefined>)
            // Grid column strategy:
            // - columns > 1: fixed column count, equal-width columns
            // - columns unset + minFieldWidth set: auto-fit responsive
            // - neither: single column (CSS default 1fr)
            if (colVal != null && colVal > 1) {
              parts.push(
                `grid-template-columns: repeat(${colVal}, minmax(0, 1fr))`
              )
            } else if (mfwVal != null) {
              parts.push(
                `grid-template-columns: repeat(auto-fit, minmax(${mfwVal}, 1fr))`
              )
            }
            return parts.join('; ')
          })
        ),
        ...children
      )

      // Use When for reactive collapsible — Collapse is always mounted when
      // collapsible is true, hidden otherwise. MUST wrap Collapse in its own div.
      return When(
        collapsible,
        () => html.div(Collapse({ open: isOpen }, contentNode)),
        () => contentNode
      )
    })
  )
}

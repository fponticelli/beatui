import {
  TNode,
  attr,
  Empty,
  html,
  Value,
  computedOf,
  aria,
  dataAttr,
  When,
  Provide,
  Use,
} from '@tempots/dom'
import { Label } from '../../typography/label'
import { sessionId } from '../../../utils/session-id'
import {
  FieldLayout,
  FieldLayoutOptions,
  FieldLayoutValue,
} from './field-layout'

/**
 * A visual indicator (asterisk) appended to labels for required fields.
 *
 * Renders as a red asterisk (" *") with the `bc-field__required` class.
 */
export const RequiredSymbol = html.span(attr.class('bc-field__required'), ' *')

/**
 * Layout modes for the field structure.
 *
 * - `'vertical'` - Label above input (default)
 * - `'horizontal'` - Label and input side-by-side with flexible label width
 * - `'horizontal-fixed'` - Label on the left with fixed width, left-aligned
 * - `'horizontal-end'` - Label on the left with fixed width, right-aligned (flush with input)
 * - `'horizontal-label-right'` - Label on the right side of the input (for checkboxes, switches)
 * - `'responsive'` - Horizontal-fixed above 480px, vertical below (container query)
 */
export type FieldLabelLayout =
  | 'vertical'
  | 'horizontal'
  | 'horizontal-fixed'
  | 'horizontal-end'
  | 'horizontal-label-right'
  | 'responsive'

/**
 * Configuration options for the `Field` component.
 *
 * This type defines all the options for wrapping an input with label, description,
 * error message, and contextual information. It's used by form controls and
 * standalone inputs to provide consistent labeling and error display.
 */
export type FieldOptions = {
  /** Whether the wrapper should take full width of its container */
  fullWidth?: Value<boolean>
  /** Label text or node to display above/beside the input */
  label?: TNode
  /** Additional content to render after the label (e.g., badges, tooltips) */
  labelChildren?: TNode
  /** Contextual information displayed in the header area (e.g., character count) */
  context?: TNode
  /** Helpful description text displayed below the input (or under label in horizontal layouts) */
  description?: TNode
  /** Error message to display when the input has a validation error */
  error?: TNode
  /** Whether the input is required (adds asterisk to label) */
  required?: Value<boolean>
  /** The actual input element or control to wrap */
  content: TNode
  /** ID of the input element for the label's `for` attribute */
  labelFor?: Value<string>
  /** Whether the input has a validation error (applies error styling) */
  hasError?: Value<boolean>
  /** Whether the input is disabled (applies disabled styling to label) */
  disabled?: Value<boolean>
  /** Layout mode for label and input positioning */
  layout?: Value<FieldLabelLayout>
  /** CSS width value for label in horizontal layouts (e.g., '120px', '10rem') */
  labelWidth?: Value<string>
  /** Reduced spacing mode for data-dense interfaces */
  compact?: Value<boolean>
  /** Number of grid columns this field spans in a Fieldset grid */
  span?: Value<number>
}

/**
 * Generates CSS class names for the field based on layout mode and compact mode.
 */
function generateFieldClasses(
  layout: FieldLabelLayout,
  compact: boolean
): string {
  const classes = ['bc-field']

  if (layout !== 'vertical') {
    classes.push(`bc-field--${layout}`)
  }

  if (compact) {
    classes.push('bc-field--compact')
  }

  return classes.join(' ')
}

/**
 * Generates CSS class names for the label text based on error and disabled states.
 */
function generateFieldLabelTextClasses(
  hasError: boolean,
  disabled: boolean
): string {
  const classes = ['bc-field__label-text']

  if (hasError) {
    classes.push('bc-field__label-text--error')
  } else if (disabled) {
    classes.push('bc-field__label-text--disabled')
  } else {
    classes.push('bc-field__label-text--default')
  }

  return classes.join(' ')
}

/**
 * Generates inline CSS styles for the wrapper when using fixed label width or span.
 */
function generateFieldStyles(
  layout: FieldLabelLayout,
  labelWidth?: string,
  span?: number
): string | undefined {
  const parts: string[] = []

  if (
    (layout === 'horizontal-fixed' ||
      layout === 'horizontal-end' ||
      layout === 'responsive') &&
    labelWidth != null
  ) {
    parts.push(`--field-label-width: ${labelWidth}`)
  }

  if (span != null && span > 0) {
    parts.push(`grid-column: span ${span}`)
  }

  return parts.length > 0 ? parts.join('; ') : undefined
}

/**
 * Renders the field body given resolved layout values and local options.
 * This is called inside Use(FieldLayout) so ctx already has cascaded values.
 */
function renderFieldBody(
  ctx: FieldLayoutValue,
  options: FieldOptions,
  children: TNode[]
): TNode {
  const {
    fullWidth = false,
    required,
    label,
    labelChildren,
    context,
    description,
    content,
    error,
    labelFor,
    hasError,
    disabled,
    span,
  } = options

  const computedHasError = hasError ?? error != null
  const computedDisabled = disabled ?? false

  // Resolve layout: local option wins over provider cascade
  const computedLayout = options.layout ?? ctx.layout
  const computedLabelWidth = options.labelWidth ?? ctx.labelWidth
  const computedCompact = options.compact ?? ctx.compact

  // Generate unique IDs for accessibility
  const wrapperId = sessionId('input-wrapper')
  const descriptionId = description ? `${wrapperId}-description` : undefined
  const errorId = error != null ? `${wrapperId}-error` : undefined

  // Check if layout is horizontal (any horizontal variant)
  const isHorizontal = computedOf(computedLayout)(
    l => l !== 'vertical' && l !== 'responsive'
  )

  const computedStyles = computedOf(
    computedLayout,
    computedLabelWidth,
    span ?? undefined
  )((l, w, s) =>
    generateFieldStyles(l, Value.get(w as Value<string | undefined>), s)
  )

  const computedClass = computedOf(
    computedLayout,
    computedCompact
  )((l, compact) => generateFieldClasses(l, compact ?? false))

  return html.div(
    attr.class(computedClass),
    attr.class(
      Value.map(fullWidth, (v): string => (v ? 'bc-field--full-width' : ''))
    ),
    attr.style(computedStyles),
    label != null || context != null
      ? html.div(
          attr.class('bc-field__header'),
          html.div(
            attr.class('bc-field__label-section'),
            html.label(
              attr.class('bc-field__label'),
              labelFor != null ? attr.for(labelFor) : Empty,
              html.span(
                attr.class(
                  computedOf(
                    computedHasError,
                    computedDisabled
                  )((hasError, disabled) =>
                    generateFieldLabelTextClasses(
                      hasError ?? false,
                      disabled ?? false
                    )
                  )
                ),
                label
              ),
              label != null && required ? RequiredSymbol : Empty
            ),
            // Show description under label when horizontal
            When(
              computedOf(
                isHorizontal,
                description
              )((h, desc) => h && desc != null),
              () =>
                html.div(
                  attr.class(
                    'bc-field__description bc-field__description--under-label'
                  ),
                  attr.id(descriptionId!),
                  description!
                )
            )
          ),
          context != null ? Label(context) : Empty,
          labelChildren
        )
      : Empty,
    html.div(
      attr.class('bc-field__content'),
      // Add data attributes to help inputs inherit accessibility information
      [descriptionId, errorId].filter(Boolean).length > 0
        ? dataAttr(
            'describedby',
            [descriptionId, errorId].filter(Boolean).join(' ')
          )
        : Empty,
      required ? dataAttr('required', 'true') : Empty,
      When(computedHasError, () => dataAttr('invalid', 'true')),
      content
    ),
    // Show description at bottom only when not horizontal
    When(
      computedOf(isHorizontal, description)((h, desc) => !h && desc != null),
      () =>
        html.div(
          attr.class('bc-field__description'),
          attr.id(descriptionId!),
          description!
        )
    ),
    When(computedHasError, () =>
      html.div(
        attr.class('bc-field__error'),
        attr.id(errorId!),
        aria.live('polite'), // Announce errors to screen readers
        attr.role('alert'), // Mark as alert for immediate attention
        error
      )
    ),
    ...children
  )
}

/**
 * Wraps an input element with label, description, error message, and accessibility attributes.
 *
 * This is the primary wrapper component used by all form controls in BeatUI. It provides:
 * - Label with optional required indicator (asterisk)
 * - Contextual information (e.g., character count)
 * - Description text for additional guidance
 * - Error message display with ARIA live region announcements
 * - Proper accessibility attributes (aria-describedby, aria-invalid, role="alert")
 * - Multiple layout modes (vertical, horizontal, horizontal-label-right, horizontal-fixed, responsive)
 * - Automatic ID generation for linking label, description, and error to the input
 * - FieldLayout provider integration: inherits layout settings from a parent Fieldset
 *
 * The component handles state styling (error, disabled) and ensures screen readers
 * receive appropriate context through ARIA attributes.
 *
 * @param options - Configuration options for the wrapper
 * @param options.content - The input element or control to wrap (required)
 * @param options.label - Label text or node
 * @param options.description - Help text displayed below the input
 * @param options.error - Error message (automatically sets hasError to true)
 * @param options.required - Whether to show the required asterisk
 * @param options.labelFor - ID of the input element
 * @param options.hasError - Whether to apply error styling
 * @param options.disabled - Whether to apply disabled styling
 * @param options.layout - Layout mode (default: inherited from FieldLayout or 'vertical')
 * @param options.labelWidth - Fixed width for label in 'horizontal-fixed' layout
 * @param options.compact - Reduced spacing mode
 * @param options.span - Number of grid columns this field spans in a Fieldset grid
 * @param options.context - Contextual info in the header (e.g., character count)
 * @param options.labelChildren - Additional content after the label
 * @param options.fullWidth - Whether to take full container width
 * @param children - Additional nodes to append to the wrapper
 * @returns A div element with the complete field structure
 *
 * @example
 * ```ts
 * Field({
 *   label: 'Email',
 *   description: 'We will never share your email',
 *   required: true,
 *   labelFor: 'email-input',
 *   content: html.input(attr.type('email'), attr.id('email-input')),
 *   error: prop<string | undefined>(undefined),
 *   layout: 'vertical'
 * })
 * ```
 */
export const Field = (options: FieldOptions, ...children: TNode[]) => {
  // Build the FieldLayout options from any local field-level overrides.
  // We only pass defined local values so that FieldLayout's create function
  // can correctly cascade: local override > parent Fieldset > defaults.
  const layoutOptions: FieldLayoutOptions = {}
  if (options.layout !== undefined) layoutOptions.layout = options.layout
  if (options.labelWidth !== undefined)
    layoutOptions.labelWidth = options.labelWidth
  if (options.compact !== undefined) layoutOptions.compact = options.compact

  return Provide(FieldLayout, layoutOptions, () =>
    Use(FieldLayout, ctx => renderFieldBody(ctx, options, children))
  )
}

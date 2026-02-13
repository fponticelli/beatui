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
} from '@tempots/dom'
import { Label } from '../../typography/label'
import { sessionId } from '../../../utils/session-id'

/**
 * A visual indicator (asterisk) appended to labels for required fields.
 *
 * Renders as a red asterisk (" *") with the `bc-input-wrapper__required` class.
 */
export const RequiredSymbol = html.span(
  attr.class('bc-input-wrapper__required'),
  ' *'
)

/**
 * Layout modes for the input wrapper structure.
 *
 * - `'vertical'` - Label above input (default)
 * - `'horizontal'` - Label and input side-by-side with flexible label width
 * - `'horizontal-label-right'` - Label on the right side of the input
 * - `'horizontal-fixed'` - Label on the left with fixed width (use `labelWidth` option)
 */
export type InputWrapperLayout =
  | 'vertical'
  | 'horizontal'
  | 'horizontal-label-right'
  | 'horizontal-fixed'

/**
 * Configuration options for the `InputWrapper` component.
 *
 * This type defines all the options for wrapping an input with label, description,
 * error message, and contextual information. It's used by form controls and
 * standalone inputs to provide consistent labeling and error display.
 */
export type InputWrapperOptions = {
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
  layout?: Value<InputWrapperLayout>
  /** CSS width value for label in 'horizontal-fixed' layout (e.g., '120px', '10rem') */
  labelWidth?: Value<string>
}

/**
 * Generates CSS class names for the input wrapper based on layout mode.
 *
 * @param layout - The layout mode for label/input positioning
 * @returns Space-separated string of CSS class names
 */
function generateInputWrapperClasses(layout: InputWrapperLayout): string {
  const classes = ['bc-input-wrapper']

  if (layout !== 'vertical') {
    classes.push(`bc-input-wrapper--${layout}`)
  }

  return classes.join(' ')
}

/**
 * Generates CSS class names for the label text based on error and disabled states.
 *
 * @param hasError - Whether the input has a validation error
 * @param disabled - Whether the input is disabled
 * @returns Space-separated string of CSS class names
 */
function generateInputWrapperLabelTextClasses(
  hasError: boolean,
  disabled: boolean
): string {
  const classes = ['bc-input-wrapper__label-text']

  if (hasError) {
    classes.push('bc-input-wrapper__label-text--error')
  } else if (disabled) {
    classes.push('bc-input-wrapper__label-text--disabled')
  } else {
    classes.push('bc-input-wrapper__label-text--default')
  }

  return classes.join(' ')
}

/**
 * Generates inline CSS styles for the wrapper when using fixed label width.
 *
 * @param layout - The layout mode
 * @param labelWidth - CSS width value for the label
 * @returns CSS variable string or undefined
 */
function generateInputWrapperStyles(
  layout: InputWrapperLayout,
  labelWidth?: string
): string | undefined {
  if (layout === 'horizontal-fixed' && labelWidth != null) {
    return `--input-wrapper-label-width: ${labelWidth}`
  }
  return undefined
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
 * - Multiple layout modes (vertical, horizontal, horizontal-label-right, horizontal-fixed)
 * - Automatic ID generation for linking label, description, and error to the input
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
 * @param options.layout - Layout mode (default: 'vertical')
 * @param options.labelWidth - Fixed width for label in 'horizontal-fixed' layout
 * @param options.context - Contextual info in the header (e.g., character count)
 * @param options.labelChildren - Additional content after the label
 * @param options.fullWidth - Whether to take full container width
 * @param children - Additional nodes to append to the wrapper
 * @returns A div element with the complete input wrapper structure
 *
 * @example
 * ```ts
 * InputWrapper({
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
export const InputWrapper = (
  {
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
    layout,
    labelWidth,
  }: InputWrapperOptions,
  ...children: TNode[]
) => {
  const computedHasError = hasError ?? error != null
  const computedDisabled = disabled ?? false
  const computedLayout = layout ?? 'vertical'

  // Generate unique IDs for accessibility
  const wrapperId = sessionId('input-wrapper')
  const descriptionId = description ? `${wrapperId}-description` : undefined
  const errorId = error != null ? `${wrapperId}-error` : undefined

  // Check if layout is horizontal (any horizontal variant)
  const isHorizontal = computedOf(computedLayout)(l => l !== 'vertical')

  const styles = computedOf(
    computedLayout,
    labelWidth ?? undefined
  )((l, w) => generateInputWrapperStyles(l, w))

  return html.div(
    attr.class(Value.map(computedLayout, l => generateInputWrapperClasses(l))),
    attr.class(
      Value.map(fullWidth, (v): string =>
        v ? 'bc-input-wrapper--full-width' : ''
      )
    ),
    attr.style(styles),
    label != null || context != null
      ? html.div(
          attr.class('bc-input-wrapper__header'),
          html.div(
            attr.class('bc-input-wrapper__label-section'),
            html.label(
              attr.class('bc-input-wrapper__label'),
              labelFor != null ? attr.for(labelFor) : Empty,
              html.span(
                attr.class(
                  computedOf(
                    computedHasError,
                    computedDisabled
                  )((hasError, disabled) =>
                    generateInputWrapperLabelTextClasses(
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
                    'bc-input-wrapper__description bc-input-wrapper__description--under-label'
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
      attr.class('bc-input-wrapper__content'),
      // Add data attributes to help inputs inherit accessibility information
      [descriptionId, errorId].filter(Boolean).length > 0
        ? dataAttr.describedby(
            [descriptionId, errorId].filter(Boolean).join(' ')
          )
        : Empty,
      required ? dataAttr.required('true') : Empty,
      When(computedHasError, () => dataAttr.invalid('true')),
      content
    ),
    // Show description at bottom only when not horizontal
    When(
      computedOf(isHorizontal, description)((h, desc) => !h && desc != null),
      () =>
        html.div(
          attr.class('bc-input-wrapper__description'),
          attr.id(descriptionId!),
          description!
        )
    ),
    When(computedHasError, () =>
      html.div(
        attr.class('bc-input-wrapper__error'),
        attr.id(errorId!),
        aria.live('polite'), // Announce errors to screen readers
        attr.role('alert'), // Mark as alert for immediate attention
        error
      )
    ),
    ...children
  )
}

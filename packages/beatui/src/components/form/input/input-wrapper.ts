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

export const RequiredSymbol = html.span(
  attr.class('bc-input-wrapper__required'),
  ' *'
)

export type InputWrapperLayout =
  | 'vertical'
  | 'horizontal'
  | 'horizontal-label-right'
  | 'horizontal-fixed'

export type InputWrapperOptions = {
  fullWidth?: Value<boolean>
  label?: TNode
  labelChildren?: TNode
  context?: TNode
  description?: TNode
  error?: TNode
  required?: Value<boolean>
  content: TNode
  labelFor?: Value<string>
  hasError?: Value<boolean>
  disabled?: Value<boolean>
  layout?: Value<InputWrapperLayout>
  labelWidth?: Value<string> // CSS width value for horizontal-fixed layout
}

function generateInputWrapperClasses(layout: InputWrapperLayout): string {
  const classes = ['bc-input-wrapper']

  if (layout !== 'vertical') {
    classes.push(`bc-input-wrapper--${layout}`)
  }

  return classes.join(' ')
}

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

function generateInputWrapperStyles(
  layout: InputWrapperLayout,
  labelWidth?: string
): string | undefined {
  if (layout === 'horizontal-fixed' && labelWidth != null) {
    return `--input-wrapper-label-width: ${labelWidth}`
  }
  return undefined
}

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
  const computedHasError = hasError ?? false
  console.log('computedHasError', hasError, computedHasError)
  const computedDisabled = disabled ?? false
  const computedLayout = layout ?? 'vertical'

  // Generate unique IDs for accessibility
  const wrapperId = sessionId('input-wrapper')
  const descriptionId = description ? `${wrapperId}-description` : undefined
  const errorId = error != null ? `${wrapperId}-error` : undefined

  // Check if layout is horizontal (any horizontal variant)
  const isHorizontal = computedOf(computedLayout)(l => l !== 'vertical')

  return html.div(
    attr.class(Value.map(computedLayout, l => generateInputWrapperClasses(l))),
    attr.class(
      Value.map(fullWidth, (v): string =>
        v ? 'bc-input-wrapper--full-width' : ''
      )
    ),
    When(
      computedOf(
        computedLayout,
        labelWidth ?? undefined
      )((l, w) => generateInputWrapperStyles(l, w) != null),
      () =>
        attr.style(
          Value.map(
            computedOf(
              computedLayout,
              labelWidth ?? undefined
            )((l, w) => generateInputWrapperStyles(l, w)!),
            s => s
          )
        )
    ),
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

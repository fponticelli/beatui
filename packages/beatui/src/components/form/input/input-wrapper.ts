import {
  TNode,
  attr,
  Empty,
  html,
  Value,
  computedOf,
  Ensure,
  aria,
  dataAttr,
  When,
} from '@tempots/dom'
import { Label } from '../../typography/label'

export const RequiredSymbol = html.span(
  attr.class('bc-input-wrapper__required'),
  ' *'
)

export type InputWrapperOptions = {
  label?: TNode
  context?: TNode
  description?: TNode
  error?: Value<TNode | null>
  required?: Value<boolean>
  content: TNode
  labelFor?: Value<string>
  hasError?: Value<boolean>
  disabled?: Value<boolean>
}

function generateInputWrapperClasses(): string {
  return 'bc-input-wrapper'
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

export const InputWrapper = (
  {
    required,
    label,
    context,
    description,
    content,
    error,
    labelFor,
    hasError,
    disabled,
  }: InputWrapperOptions,
  ...children: TNode[]
) => {
  const computedHasError = hasError ?? Value.map(error ?? null, e => e != null)
  const computedDisabled = disabled ?? false

  // Generate unique IDs for accessibility
  const wrapperId = `input-wrapper-${Math.random().toString(36).substring(2, 11)}`
  const descriptionId = description ? `${wrapperId}-description` : undefined
  const errorId = error ? `${wrapperId}-error` : undefined

  return html.div(
    attr.class(generateInputWrapperClasses()),
    label != null || context != null
      ? html.div(
          attr.class('bc-input-wrapper__header'),
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
          context != null ? Label(context) : Empty
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
    description != null
      ? html.div(
          attr.class('bc-input-wrapper__description'),
          attr.id(descriptionId!),
          description
        )
      : Empty,
    error != null
      ? Ensure(error as Value<TNode | null | undefined>, errorValue =>
          html.div(
            attr.class('bc-input-wrapper__error'),
            attr.id(errorId!),
            aria.live('polite'), // Announce errors to screen readers
            attr.role('alert'), // Mark as alert for immediate attention
            errorValue as TNode
          )
        )
      : Empty,
    ...children
  )
}

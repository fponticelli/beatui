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
import { sessionId } from '../../../utils/session-id'

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
  horizontal?: Value<boolean>
}

function generateInputWrapperClasses(horizontal: boolean): string {
  const classes = ['bc-input-wrapper']

  if (horizontal) {
    classes.push('bc-input-wrapper--horizontal')
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
    horizontal,
  }: InputWrapperOptions,
  ...children: TNode[]
) => {
  const computedHasError = hasError ?? Value.map(error ?? null, e => e != null)
  const computedDisabled = disabled ?? false
  const computedHorizontal = horizontal ?? false

  // Generate unique IDs for accessibility
  const wrapperId = sessionId('input-wrapper')
  const descriptionId = description ? `${wrapperId}-description` : undefined
  const errorId = error ? `${wrapperId}-error` : undefined

  return html.div(
    attr.class(
      Value.map(computedHorizontal, h => generateInputWrapperClasses(h))
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
                computedHorizontal,
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
    // Show description at bottom only when not horizontal
    When(
      computedOf(
        computedHorizontal,
        description
      )((h, desc) => !h && desc != null),
      () =>
        html.div(
          attr.class('bc-input-wrapper__description'),
          attr.id(descriptionId!),
          description!
        )
    ),
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

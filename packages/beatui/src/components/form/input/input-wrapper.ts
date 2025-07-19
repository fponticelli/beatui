import {
  TNode,
  attr,
  Empty,
  html,
  Value,
  computedOf,
  Ensure,
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
    html.div(attr.class('bc-input-wrapper__content'), content),
    description != null
      ? html.div(attr.class('bc-input-wrapper__description'), description)
      : Empty,
    error != null
      ? Ensure(error as Value<TNode | null | undefined>, errorValue =>
          html.div(attr.class('bc-input-wrapper__error'), errorValue as TNode)
        )
      : Empty,
    ...children
  )
}

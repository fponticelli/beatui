import { TNode, attr, Empty, html, computedOf, Ensure } from '@tempots/dom'
import { Merge } from '@tempots/std'
import { ControlWrapperOptions } from './control-options'
import { Label } from '../../typography/label'

export const RequiredSymbol = html.span(
  attr.class('bc-control-input-wrapper__required'),
  ' *'
)

export type ControlInputWrapperOptions<S> = Merge<
  ControlWrapperOptions<S>,
  {
    content: TNode
  }
>

function generateControlInputWrapperClasses(): string {
  return 'bc-control-input-wrapper'
}

function generateControlInputWrapperLabelTextClasses(
  hasError: boolean,
  disabled: boolean
): string {
  const classes = ['bc-control-input-wrapper__label-text']

  if (hasError) {
    classes.push('bc-control-input-wrapper__label-text--error')
  } else if (disabled) {
    classes.push('bc-control-input-wrapper__label-text--disabled')
  } else {
    classes.push('bc-control-input-wrapper__label-text--default')
  }

  return classes.join(' ')
}

export const ControlInputWrapper = <S>({
  required,
  label,
  context,
  description,
  content,
  controller,
}: ControlInputWrapperOptions<S>) => {
  return html.div(
    attr.class(generateControlInputWrapperClasses()),
    label != null || context != null
      ? html.div(
          attr.class('bc-control-input-wrapper__header'),
          html.label(
            attr.class('bc-control-input-wrapper__label'),
            attr.for(controller.name),
            html.span(
              attr.class(
                computedOf(
                  controller.hasError,
                  controller.disabled
                )((hasError, disabled) =>
                  generateControlInputWrapperLabelTextClasses(
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
    html.div(attr.class('bc-control-input-wrapper__content'), content),
    description != null
      ? html.div(
          attr.class('bc-control-input-wrapper__description'),
          description
        )
      : Empty,
    Ensure(controller.error, error =>
      html.div(attr.class('bc-control-input-wrapper__error'), error)
    )
  )
}

import { TNode, attr, Empty, html, computedOf, Ensure, Use } from '@tempots/dom'
import { Merge } from '@tempots/std'
import { ControlWrapperOptions } from './control-options'
import { Theme } from '../../theme'
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

export const ControlInputWrapper = <S>({
  required,
  label,
  context,
  description,
  content,
  controller,
}: ControlInputWrapperOptions<S>) => {
  return Use(Theme, theme => {
    return html.div(
      attr.class(
        computedOf(
          theme,
          controller.hasError,
          controller.disabled
        )(({ theme }, hasError, disabled) =>
          theme.controlInputWrapper({
            hasError,
            disabled,
          })
        )
      ),
      label != null || context != null
        ? html.div(
            attr.class('bc-control-input-wrapper__header'),
            html.label(
              attr.class('bc-control-input-wrapper__label'),
              attr.for(controller.name),
              html.span(
                attr.class(
                  computedOf(
                    theme,
                    controller.hasError,
                    controller.disabled
                  )(({ theme }, hasError, disabled) =>
                    theme.controlInputWrapperLabelText({
                      hasError,
                      disabled,
                    })
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
  })
}

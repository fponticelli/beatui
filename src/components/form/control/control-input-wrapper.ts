import { TNode, attr, Empty, html, computedOf, Ensure } from '@tempots/dom'
import { Group } from '../../layout/group'
import { Stack } from '../../layout/stack'
import { Label } from '../../typography/label'
import { Merge } from '@tempots/std'
import { ControlWrapperOptions } from './control-options'

export const RequiredSymbol = html.span(
  attr.class('text-xs text-red-600 align-top'),
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
  return Stack(
    attr.class('gap-1 w-full'),
    label != null || context != null
      ? Group(
          attr.class('items-center justify-between gap-2'),
          html.label(
            attr.class('flex items-center gap-0.5'),
            attr.for(controller.name),
            html.span(
              attr.class(
                computedOf(
                  controller.hasError,
                  controller.disabled
                )((hasError, disabled): string => {
                  if (hasError) {
                    return 'text-sm text-red-600 dark:text-red-300'
                  }
                  if (disabled) {
                    return 'text-sm text-gray-500 dark:text-gray-600'
                  }
                  return 'text-sm text-gray-600 dark:text-gray-300 font-semibold'
                })
              ),
              label
            ),
            label != null && required ? RequiredSymbol : Empty
          ),
          context != null ? Label(context) : Empty
        )
      : Empty,
    html.div(content),
    description != null ? html.div(description) : Empty,
    Ensure(controller.error, error =>
      html.div(attr.class('text-red-500'), error)
    )
  )
}

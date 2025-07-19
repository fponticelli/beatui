import { TNode, attr, html, Value } from '@tempots/dom'
import { Merge } from '@tempots/std'
import { ControlWrapperOptions } from './control-options'
import { InputWrapper } from '../input/input-wrapper'

export type ControlInputWrapperOptions<S> = Merge<
  ControlWrapperOptions<S>,
  {
    content: TNode
  }
>

function generateControlInputWrapperClasses(): string {
  return 'bc-control-input-wrapper'
}

export const ControlInputWrapper = <S>(
  {
    required,
    label,
    context,
    description,
    content,
    controller,
  }: ControlInputWrapperOptions<S>,
  ...children: TNode[]
) => {
  return html.div(
    attr.class(generateControlInputWrapperClasses()),
    InputWrapper(
      {
        required,
        label,
        context,
        description,
        content,
        error: controller.error.map(e => e ?? null) as Value<TNode | null>,
        labelFor: controller.name,
        hasError: controller.hasError,
        disabled: controller.disabled,
      },
      ...children
    )
  )
}

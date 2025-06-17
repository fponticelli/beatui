import { ControlInputWrapper } from './control-input-wrapper'
import { TextInput } from '../input/text-input'
import { ControlOptions } from './control-options'
import { ValueController } from '../controller/value-controller'
import { inputOptionsFromController } from '../input/input-options'
import { TNode } from '@tempots/dom'

export const makeOnBlurHandler =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (controller: ValueController<any>, onBlur?: () => void) => () => {
    // controller.touch()
    onBlur?.()
  }

export const makeOnChangeHandler =
  <T>(controller: ValueController<T>, onChange?: (value: T) => void) =>
  (value: T) => {
    controller.change(value)
    onChange?.(value)
  }

export const makeMappedOnChangeHandler =
  <T, U>(
    controller: ValueController<T>,
    map: (value: U) => T,
    onChange?: (value: T) => void
  ) =>
  (value: U) => {
    const v = map(value)
    controller.change(v)
    onChange?.(v)
  }

export const makeNullableOnChangeHandler =
  <T>(
    controller: ValueController<T | null>,
    isEmpty: (value: T) => boolean,
    onChange?: (value: T | null) => void
  ) =>
  (value: T) => {
    if (isEmpty(value)) {
      controller.change(null)
      onChange?.(null)
    } else {
      controller.change(value)
      onChange?.(value)
    }
  }

export const TextControl = (
  options: ControlOptions<string>,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: TextInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}

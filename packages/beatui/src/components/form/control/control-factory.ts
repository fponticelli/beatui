import { TNode } from '@tempots/dom'
import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import {
  inputOptionsFromController,
  inputOptionsFromMappedController,
} from '../input/input-options'
import {
  makeOnBlurHandler,
  makeOnChangeHandler,
  makeMappedOnChangeHandler,
} from './text-control'
import { InputOptions } from '../input/input-options'

type InputComponent<T> = (options: InputOptions<T>) => TNode

export function createControl<T>(inputComponent: InputComponent<T>) {
  return (options: ControlOptions<T>, ...children: TNode[]) => {
    const { onBlur, onChange, ...rest } = options

    return ControlInputWrapper(
      {
        ...rest,
        content: inputComponent({
          ...rest,
          ...inputOptionsFromController(rest.controller),
          onChange: makeOnChangeHandler(rest.controller, onChange),
          onBlur: makeOnBlurHandler(rest.controller, onBlur),
        }),
      },
      ...children
    )
  }
}

export function createMappedControl<T, U>(
  inputComponent: InputComponent<T>,
  toInput: (value: U) => T,
  fromInput: (value: T) => U
) {
  return (options: ControlOptions<U>, ...children: TNode[]) => {
    const { onBlur, onChange, ...rest } = options

    return ControlInputWrapper(
      {
        ...rest,
        content: inputComponent({
          ...rest,
          ...inputOptionsFromMappedController(rest.controller, toInput),
          onChange: makeMappedOnChangeHandler(
            rest.controller,
            fromInput,
            onChange
          ),
          onBlur: makeOnBlurHandler(rest.controller, onBlur),
        }),
      },
      ...children
    )
  }
}

export function createNullableControl<T>(
  inputComponent: InputComponent<T | null>
) {
  return (options: ControlOptions<T | null>, ...children: TNode[]) => {
    const { onBlur, onChange, ...rest } = options

    return ControlInputWrapper(
      {
        ...rest,
        content: inputComponent({
          ...rest,
          ...inputOptionsFromController(rest.controller),
          onChange: makeOnChangeHandler(rest.controller, onChange),
          onBlur: makeOnBlurHandler(rest.controller, onBlur),
        }),
      },
      ...children
    )
  }
}

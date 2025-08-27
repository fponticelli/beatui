import { Merge, TNode } from '@tempots/dom'
import { InputOptions } from '../input/input-options'
import { Controller } from '../controller'
import { InputWrapper, InputWrapperOptions } from '../input'

export const makeOnBlurHandler =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (_controller: Controller<any>, onBlur?: () => void) => () => {
    // _controller.touch() // TODO: Implement touch functionality
    onBlur?.()
  }

export const makeOnChangeHandler =
  <T>(controller: Controller<T>, onChange?: (value: T) => void) =>
  (value: T) => {
    controller.change(value)
    onChange?.(value)
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseControlOptions = InputOptions<any>
export type ControlOptions = Merge<BaseControlOptions, InputWrapperOptions>

export type BaseControllerOptions<T, O extends BaseControlOptions> = Merge<
  Omit<O, 'value'>,
  { controller: Controller<T> }
>

export type ControllerOptions<T, O extends BaseControlOptions> = Merge<
  Omit<InputWrapperOptions, 'content'>,
  Merge<Omit<O, 'value'>, { controller: Controller<T> }>
>

export function BaseControl<T, O extends BaseControlOptions>(
  InputComponent: (options: O) => TNode,
  options: BaseControllerOptions<T, O>
) {
  const { controller, onBlur, onChange, ...rest } = options
  return InputComponent({
    id: controller.name,
    disabled: controller.disabled,
    value: controller.value,
    hasError: controller.hasError,
    ...rest,
    onChange: makeOnChangeHandler(controller, onChange),
    onBlur: makeOnBlurHandler(controller, onBlur),
  } as unknown as O)
}

export function Control<T, O extends BaseControlOptions>(
  InputComponent: (options: O) => TNode,
  options: ControllerOptions<T, O>,
  ...children: TNode[]
) {
  return InputWrapper(
    {
      ...options,
      content: BaseControl(
        InputComponent,
        options as BaseControllerOptions<T, O>
      ),
    },
    ...children
  )
}

export function BaseMappedControl<T, U, O extends BaseControlOptions>(
  InputComponent: (options: O) => TNode,
  options: Merge<
    BaseControllerOptions<T, O>,
    {
      toInput: (value: T) => U
      fromInput: (value: U) => T
    }
  >
) {
  const { toInput, fromInput, controller, ...rest } = options
  const mappedController = controller.transform(toInput, fromInput)
  return BaseControl(InputComponent, {
    ...(rest as unknown as BaseControllerOptions<U, O>),
    controller: mappedController,
  })
}

export function MappedControl<T, U, O extends BaseControlOptions>(
  InputComponent: (options: O) => TNode,
  options: Merge<
    BaseControllerOptions<T, O>,
    {
      toInput: (value: T) => U
      fromInput: (value: U) => T
    }
  >,
  ...children: TNode[]
) {
  return InputWrapper(
    {
      ...options,
      content: BaseMappedControl(InputComponent, options),
    },
    ...children
  )
}

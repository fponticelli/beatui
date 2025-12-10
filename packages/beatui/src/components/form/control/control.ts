import { Merge, TNode, Value } from '@tempots/dom'
import { InputOptions } from '../input/input-options'
import { Controller } from '../controller'
import { InputWrapper, InputWrapperOptions } from '../input'
import { sessionId } from '../../../utils'

export const makeOnBlurHandler =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (_controller: Controller<any>, onBlur?: () => void) => () => {
    _controller.markTouched()
    onBlur?.()
  }

export const makeOnChangeHandler =
  <T>(controller: Controller<T>, onChange?: (value: T) => void) =>
  (value: T) => {
    controller.change(value)
    onChange?.(value)
  }

export type BaseControlOptions =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  InputOptions<any>

export type ControlOptions = Merge<BaseControlOptions, InputWrapperOptions>

export type BaseControllerOptions<T, O extends BaseControlOptions> = Merge<
  Omit<O, 'value'>,
  { controller: Controller<T>; triggerOn?: 'input' | 'change' }
>

export type ControllerOptions<T, O extends BaseControlOptions> = Merge<
  Omit<InputWrapperOptions, 'content'>,
  Merge<
    Omit<O, 'value'>,
    { controller: Controller<T>; triggerOn?: 'input' | 'change' }
  >
>

export type MappedControllerOptions<T, U, O extends BaseControlOptions> = Merge<
  ControllerOptions<T, O>,
  {
    toInput: (value: T) => U
    fromInput: (value: U) => T
  }
>

export function BaseControl<T, O extends BaseControlOptions>(
  InputComponent: (options: O) => TNode,
  options: BaseControllerOptions<T, O>
) {
  const { controller, onBlur, onChange, id, triggerOn, ...rest } = options
  return InputComponent({
    id: id ?? controller.name,
    disabled: controller.disabled,
    value: controller.signal,
    hasError: controller.errorVisible,
    name: controller.name,
    ...rest,
    onInput:
      triggerOn === 'input'
        ? makeOnChangeHandler(controller, onChange)
        : undefined,
    onChange:
      triggerOn !== 'input'
        ? makeOnChangeHandler(controller, onChange)
        : undefined,
    onBlur: makeOnBlurHandler(controller, onBlur),
  } as unknown as O)
}

export function Control<T, O extends BaseControlOptions>(
  InputComponent: (options: O) => TNode,
  { id: idArg, labelFor: labelForArg, ...options }: ControllerOptions<T, O>,
  ...children: TNode[]
) {
  const id: Value<string> =
    idArg ?? options.controller.name ?? sessionId('control')
  const labelFor: Value<string> = labelForArg ?? id
  return InputWrapper(
    {
      ...options,
      labelFor,
      content: BaseControl(
        opts => InputComponent({ ...(opts as unknown as O), id }),
        options as BaseControllerOptions<T, O>
      ),
    },
    ...children
  )
}

export function BaseMappedControl<T, U, O extends BaseControlOptions>(
  InputComponent: (options: O) => TNode,
  options: MappedControllerOptions<T, U, O>
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
  {
    id: idArg,
    labelFor: labelForArg,
    ...options
  }: MappedControllerOptions<T, U, O>,
  ...children: TNode[]
) {
  const id: Value<string> =
    idArg ?? options.controller.name ?? sessionId('control')
  const labelFor: Value<string> = labelForArg ?? id

  return InputWrapper(
    {
      ...options,
      labelFor,
      content: BaseMappedControl(InputComponent, {
        ...options,
        id,
      } as MappedControllerOptions<T, U, O>),
    },
    ...children
  )
}

import { Merge, Primitive, TextNode, TNode, Value } from '@tempots/dom'
import { InputOptions } from '../input/input-options'
import { Controller } from '../controller'
import { InputWrapper, InputWrapperOptions } from '../input'
import { sessionId } from '../../../utils'

/**
 * Creates a blur event handler that marks the controller as touched.
 *
 * @param _controller - The controller to mark as touched
 * @param onBlur - Optional additional blur handler to invoke
 * @returns A blur event handler function
 */
export const makeOnBlurHandler =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (_controller: Controller<any>, onBlur?: () => void) => () => {
    _controller.markTouched()
    onBlur?.()
  }

/**
 * Creates a change event handler that updates the controller value.
 *
 * @template T - The value type
 * @param controller - The controller to update
 * @param onChange - Optional additional change handler to invoke
 * @returns A change event handler function
 */
export const makeOnChangeHandler =
  <T>(controller: Controller<T>, onChange?: (value: T) => void) =>
  (value: T) => {
    controller.change(value)
    onChange?.(value)
  }

/**
 * Base options type for any input component, derived from InputOptions.
 */
export type BaseControlOptions =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  InputOptions<any>

/**
 * Options for a control that includes both input and wrapper options.
 */
export type ControlOptions = Merge<BaseControlOptions, InputWrapperOptions>

/**
 * Options for connecting a controller to an input component without a wrapper.
 *
 * @template T - The controller value type
 * @template O - The input component options type
 */
export type BaseControllerOptions<T, O extends BaseControlOptions> = Merge<
  Omit<O, 'value'>,
  { controller: Controller<T>; triggerOn?: 'input' | 'change' }
>

/**
 * Options for connecting a controller to an input component with a wrapper.
 *
 * @template T - The controller value type
 * @template O - The input component options type
 */
export type ControllerOptions<T, O extends BaseControlOptions> = Merge<
  Omit<InputWrapperOptions, 'content'>,
  Merge<
    Omit<O, 'value'>,
    { controller: Controller<T>; triggerOn?: 'input' | 'change' }
  >
>

/**
 * Options for connecting a controller to an input with bidirectional value transformation.
 *
 * @template T - The controller value type
 * @template U - The input component value type
 * @template O - The input component options type
 */
export type MappedControllerOptions<T, U, O extends BaseControlOptions> = Merge<
  ControllerOptions<T, O>,
  {
    /** Transforms controller value to input value. */
    toInput: (value: T) => U
    /** Transforms input value back to controller value. */
    fromInput: (value: U) => T
  }
>

/**
 * Connects an input component to a controller without a wrapper (no label, error display, etc.).
 * Automatically binds the controller's value, disabled state, error state, and event handlers.
 *
 * @template T - The controller value type
 * @template O - The input component options type
 * @param InputComponent - The input component factory function
 * @param options - Controller connection options including the controller and optional event handlers
 * @returns A TNode representing the connected input
 *
 * @example
 * ```typescript
 * import { BaseControl, useController } from '@tempots/beatui'
 * import { TextInput } from '@tempots/beatui'
 * import { prop } from '@tempots/dom'
 *
 * const { controller } = useController({
 *   initialValue: 'Hello',
 * })
 *
 * const input = BaseControl(TextInput, {
 *   controller,
 *   placeholder: 'Enter text...',
 * })
 * ```
 */
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

/**
 * Connects an input component to a controller with a wrapper that provides label, error display, and layout.
 * Automatically binds the controller's value, disabled state, error state, and event handlers.
 *
 * @template T - The controller value type
 * @template O - The input component options type
 * @param InputComponent - The input component factory function
 * @param options - Controller connection options including wrapper options (label, error display, etc.)
 * @param children - Optional child nodes to render alongside the input
 * @returns A TNode representing the wrapped input with label and error display
 *
 * @example
 * ```typescript
 * import { Control, useForm } from '@tempots/beatui'
 * import { TextInput } from '@tempots/beatui'
 * import { html } from '@tempots/dom'
 *
 * const { controller } = useForm({
 *   initialValue: { email: '' },
 * })
 *
 * const emailControl = Control(TextInput, {
 *   controller: controller.field('email'),
 *   label: 'Email Address',
 *   placeholder: 'you@example.com',
 *   triggerOn: 'input',
 * })
 * ```
 */
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
      hasError: options.controller.errorVisible,
      // TODO: Remove Primitive annotation once @tempots/dom TextNode is generic
      error: TextNode(options.controller.error.map((v): Primitive => v ?? '')),
      labelFor,
      content: BaseControl(
        opts => InputComponent({ ...(opts as unknown as O), id }),
        options as BaseControllerOptions<T, O>
      ),
    },
    ...children
  )
}

/**
 * Connects an input component to a controller with bidirectional value transformation, without a wrapper.
 * Useful when the controller value type differs from the input component's expected value type.
 *
 * @template T - The controller value type
 * @template U - The input component value type
 * @template O - The input component options type
 * @param InputComponent - The input component factory function
 * @param options - Controller connection options including transform functions
 * @returns A TNode representing the connected input with value transformation
 *
 * @example
 * ```typescript
 * import { BaseMappedControl, useController } from '@tempots/beatui'
 * import { TextInput } from '@tempots/beatui'
 *
 * const { controller } = useController({
 *   initialValue: 42, // number
 * })
 *
 * const input = BaseMappedControl(TextInput, {
 *   controller,
 *   toInput: (n) => n.toString(),
 *   fromInput: (s) => parseFloat(s) || 0,
 *   placeholder: 'Enter a number...',
 * })
 * ```
 */
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

/**
 * Connects an input component to a controller with bidirectional value transformation and a wrapper.
 * Combines value transformation with label, error display, and layout features.
 *
 * @template T - The controller value type
 * @template U - The input component value type
 * @template O - The input component options type
 * @param InputComponent - The input component factory function
 * @param options - Controller connection options including transform functions and wrapper options
 * @param children - Optional child nodes to render alongside the input
 * @returns A TNode representing the wrapped input with value transformation
 *
 * @example
 * ```typescript
 * import { MappedControl, useForm } from '@tempots/beatui'
 * import { TextInput } from '@tempots/beatui'
 *
 * const { controller } = useForm({
 *   initialValue: { age: 25 },
 * })
 *
 * const ageControl = MappedControl(TextInput, {
 *   controller: controller.field('age'),
 *   toInput: (n) => n.toString(),
 *   fromInput: (s) => parseInt(s, 10) || 0,
 *   label: 'Age',
 *   placeholder: 'Enter your age',
 * })
 * ```
 */
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

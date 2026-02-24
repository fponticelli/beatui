import {
  attr,
  Empty,
  Ensure,
  ForEach,
  html,
  computedOf,
  on,
  OnDispose,
  WithElement,
  OneOfType,
  Renderable,
  Signal,
  Value,
  Use,
  coalesce,
  Fragment,
} from '@tempots/dom'
import { InputContainer, InputIcon } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { emitOptionExpando, Expando } from '../../misc/expando'
import { BeatUII18n } from '../../../beatui-i18n'
import {
  BaseControllerOptions,
  ControllerOptions,
  makeOnBlurHandler,
  makeOnChangeHandler,
} from '../control'
import { InputWrapper } from './input-wrapper'
import { SelectOption } from './option'

/**
 * Options for the {@link NativeSelect} component.
 * Extends standard `InputOptions` with native `<select>` element configuration.
 *
 * @typeParam T - The type of option values.
 */
export type NativeSelectOptions<T> = InputOptions<T> & {
  /** The list of selectable options. Supports value, group, and break types. */
  options: Value<SelectOption<T>[]>
  /** Label for the initial unselected/placeholder option. Defaults to the i18n "Select one" message. */
  unselectedLabel?: Value<string>
  /**
   * Custom equality function for comparing option values.
   * @default (a, b) => a === b
   */
  equality?: (a: T, b: T) => boolean
}

const NativeSelectOption = <T>(
  option: Signal<SelectOption<T>>,
  equality: (a: T, b: T) => boolean,
  currentValue: Value<T>
): Renderable => {
  return Ensure(option as Signal<SelectOption<T> | undefined>, option =>
    OneOfType(option, {
      value: v => {
        const isSelected = computedOf(
          v,
          currentValue
        )((v, currentValue) => {
          return equality(v.value, currentValue as T)
        })
        return html.option(
          attr.selected(isSelected),
          Expando('value', v.$.value),
          v.$.label
        )
      },
      group: v =>
        html.optgroup(
          attr.label(v.$.group),
          ForEach(v.$.options, o =>
            NativeSelectOption(
              o as Signal<SelectOption<T>>,
              equality,
              currentValue
            )
          )
        ),
      break: () => html.hr(),
    })
  )
}

/**
 * A native HTML `<select>` dropdown input component.
 *
 * Renders a styled native select element with support for grouped options,
 * custom equality, and an initial unselected placeholder. The select opens
 * the browser's native picker on click. Values are tracked via DOM expandos
 * to support non-string option types.
 *
 * @typeParam T - The type of option values.
 * @param options - Configuration options for the native select.
 * @returns A renderable native select component.
 *
 * @example
 * ```ts
 * NativeSelect({
 *   value: prop('us'),
 *   options: [
 *     { type: 'value', value: 'us', label: 'United States' },
 *     { type: 'value', value: 'uk', label: 'United Kingdom' },
 *   ],
 *   onChange: country => console.log('Selected:', country),
 * })
 * ```
 */
export const NativeSelect = <T>(options: NativeSelectOptions<T>) => {
  const {
    value,
    onBlur,
    onChange,
    onInput,
    options: selectOptions,
    unselectedLabel,
    equality = (a, b) => a === b,
    after,
  } = options

  let element: HTMLSelectElement | undefined

  return InputContainer(
    {
      ...options,
      after: Fragment(
        InputIcon({
          icon: 'ph:caret-down-bold',
          color: 'neutral',
          size: 'sm',
        }),
        after
      ),
      input: html.select(
        WithElement(el => {
          element = el as HTMLSelectElement
          const observer = new MutationObserver(e => {
            const { removedNodes } = e[0]!
            if (removedNodes.length > 0) {
              element!.selectedIndex = 0
            }
          })
          observer.observe(el, { childList: true })
          return OnDispose(() => observer.disconnect())
        }),
        CommonInputAttributes(options),
        attr.class('bc-native-select bc-input'),
        Use(BeatUII18n, t =>
          html.option(
            attr.hidden('hidden'),
            coalesce(unselectedLabel, t.$.selectOne)
          )
        ),
        ForEach(selectOptions, v => NativeSelectOption(v, equality, value)),
        onBlur != null ? on.blur(onBlur) : Empty,
        onChange != null
          ? on.change(emitOptionExpando<T>('value', v => onChange(v)))
          : Empty,
        onInput != null
          ? on.input(emitOptionExpando<T>('value', v => onInput(v)))
          : Empty
      ),
    },
    on.click(() => {
      element?.focus()
      if (typeof element?.showPicker === 'function') {
        try {
          element.showPicker()
        } catch {
          // Ignore errors from showPicker - can throw NotSupportedError
          // if element is not rendered or has been removed from DOM
        }
      }
    })
  )
}

/**
 * A base form control wrapper for {@link NativeSelect} using a raw controller.
 *
 * @typeParam T - The type of option values.
 * @param options - Base controller options for the native select control.
 * @returns A renderable form control component.
 */
export function BaseNativeSelectControl<T>(
  options: BaseControllerOptions<T, NativeSelectOptions<T>>
) {
  const { controller, onChange, onBlur, ...rest } = options
  return NativeSelect({
    ...rest,
    value: controller.signal,
    onChange: makeOnChangeHandler(controller, onChange),
    onBlur: makeOnBlurHandler(controller, onBlur),
  })
}

/**
 * A full form control wrapper for {@link NativeSelect} with label, error, and description support.
 *
 * @typeParam T - The type of option values.
 * @param options - Controller options for the native select control.
 * @returns A renderable form control component with wrapper.
 */
export function NativeSelectControl<T>(
  options: ControllerOptions<T, NativeSelectOptions<T>>
) {
  return InputWrapper({
    ...options,
    content: BaseNativeSelectControl(options),
  })
}

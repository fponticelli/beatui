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
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { emitOptionExpando, Expando } from '../../misc/expando'
import { BeatUII18n } from '@/beatui-i18n'
import {
  BaseControllerOptions,
  ControllerOptions,
  makeOnBlurHandler,
  makeOnChangeHandler,
} from '../control'
import { InputWrapper } from './input-wrapper'
import { Icon } from '@/components/data'
import { SelectOption } from './option'

export type NativeSelectOptions<T> = InputOptions<T> & {
  options: Value<SelectOption<T>[]>
  unselectedLabel?: Value<string>
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
          OnDispose(isSelected.dispose),
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

export const NativeSelect = <T>(options: NativeSelectOptions<T>) => {
  const {
    value,
    onBlur,
    onChange,
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
        Icon({
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
          : Empty
      ),
    },
    on.click(() => {
      element?.focus()
      if (typeof element?.showPicker === 'function') {
        element.showPicker()
      }
    })
  )
}

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

export function NativeSelectControl<T>(
  options: ControllerOptions<T, NativeSelectOptions<T>>
) {
  return InputWrapper({
    ...options,
    content: BaseNativeSelectControl(options),
  })
}

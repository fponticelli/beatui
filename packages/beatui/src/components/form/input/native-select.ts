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
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { emitOptionExpando, Expando } from '../../misc/expando'
import { BeatUII18n } from '@/beatui-i18n'

export type ValueOption<T> = {
  type: 'value'
  value: T
  label: string
  disabled?: boolean
}
export type GroupOption<T> = {
  type: 'group'
  group: string
  options: ValueOption<T>[]
  disabled?: boolean
}
export type BreakOption = { type: 'break' }
export type SelectOption<T> = ValueOption<T> | GroupOption<T> | BreakOption

export const SelectOption = {
  value: <T>(value: T, label: string, disabled?: boolean) =>
    ({
      type: 'value',
      value,
      label,
      disabled,
    }) as ValueOption<T>,
  group: <T>(
    group: string,
    options: (ValueOption<T> | BreakOption)[],
    disabled?: boolean
  ) =>
    ({
      type: 'group',
      group,
      options,
      disabled,
    }) as GroupOption<T>,

  break: { type: 'break' } as BreakOption,

  getOptionValues: <T>(options: SelectOption<T>[]): T[] => {
    return options.flatMap(o =>
      o.type === 'group'
        ? SelectOption.getOptionValues(o.options as SelectOption<T>[])
        : o.type === 'break'
          ? []
          : [o.value]
    )
  },
  contains: <T>(
    options: SelectOption<T>[],
    value: T,
    equality: (a: T, b: T) => boolean = (a, b) => a === b
  ) => {
    return SelectOption.getOptionValues(options).some(v => equality(v, value))
  },
}

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
  // TODO why is option sometimes undefined?
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
  } = options

  let element: HTMLSelectElement | undefined

  return InputContainer({
    ...options,
    child: on.click(() => {
      element?.focus()
      if (typeof element?.showPicker === 'function') {
        element.showPicker()
      }
    }),
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
      attr.class('bc-native-select bc-input bu-w-full'),
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
  })
}

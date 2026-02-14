import { html, attr, Prop, prop, TNode } from '@tempots/dom'
import {
  DropdownInput,
  InputWrapper,
  Switch,
  SegmentedInput,
  Option,
  DropdownOption,
} from '@tempots/beatui'

export function ControlSelect<T extends string>(
  label: string,
  value: Prop<T>,
  options: T[]
): TNode {
  const dropdownOptions = prop<DropdownOption<T>[]>(
    options.map(o => Option.value(o, o))
  )
  return InputWrapper({
    label,
    content: DropdownInput<T>({
      value,
      options: dropdownOptions,
      onChange: value.set,
      size: 'sm',
    }),
  })
}

export function ControlSegmented<T extends string>(
  label: string,
  value: Prop<T>,
  options: Record<T, string>
): TNode {
  return InputWrapper({
    label,
    content: SegmentedInput({
      size: 'sm',
      options,
      value,
      onChange: value.set,
    }),
  })
}

export function ControlSwitch(label: string, value: Prop<boolean>): TNode {
  return InputWrapper({
    label,
    content: Switch({
      value,
      onChange: value.set,
    }),
  })
}

export function ControlNumber(
  label: string,
  value: Prop<number>,
  opts: { min?: number; max?: number; step?: number } = {}
): TNode {
  return InputWrapper({
    label,
    content: html.input(
      attr.type('number'),
      attr.class('bc-input bc-input--sm'),
      attr.value(value.map(String)),
      attr.min(String(opts.min ?? 0)),
      attr.max(String(opts.max ?? 100)),
      attr.step(String(opts.step ?? 1))
      // Using standard DOM event since we don't have a NumberInput for quick inline
    ),
  })
}

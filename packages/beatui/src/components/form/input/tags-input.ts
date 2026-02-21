import {
  attr,
  emitValue,
  Empty,
  ForEach,
  Fragment,
  input,
  prop,
  on,
  Value,
} from '@tempots/dom'
import { InputContainer, InputIcon } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Tag } from '../../data/tag'

/**
 * A free-form tags input component that allows users to add and remove string tags.
 *
 * Users type a tag into a text field and press Enter/change to add it. Tags are
 * displayed as removable chips. Duplicate tags are prevented.
 *
 * @param options - Standard input options for a `string[]` value.
 * @returns A renderable tags input component.
 *
 * @example
 * ```ts
 * TagsInput({
 *   value: prop<string[]>(['react', 'typescript']),
 *   onChange: tags => console.log('Tags:', tags),
 *   placeholder: 'Add a tag...',
 * })
 * ```
 */
export const TagsInput = (options: InputOptions<string[]>) => {
  const { value, onChange, onBlur, before } = options
  const currentValue = prop('')

  const removeOne = (v: string) => {
    onChange?.(Value.get(value).filter(c => c !== v))
  }

  const addOne = () => {
    const v = currentValue.value.trim()
    const values = Value.get(value)
    if (v === '' || values.includes(v)) return
    currentValue.set('')
    onChange?.([...values, v])
  }

  return InputContainer({
    ...options,
    before:
      before ??
      InputIcon({
        icon: 'tabler:tag',
        size: options.size,
        color: 'neutral',
      }),
    input: Fragment(
      attr.class('bc-input-container__tags'),
      ForEach(value, v =>
        Tag({
          value: v,
          onClose: () => removeOne(v.value),
          disabled: options.disabled,
        })
      ),
      input.text(
        CommonInputAttributes(options),
        attr.value(currentValue),
        attr.class('bc-input bc-input-container__tags-input'),
        on.input(emitValue(v => currentValue.set(v))),
        onChange != null ? on.change(addOne) : Empty,
        onBlur != null ? on.blur(onBlur) : Empty
      )
    ),
  })
}

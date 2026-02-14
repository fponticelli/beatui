import {
  TNode,
  Value,
  attr,
  html,
  on,
  prop,
  computedOf,
  ForEach,
  When,
  Empty,
} from '@tempots/dom'
import { ControlSize } from '../../theme/types'

export interface TagInputOptions {
  /** Current list of tag values */
  values: Value<string[]>
  /** Callback when tags change */
  onChange?: (values: string[]) => void
  /** Placeholder text when no tags and input is empty */
  placeholder?: Value<string>
  /** Control size */
  size?: Value<ControlSize>
  /** Whether the input is disabled */
  disabled?: Value<boolean>
  /** Maximum number of tags allowed */
  maxTags?: Value<number>
  /** Whether the input has an error */
  hasError?: Value<boolean>
}

function generateTagInputClasses(
  size: ControlSize,
  disabled: boolean,
  hasError: boolean
): string {
  const classes = ['bc-tag-input', `bc-tag-input--${size}`]
  if (disabled) classes.push('bc-tag-input--disabled')
  if (hasError) classes.push('bc-tag-input--error')
  return classes.join(' ')
}

export function TagInput(options: TagInputOptions): TNode {
  const {
    values,
    onChange,
    placeholder = 'Add...',
    size = 'md',
    disabled = false,
    maxTags,
    hasError = false,
  } = options

  const inputValue = prop('')

  const removeTag = (tag: string) => {
    const current = Value.get(values)
    const next = current.filter(t => t !== tag)
    onChange?.(next)
  }

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    const current = Value.get(values)
    const max = Value.get(maxTags ?? Infinity)
    if (current.includes(trimmed)) return
    if (current.length >= max) return
    onChange?.([...current, trimmed])
    inputValue.set('')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue.value)
    } else if (e.key === 'Backspace' && inputValue.value === '') {
      const current = Value.get(values)
      if (current.length > 0) {
        removeTag(current[current.length - 1])
      }
    }
  }

  return html.div(
    attr.class(
      computedOf(
        size,
        disabled,
        hasError
      )((s, d, e) => generateTagInputClasses(s ?? 'md', d ?? false, e ?? false))
    ),
    ForEach(values, tag =>
      html.span(
        attr.class('bc-tag-input__tag'),
        html.span(attr.class('bc-tag-input__tag-text'), tag),
        When(
          computedOf(disabled)(d => !(d ?? false)),
          () =>
            html.button(
              attr.type('button'),
              attr.class('bc-tag-input__tag-remove'),
              on.click((e: MouseEvent) => {
                e.stopPropagation()
                removeTag(tag.value)
              }),
              '\u00d7'
            ),
          () => Empty
        )
      )
    ),
    html.input(
      attr.class('bc-tag-input__input'),
      attr.type('text'),
      attr.placeholder(
        computedOf(
          values,
          placeholder
        )((v, p) => (v.length === 0 ? (p ?? 'Add...') : ''))
      ),
      attr.disabled(disabled),
      attr.value(inputValue),
      on.input((e: Event) => {
        const target = e.target as HTMLInputElement
        inputValue.set(target.value)
      }),
      on.keydown(handleKeyDown),
      on.blur(() => {
        if (inputValue.value.trim()) {
          addTag(inputValue.value)
        }
      })
    )
  )
}

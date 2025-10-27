import {
  attr,
  html,
  OnDispose,
  WithElement,
  TNode,
  Value,
  computedOf,
} from '@tempots/dom'
import { ControlSize } from '../../theme'

function generateInputContainerClasses(
  baseContainer: boolean,
  disabled: boolean,
  hasError: boolean,
  size: ControlSize
): string {
  const classes = [
    baseContainer ? 'bc-base-input-container' : 'bc-input-container',
  ]

  if (disabled) {
    classes.push(
      baseContainer
        ? 'bc-base-input-container--disabled'
        : 'bc-input-container--disabled'
    )
  } else {
    classes.push(
      baseContainer
        ? 'bc-base-input-container--default'
        : 'bc-input-container--default'
    )
  }

  if (hasError) {
    classes.push('bc-input-container--error')
  }

  // Apply shared control sizing (only for regular containers)
  if (!baseContainer) {
    classes.push(`bc-control--padding-${size}`)
    classes.push(`bc-control--text-size-${size}`)
  }

  return classes.join(' ')
}

export const InputContainer = (
  {
    baseContainer,
    disabled,
    input,
    before,
    after,
    hasError,
    focusableSelector = 'input, select, textarea',
    growInput = true,
    size,
  }: {
    disabled?: Value<boolean>
    input: TNode
    before?: TNode
    after?: TNode
    hasError?: Value<boolean>
    focusableSelector?: string
    growInput?: Value<boolean>
    baseContainer?: Value<boolean>
    size?: Value<ControlSize>
  },
  ...children: TNode[]
) => {
  const isDisabled = Value.map(disabled ?? false, d => d)

  return html.div(
    OnDispose(() => Value.dispose(isDisabled)),
    WithElement(el => {
      const handler = () => {
        const focusable = el.querySelector(focusableSelector) as
          | HTMLElement
          | undefined
        focusable?.focus()
      }
      el.addEventListener('click', handler)
      return OnDispose(() => el.removeEventListener('click', handler))
    }),
    attr.class(
      computedOf(
        baseContainer,
        isDisabled,
        hasError ?? false,
        size ?? 'md'
      )((baseContainer, disabled, hasError, size) =>
        generateInputContainerClasses(
          baseContainer ?? false,
          disabled ?? false,
          hasError ?? false,
          (size ?? 'md') as ControlSize
        )
      )
    ),
    before != null
      ? html.span(attr.class('bc-input-container__before'), before)
      : null,
    html.div(
      attr.class('bc-input-container__input'),
      attr.class(
        Value.map(growInput, (v): string =>
          v ? 'bc-input-container__input--grow' : ''
        )
      ),
      input
    ),
    after != null
      ? html.span(attr.class('bc-input-container__after'), after)
      : null,
    ...children
  )
}

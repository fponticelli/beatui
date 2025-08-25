import {
  attr,
  html,
  OnDispose,
  WithElement,
  TNode,
  Value,
  computedOf,
} from '@tempots/dom'

function generateInputContainerClasses(
  baseContainer: boolean,
  disabled: boolean,
  hasError: boolean
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
  }: {
    disabled?: Value<boolean>
    input: TNode
    before?: TNode
    after?: TNode
    hasError?: Value<boolean>
    focusableSelector?: string
    growInput?: Value<boolean>
    baseContainer?: Value<boolean>
  },
  ...children: TNode[]
) => {
  const isDisabled = Value.map(disabled ?? false, d => d)

  return html.div(
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
        hasError ?? false
      )((baseContainer, disabled, hasError) =>
        generateInputContainerClasses(
          baseContainer ?? false,
          disabled ?? false,
          hasError ?? false
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

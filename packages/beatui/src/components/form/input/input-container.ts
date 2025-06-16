import {
  attr,
  html,
  OnDispose,
  WithElement,
  TNode,
  Value,
  computedOf,
} from '@tempots/dom'

export const InputContainer = ({
  child,
  disabled,
  input,
  before,
  after,
  hasError,
  focusableSelector = 'input, select, textarea',
  growInput = true,
}: {
  child?: TNode
  disabled?: Value<boolean>
  input: TNode
  before?: TNode
  after?: TNode
  hasError?: Value<boolean>
  focusableSelector?: string
  growInput?: Value<boolean>
}) => {
  const isDisabled = Value.map(disabled ?? false, d => d)

  function generateInputContainerClasses(
    disabled: boolean,
    hasError: boolean
  ): string {
    const classes = ['bc-input-container']

    if (disabled) {
      classes.push('bc-input-container--disabled')
    } else {
      classes.push('bc-input-container--default')
    }

    if (hasError) {
      classes.push('bc-input-container--error')
    }

    return classes.join(' ')
  }

  return html.div(
    child,
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
        isDisabled,
        hasError ?? false
      )((disabled, hasError) =>
        generateInputContainerClasses(disabled ?? false, hasError ?? false)
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
      : null
  )
}

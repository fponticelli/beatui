import {
  attr,
  html,
  OnDispose,
  WithElement,
  TNode,
  Value,
  When,
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
    attr.class('flex flex-row items-center gap-2'),
    attr.class(
      Value.map(isDisabled, (d): string =>
        d
          ? 'bg-gray-200 text-gray-500 shadow-sm w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus-within:z-10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-sky-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500'
          : 'shadow-sm bg-white w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus-within:z-10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-sky-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500'
      )
    ),
    When(hasError ?? false, () =>
      attr.class('ring-red-500 dark:ring-red-500 focus-within:ring-red-600 ')
    ),
    before != null
      ? html.span(attr.class('flex flex-row items-center'), before)
      : null,
    html.div(
      attr.class('flex flex-row items-center'),
      attr.class(Value.map(growInput, (v): string => (v ? 'flex-grow' : ''))),
      input
    ),
    after != null
      ? html.span(attr.class('flex flex-row items-center'), after)
      : null
  )
}

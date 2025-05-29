import { attr, Empty, html, on, Value } from '@tempots/dom'

export const Tag = ({
  disabled,
  value,
  onClose,
}: {
  value: Value<string>
  disabled?: Value<boolean>
  onClose?: (value: string) => void
}) => {
  return html.span(
    attr.class(
      'flex flex-row items-center pl-3 pr-1.5 py-0 rounded-full inline-block text-sm dark:text-gray-100 '
    ),
    attr.class(
      Value.map(disabled ?? false, (d): string =>
        d
          ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-500'
          : 'bg-gray-200 border border-gray-300 dark:bg-gray-700 dark:border-gray-600'
      )
    ),
    html.span(attr.class('pr-1.5'), value),
    onClose != null
      ? html.button(
          attr.disabled(disabled),
          html.span('×'),
          attr.class('text-gray-400 hover:text-gray-700'),
          on.click(() => onClose?.(Value.get(value)))
        )
      : Empty
  )
}

import { html, aria, attr, prop, TNode, Value, When } from '@tempots/dom'
import { Button, Icon } from '@tempots/beatui'

/**
 * A collapsible code preview panel with a "Show Code" / "Hide Code" toggle
 * and a copy-to-clipboard button.
 */
export function CodePreview(code: Value<string>): TNode {
  const visible = prop(false)
  const copied = prop(false)

  const handleCopy = () => {
    const text = Value.get(code)
    navigator.clipboard.writeText(text).then(() => {
      copied.set(true)
      setTimeout(() => copied.set(false), 2000)
    })
  }

  return html.div(
    attr.class('mt-2'),
    html.div(
      attr.class('flex justify-end'),
      Button(
        {
          variant: 'text',
          size: 'xs',
          onClick: () => visible.set(!visible.value),
        },
        Icon({ icon: 'lucide:code-2', size: 'xs' }),
        visible.map((v): string => (v ? 'Hide Code' : 'Show Code'))
      )
    ),
    When(
      visible,
      () =>
        html.div(
          attr.class('relative group mt-1'),
          html.div(
            attr.class(
              'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
            ),
            Button(
              {
                variant: 'default',
                size: 'xs',
                onClick: handleCopy,
              },
              aria.label('Copy code'),
              When(
                copied,
                () => Icon({ icon: 'lucide:check', size: 'xs' }),
                () => Icon({ icon: 'lucide:copy', size: 'xs' })
              )
            )
          ),
          html.pre(
            attr.class(
              'p-3 rounded-lg bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm font-mono overflow-x-auto leading-relaxed'
            ),
            html.code(code)
          )
        )
    )
  )
}

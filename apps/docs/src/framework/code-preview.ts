import { html, aria, attr, prop, TNode, Value, When } from '@tempots/dom'
import { Button, Icon } from '@tempots/beatui'
import { CodeHighlight } from '@tempots/beatui/codehighlight'

/**
 * A collapsible code preview panel with a "Show Code" / "Hide Code" toggle
 * and a copy-to-clipboard button. Uses Shiki syntax highlighting.
 */
export function CodePreview(
  code: Value<string>,
  language: Value<string> = 'typescript'
): TNode {
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
          attr.class(
            'relative group mt-1 rounded-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden'
          ),
          html.div(
            attr.class(
              'absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity'
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
          CodeHighlight({ code, language })
        )
    )
  )
}

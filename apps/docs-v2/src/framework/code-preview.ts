import { html, attr, prop, TNode, Value, When } from '@tempots/dom'
import { Button, Icon } from '@tempots/beatui'

/**
 * A collapsible code preview panel with a "Show Code" / "Hide Code" toggle.
 */
export function CodePreview(code: Value<string>): TNode {
  const visible = prop(false)

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
        html.pre(
          attr.class(
            'mt-1 p-3 rounded-lg bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm font-mono overflow-x-auto leading-relaxed'
          ),
          html.code(code)
        )
    )
  )
}

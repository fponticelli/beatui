import { html, attr, prop, TNode, When, WithElement } from '@tempots/dom'
import { Button, Icon } from '@tempots/beatui'

/**
 * A styled code block with a copy-to-clipboard button.
 */
export function CodeBlock(code: string, language?: string): TNode {
  const copied = prop(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      copied.set(true)
      setTimeout(() => copied.set(false), 2000)
    })
  }

  return html.div(
    attr.class('relative group'),
    html.div(
      attr.class('absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'),
      Button(
        {
          variant: 'default',
          size: 'xs',
          onClick: handleCopy,
        },
        When(
          copied,
          () => Icon({ icon: 'lucide:check', size: 'xs' }),
          () => Icon({ icon: 'lucide:copy', size: 'xs' })
        )
      )
    ),
    html.pre(
      attr.class(
        'p-4 rounded-lg bg-gray-900 dark:bg-gray-950 text-gray-100 text-sm font-mono overflow-x-auto leading-relaxed'
      ),
      html.code(
        language ? attr.class(`language-${language}`) : undefined,
        code
      )
    )
  )
}

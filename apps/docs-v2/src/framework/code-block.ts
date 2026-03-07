import { html, attr, prop, TNode, When } from '@tempots/dom'
import { Button, Icon } from '@tempots/beatui'
import { CodeHighlight } from '@tempots/beatui/codehighlight'

/**
 * A styled code block with syntax highlighting and a copy-to-clipboard button.
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
    attr.class(
      'relative group rounded-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden'
    ),
    html.div(
      attr.class(
        'absolute top-2 right-8 z-10 text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none pointer-events-none'
      ),
      language ?? 'typescript'
    ),
    html.div(
      attr.class(
        'absolute top-2 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity'
      ),
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
    CodeHighlight({ code, language: language ?? 'typescript' })
  )
}

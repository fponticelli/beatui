import { html, attr } from '@tempots/dom'
import { Anchor } from '@tempots/ui'

export function Footer() {
  return html.footer(
    attr.class(
      'flex items-center justify-between px-6 py-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700'
    ),
    html.span('BeatUI - Built on the Tempo ecosystem'),
    html.div(
      attr.class('flex gap-4'),
      Anchor(
        { href: 'https://github.com/fponticelli/beatui' },
        attr.class(
          'hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
        ),
        attr.target('_blank'),
        'GitHub'
      ),
      Anchor(
        { href: '/api' },
        attr.class(
          'hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
        ),
        'API Reference'
      )
    )
  )
}

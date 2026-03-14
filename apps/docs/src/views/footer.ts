import { html, attr } from '@tempots/dom'
import { Anchor } from '@tempots/ui'

export function Footer() {
  const year = new Date().getFullYear()
  return html.div(
    html.div(
      attr.class(
        'h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent'
      )
    ),
    html.footer(
      attr.class(
        'flex items-center justify-between px-6 py-3 text-xs text-gray-500 dark:text-gray-400'
      ),
      html.span(`© ${year} BeatUI - Built on the Tempo ecosystem`),
      html.div(
        attr.class('flex gap-4'),
        Anchor(
          { href: '/guides/getting-started' },
          attr.class(
            'hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
          ),
          'Docs'
        ),
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
        ),
        Anchor(
          { href: '/llms.txt' },
          attr.class(
            'hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
          ),
          attr.target('_blank'),
          'llms.txt'
        ),
        Anchor(
          { href: '/llms-full.txt' },
          attr.class(
            'hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
          ),
          attr.target('_blank'),
          'llms-full.txt'
        )
      )
    )
  )
}

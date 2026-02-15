import { html, attr } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import { Stack, Card, OpenGraph } from '@tempots/beatui'
import { MODULES } from '../../api/api-data'

/** API reference landing page — grid of cards, one per entry point */
export function ApiLanding() {
  return html.div(
    attr.class('p-6'),
    OpenGraph({
      title: 'API Reference - BeatUI',
      description: 'Complete API reference for the BeatUI component library.',
      type: 'website',
      url: 'https://beatui.dev/api',
      siteName: 'BeatUI',
    }),
    Stack(
      attr.class('max-w-320 mx-auto'),
      html.h1(attr.class('text-3xl font-bold mb-2'), 'API Reference'),
      html.p(
        attr.class('text-lg text-gray-500 dark:text-gray-400 mb-6'),
        'Browse the full API documentation for all BeatUI modules.'
      ),
      html.div(
        attr.class('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'),
        ...MODULES.map(mod =>
          Anchor(
            { href: `/api/${mod.slug}`, viewTransition: true },
            Card(
              {},
              attr.class(
                'p-5 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors'
              ),
              Stack(
                attr.class('gap-2'),
                html.h3(attr.class('text-lg font-semibold'), mod.displayName),
                html.p(
                  attr.class('text-sm text-gray-500 dark:text-gray-400'),
                  `@tempots/beatui${mod.slug === 'main' ? '' : '/' + mod.slug}`
                )
              )
            )
          )
        )
      )
    )
  )
}

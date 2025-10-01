import { html, attr } from '@tempots/dom'
import { Stack, Card } from '@tempots/beatui'

export default function AboutPage() {
  return html.div(
    attr.class('p-6'),
    Stack(
      attr.class('gap-4 max-w-280 mx-auto'),
      html.h1(attr.class('text-3xl font-bold'), 'About BeatUI'),
      html.p(
        attr.class('text-gray-500'),
        'BeatUI is a modern TypeScript UI component library built on Tempo-ts. It embraces layered CSS, design tokens, signals for reactivity, and pragmatic, type-safe APIs.'
      ),
      Card(
        {},
        attr.class('p-4'),
        html.p(
          'This documentation site is generated statically using @tempots/dom runHeadless with automated link crawling for SEO-friendly output.'
        )
      )
    )
  )
}

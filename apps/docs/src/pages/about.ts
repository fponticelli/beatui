import { html, attr } from '@tempots/dom'
import { Stack, Card } from '@tempots/beatui'

export default function AboutPage() {
  return html.div(
    attr.class('bu-p-6'),
    Stack(
      attr.class('bu-gap-4 bu-max-w-3xl bu-mx-auto'),
      html.h1(attr.class('bu-text-3xl bu-font-bold'), 'About BeatUI'),
      html.p(
        attr.class('bu-text-muted'),
        'BeatUI is a modern TypeScript UI component library built on Tempo-ts. It embraces layered CSS, design tokens, signals for reactivity, and pragmatic, type-safe APIs.'
      ),
      Card(
        {},
        attr.class('bu-p-4'),
        html.p(
          'This documentation site is generated statically using @tempots/dom runHeadless with automated link crawling for SEO-friendly output.'
        )
      )
    )
  )
}

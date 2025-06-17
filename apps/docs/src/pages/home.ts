import { html, attr } from '@tempots/dom'
import { Anchor } from '@tempots/ui'

export const HomePage = () => {
  return html.div(
    attr.class('bu-flex-col'),
    html.h1('Welcome to BeatUI'),
    html.p('A modern TypeScript UI component library'),
    Anchor(
      {
        href: '/about',
        withViewTransition: true,
      },
      'Click me!'
    )
  )
}

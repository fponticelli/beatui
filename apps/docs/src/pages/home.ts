import { html, attr } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import { Stack, Card } from '@tempots/beatui'

export const HomePage = () => {
  return html.div(
    attr.class('bu-p-6'),
    Stack(
      attr.class('bu-max-w-4xl bu-mx-auto'),
      html.h1(
        attr.class('bu-text-4xl bu-font-bold bu-mb-4'),
        'Welcome to BeatUI'
      ),
      html.p(
        attr.class('bu-text-xl bu-text--muted bu-mb-8'),
        'A modern TypeScript UI component library built with Tempo-ts'
      ),

      // Featured sections
      html.h2(
        attr.class('bu-text-2xl bu-font-semibold bu-mb-4'),
        'Documentation'
      ),

      html.div(
        attr.class('bu-grid bu-grid-cols-1 md:bu-grid-cols-2 bu-gap-4 bu-mb-8'),

        // Authentication
        Anchor(
          { href: '/authentication', withViewTransition: true },
          Card(
            {},
            attr.class(
              'bu-p-6 bu-hover:bu-bg--lighter-neutral bu-transition-colors'
            ),
            Stack(
              attr.class('bu-gap-3'),
              html.h3(
                attr.class('bu-text-lg bu-font-semibold'),
                'Authentication'
              ),
              html.p(
                attr.class('bu-text--muted'),
                'Complete authentication component suite with social login support'
              )
            )
          )
        ),

        // Components
        Anchor(
          { href: '/button', withViewTransition: true },
          Card(
            {},
            attr.class(
              'bu-p-6 bu-hover:bu-bg--lighter-neutral bu-transition-colors'
            ),
            Stack(
              attr.class('bu-gap-3'),
              html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Components'),
              html.p(
                attr.class('bu-text--muted'),
                'Explore all available UI components and their documentation'
              )
            )
          )
        ),

        // Forms
        Anchor(
          { href: '/form', withViewTransition: true },
          Card(
            {},
            attr.class(
              'bu-p-6 bu-hover:bu-bg--lighter-neutral bu-transition-colors'
            ),
            Stack(
              attr.class('bu-gap-3'),
              html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Forms'),
              html.p(
                attr.class('bu-text--muted'),
                'Powerful form handling with validation and type safety'
              )
            )
          )
        ),

        // About
        Anchor(
          { href: '/about', withViewTransition: true },
          Card(
            {},
            attr.class(
              'bu-p-6 bu-hover:bu-bg--lighter-neutral bu-transition-colors'
            ),
            Stack(
              attr.class('bu-gap-3'),
              html.h3(attr.class('bu-text-lg bu-font-semibold'), 'About'),
              html.p(
                attr.class('bu-text--muted'),
                'Learn more about BeatUI and its design principles'
              )
            )
          )
        )
      )
    )
  )
}

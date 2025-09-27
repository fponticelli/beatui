import { html, attr } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import { Stack, Card } from '@tempots/beatui'

const HomePage = () => {
  return html.div(
    attr.class('p-6'),
    Stack(
      attr.class('max-w-4xl mx-auto'),
      html.h1(
        attr.class('text-4xl font-bold mb-4'),
        'Welcome to BeatUI'
      ),
      html.p(
        attr.class('text-xl bc-text-muted mb-8'),
        'A modern TypeScript UI component library built with Tempo-ts'
      ),

      // Featured sections
      html.h2(
        attr.class('text-2xl font-semibold mb-4'),
        'Documentation'
      ),

      html.div(
        attr.class('grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'),

        // Authentication
        Anchor(
          { href: '/authentication', withViewTransition: true },
          Card(
            {},
            attr.class(
              'p-6 bc-hover-surface-subtle transition-colors'
            ),
            Stack(
              attr.class('gap-3'),
              html.h3(
                attr.class('text-lg font-semibold'),
                'Authentication'
              ),
              html.p(
                attr.class('bc-text-muted'),
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
              'p-6 bc-hover-surface-subtle transition-colors'
            ),
            Stack(
              attr.class('gap-3'),
              html.h3(attr.class('text-lg font-semibold'), 'Components'),
              html.p(
                attr.class('bc-text-muted'),
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
              'p-6 bc-hover-surface-subtle transition-colors'
            ),
            Stack(
              attr.class('gap-3'),
              html.h3(attr.class('text-lg font-semibold'), 'Forms'),
              html.p(
                attr.class('bc-text-muted'),
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
              'p-6 bc-hover-surface-subtle transition-colors'
            ),
            Stack(
              attr.class('gap-3'),
              html.h3(attr.class('text-lg font-semibold'), 'About'),
              html.p(
                attr.class('bc-text-muted'),
                'Learn more about BeatUI and its design principles'
              )
            )
          )
        )
      )
    )
  )
}

export default HomePage

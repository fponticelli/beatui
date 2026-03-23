import { html, attr } from '@tempots/dom'
import { Stack, Button, Icon } from '@tempots/beatui'
import { Anchor } from '@tempots/ui'

export function NotFoundPage() {
  return html.div(
    attr.class('h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-50/30 via-transparent to-transparent dark:from-primary-950/20'),
    Stack(
      attr.class('h-full items-center justify-center gap-4 p-8'),
      Icon({ icon: 'lucide:search-x', size: 'xl' }),
      html.h1(
        attr.class('not-found-title text-7xl font-extrabold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent'),
        '404'
      ),
      html.p(
        attr.class('text-gray-500 dark:text-gray-400 text-center text-sm'),
        "Lost? Don't worry, let's get you back on track."
      ),
      html.p(
        attr.class('text-gray-600 dark:text-gray-400 text-center max-w-md'),
        'The page you are looking for does not exist. It may have been moved or the URL might be incorrect.'
      ),
      Anchor(
        { href: '/', viewTransition: true },
        attr.class('inline-flex'),
        Button({ variant: 'filled', color: 'primary' }, 'Back to Home')
      )
    )
  )
}

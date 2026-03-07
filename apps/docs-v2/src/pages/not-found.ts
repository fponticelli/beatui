import { html, attr } from '@tempots/dom'
import { Stack, Button, Icon } from '@tempots/beatui'
import { Anchor } from '@tempots/ui'

export function NotFoundPage() {
  return Stack(
    attr.class('h-full items-center justify-center gap-4 p-8'),
    Icon({ icon: 'lucide:search-x', size: 'xl' }),
    html.h1(attr.class('text-4xl font-bold'), '404'),
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
}

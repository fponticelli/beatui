import { Icon } from '@tempots/beatui'
import { html, attr, Signal } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Icon',
  category: 'Data Display',
  component: 'Icon',
  description:
    'Renders an SVG icon from the Iconify library with lazy loading, caching, and theme color support.',
  icon: 'lucide:star',
  order: 3,
}

export default function IconPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Icon', signals => {
      // Set a default icon so something renders initially
      ;(signals.icon as Signal<string>).set('lucide:star')
      return Icon({ ...signals } as never)
    }),
    sections: [
      ...AutoSections('Icon', props =>
        Icon({ ...props, icon: 'lucide:star' } as never)
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4 items-end'),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Icon({ icon: 'lucide:star', size: 'xs' }),
              html.span(attr.class('text-xs text-gray-500'), 'xs')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Icon({ icon: 'lucide:star', size: 'sm' }),
              html.span(attr.class('text-xs text-gray-500'), 'sm')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Icon({ icon: 'lucide:star', size: 'md' }),
              html.span(attr.class('text-xs text-gray-500'), 'md')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Icon({ icon: 'lucide:star', size: 'lg' }),
              html.span(attr.class('text-xs text-gray-500'), 'lg')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Icon({ icon: 'lucide:star', size: 'xl' }),
              html.span(attr.class('text-xs text-gray-500'), 'xl')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              Icon({ icon: 'lucide:star', size: '2xl' }),
              html.span(attr.class('text-xs text-gray-500'), '2xl')
            )
          ),
        'Icons scale from xs to 2xl to match surrounding text or UI elements.'
      ),
      Section(
        'Theme Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4 items-center'),
            Icon({ icon: 'lucide:circle', size: 'lg', color: 'primary' }),
            Icon({ icon: 'lucide:circle', size: 'lg', color: 'secondary' }),
            Icon({ icon: 'lucide:circle', size: 'lg', color: 'success' }),
            Icon({ icon: 'lucide:circle', size: 'lg', color: 'warning' }),
            Icon({ icon: 'lucide:circle', size: 'lg', color: 'danger' }),
            Icon({ icon: 'lucide:circle', size: 'lg', color: 'info' })
          ),
        'Apply a theme color to tint the icon using semantic color tokens.'
      ),
      Section(
        'Icon Sources',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4 items-center'),
            Icon({ icon: 'lucide:home', size: 'lg' }),
            Icon({ icon: 'mdi:account', size: 'lg' }),
            Icon({ icon: 'material-symbols:favorite', size: 'lg' }),
            Icon({ icon: 'tabler:settings', size: 'lg' }),
            Icon({ icon: 'heroicons:bell', size: 'lg' })
          ),
        'Any Iconify icon set can be used. Icons are fetched on demand and cached locally.'
      ),
      Section(
        'Informative Icons',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4 items-center'),
            Icon({
              icon: 'lucide:alert-triangle',
              size: 'lg',
              color: 'warning',
              title: 'Warning: check your input',
              accessibility: 'informative',
            }),
            Icon({
              icon: 'lucide:check-circle',
              size: 'lg',
              color: 'success',
              title: 'Action completed successfully',
              accessibility: 'informative',
            })
          ),
        'Informative icons receive aria-label and role="img" for screen reader support. Provide a title describing the icon\'s meaning.'
      ),
    ],
  })
}

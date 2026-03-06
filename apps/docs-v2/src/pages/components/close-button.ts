import { CloseButton } from '@tempots/beatui'
import { html, attr, Value } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'CloseButton',
  category: 'Buttons',
  component: 'CloseButton',
  description:
    'A small icon-only button for dismissing modals, drawers, notifications, and tags. Fully accessible with ARIA labeling.',
  icon: 'lucide:x-circle',
  order: 9,
}

export default function CloseButtonPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('CloseButton', props =>
      CloseButton(props as Record<string, Value<unknown>>)
    ),
    sections: [
      ...AutoSections('CloseButton', props =>
        CloseButton(props as Record<string, Value<unknown>>)
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-4'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                attr.class('flex flex-col items-center gap-1'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  size
                ),
                CloseButton({ size })
              )
            )
          ),
        'CloseButton is available in five sizes matching the standard control size scale.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-4'),
            ...(
              [
                'base',
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
              ] as const
            ).map(color =>
              html.div(
                attr.class('flex flex-col items-center gap-1'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  color
                ),
                CloseButton({ color })
              )
            )
          ),
        'The color prop controls the icon tint using theme color tokens.'
      ),
      Section(
        'Custom Icon',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-4'),
            CloseButton({ icon: 'line-md:close' }),
            CloseButton({ icon: 'mdi:close-circle' }),
            CloseButton({ icon: 'mdi:close-thick' }),
            CloseButton({ icon: 'lucide:x' })
          ),
        'Override the default close icon with any Iconify icon identifier.'
      ),
      Section(
        'Roundedness',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-4'),
            ...(
              ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const
            ).map(roundedness =>
              html.div(
                attr.class('flex flex-col items-center gap-1'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  roundedness
                ),
                CloseButton({ roundedness })
              )
            )
          ),
        'Border radius can be adjusted from square to fully round.'
      ),
      Section(
        'Disabled State',
        () =>
          html.div(
            attr.class('flex flex-wrap items-center gap-4'),
            CloseButton({}),
            CloseButton({ disabled: true })
          ),
        'A disabled CloseButton is non-interactive and appears muted.'
      ),
      Section(
        'Common Use: Dismissible Card',
        () =>
          html.div(
            attr.class(
              'relative flex items-start gap-3 p-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-w-sm'
            ),
            html.div(
              attr.class('flex-1'),
              html.p(
                attr.class('text-sm font-medium text-gray-900 dark:text-gray-100'),
                'File uploaded successfully'
              ),
              html.p(
                attr.class('text-sm text-gray-500 dark:text-gray-400 mt-0.5'),
                'report-q4-2024.pdf was uploaded to your workspace.'
              )
            ),
            html.div(
              attr.class('absolute top-2 right-2'),
              CloseButton({ size: 'sm', onClick: () => {} })
            )
          ),
        'Typically placed in the corner of cards, notices, or modal headers.'
      ),
    ],
  })
}

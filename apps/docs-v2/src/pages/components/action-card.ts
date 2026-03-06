import { ActionCard, Group } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ActionCard',
  category: 'Layout',
  component: 'ActionCard',
  description:
    'An interactive card with an icon, title, and description. Used for selection grids, feature highlights, and navigation tiles.',
  icon: 'lucide:layout-grid',
  order: 7,
}

export default function ActionCardPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('ActionCard', props =>
      ActionCard({
        ...(props as never),
        icon: 'material-symbols:star',
        title: 'Feature Title',
        description: 'A short description of this feature or option.',
      })
    ),
    sections: [
      ...AutoSections('ActionCard', props =>
        ActionCard({
          ...(props as never),
          icon: 'material-symbols:settings',
          title: 'Option',
          description: 'Option description.',
        })
      ),
      Section(
        'Basic',
        () =>
          ActionCard({
            icon: 'material-symbols:upload',
            title: 'Upload File',
            description: 'Select a file from your computer to upload.',
          }),
        'A basic ActionCard displays an icon, title, and description.'
      ),
      Section(
        'Clickable',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ActionCard({
              icon: 'material-symbols:cloud-upload',
              title: 'Upload',
              description: 'Upload files to the cloud.',
              onClick: () => {},
            }),
            ActionCard({
              icon: 'material-symbols:download',
              title: 'Download',
              description: 'Download files from the cloud.',
              onClick: () => {},
            }),
            ActionCard({
              icon: 'material-symbols:share',
              title: 'Share',
              description: 'Share files with others.',
              onClick: () => {},
            })
          ),
        'When onClick is provided, the card becomes interactive with keyboard support and hover styles.'
      ),
      Section(
        'Selection Grid',
        () => {
          const selected = prop<string>('option-a')
          return html.div(
            attr.class('flex flex-wrap gap-4'),
            ...(['option-a', 'option-b', 'option-c'] as const).map(
              (option, i) =>
                ActionCard({
                  icon: [
                    'material-symbols:check-circle',
                    'material-symbols:star',
                    'material-symbols:favorite',
                  ][i]!,
                  title: ['Option A', 'Option B', 'Option C'][i]!,
                  description: ['Recommended', 'Popular choice', 'Advanced'][i]!,
                  active: selected.map(v => v === option),
                  onClick: () => selected.set(option),
                })
            )
          )
        },
        'Use the active prop to highlight the selected card in a selection grid.'
      ),
      Section(
        'Disabled State',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ActionCard({
              icon: 'material-symbols:lock-open',
              title: 'Available Feature',
              description: 'This feature is available to you.',
              onClick: () => {},
            }),
            ActionCard({
              icon: 'material-symbols:lock',
              title: 'Premium Feature',
              description: 'Upgrade to unlock this feature.',
              disabled: true,
              onClick: () => {},
            })
          ),
        'Disabled cards cannot be clicked and appear dimmed.'
      ),
      Section(
        'Icon Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ...(['primary', 'success', 'warning', 'danger', 'info'] as const).map(
              color =>
                ActionCard({
                  icon: 'material-symbols:circle',
                  title: color.charAt(0).toUpperCase() + color.slice(1),
                  description: `Icon with ${color} color.`,
                  iconColor: color,
                })
            )
          ),
        'The iconColor prop applies a theme color to the icon.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4 items-start'),
            ...(['sm', 'md', 'lg'] as const).map(size =>
              ActionCard({
                icon: 'material-symbols:info',
                title: `Size: ${size}`,
                description: 'Padding scales with size.',
                size,
              })
            )
          ),
        'The size prop controls the card padding and text sizing.'
      ),
      Section(
        'Custom Colors',
        () =>
          Group(
            ActionCard({
              icon: 'material-symbols:palette',
              title: 'Custom Theme',
              description: 'Override colors via CSS variables.',
              backgroundColor: 'var(--color-primary-50)',
              borderColor: 'var(--color-primary-300)',
              titleColor: 'var(--color-primary-700)',
              descriptionColor: 'var(--color-primary-500)',
            }),
            ActionCard({
              icon: 'material-symbols:eco',
              title: 'Success Theme',
              description: 'Green custom color scheme.',
              backgroundColor: 'var(--color-success-50)',
              borderColor: 'var(--color-success-300)',
              titleColor: 'var(--color-success-700)',
              descriptionColor: 'var(--color-success-500)',
            })
          ),
        'Use backgroundColor, borderColor, titleColor, and descriptionColor for full custom theming.'
      ),
    ],
  })
}

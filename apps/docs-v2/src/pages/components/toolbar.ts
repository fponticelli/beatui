import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarDivider,
  ToolbarSpacer,
  Icon,
  Button,
} from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Toolbar',
  category: 'Navigation',
  component: 'Toolbar',
  description:
    'Horizontal toolbar container with roving tabindex keyboard navigation, grouping, dividers, and spacers.',
  icon: 'lucide:grip-horizontal',
  order: 6,
}

export default function ToolbarPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Toolbar', _signals =>
      Toolbar(
        ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:bold', size: 'sm' })),
        ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:italic', size: 'sm' })),
        ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:underline', size: 'sm' })),
        ToolbarDivider(),
        ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:align-left', size: 'sm' })),
        ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:align-center', size: 'sm' })),
        ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:align-right', size: 'sm' })),
        ToolbarSpacer(),
        ToolbarButton(
          { variant: 'filled', color: 'primary', size: 'sm' },
          'Save'
        )
      )
    ),
    sections: [
      Section(
        'Basic Toolbar',
        () =>
          Toolbar(
            ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:home', size: 'sm' })),
            ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:search', size: 'sm' })),
            ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:settings', size: 'sm' }))
          ),
        'A simple toolbar with icon buttons.'
      ),
      Section(
        'With Groups and Dividers',
        () =>
          Toolbar(
            ToolbarGroup(
              ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:bold', size: 'sm' })),
              ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:italic', size: 'sm' })),
              ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:underline', size: 'sm' }))
            ),
            ToolbarDivider(),
            ToolbarGroup(
              ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:align-left', size: 'sm' })),
              ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:align-center', size: 'sm' })),
              ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:align-right', size: 'sm' }))
            )
          ),
        'Use ToolbarGroup to cluster related actions and ToolbarDivider to separate them.'
      ),
      Section(
        'With Spacer and Action Button',
        () =>
          Toolbar(
            ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:undo-2', size: 'sm' })),
            ToolbarButton({ size: 'sm' }, Icon({ icon: 'lucide:redo-2', size: 'sm' })),
            ToolbarSpacer(),
            ToolbarButton(
              { variant: 'filled', color: 'primary', size: 'sm' },
              'Publish'
            )
          ),
        'ToolbarSpacer pushes subsequent items to the end of the toolbar.'
      ),
      Section(
        'Text Labels',
        () =>
          Toolbar(
            ToolbarButton(
              { size: 'sm' },
              Icon({ icon: 'lucide:plus', size: 'sm' }),
              'New'
            ),
            ToolbarButton(
              { size: 'sm' },
              Icon({ icon: 'lucide:pencil', size: 'sm' }),
              'Edit'
            ),
            ToolbarButton(
              { size: 'sm', color: 'danger' },
              Icon({ icon: 'lucide:trash-2', size: 'sm' }),
              'Delete'
            )
          ),
        'Toolbar buttons can combine icons with text labels.'
      ),
    ],
  })
}

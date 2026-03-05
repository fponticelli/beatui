import { Drawer, Button, Group, Stack, Icon } from '@tempots/beatui'
import { html, attr, Fragment, Value } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section, snapshotSignals } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Drawer',
  category: 'Overlays',
  component: 'Drawer',
  description: 'A sliding panel anchored to any edge of the viewport.',
  icon: 'lucide:panel-right',
  order: 2,
}

export default function DrawerPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Drawer', signals =>
      Drawer((open, close) =>
        Button(
          {
            variant: 'filled',
            color: 'primary',
            onClick: () =>
              open({
                ...snapshotSignals(signals),
                header: html.h2('Drawer Title'),
                body: html.div(
                  html.p('This is the drawer body content.'),
                  html.p(
                    attr.class('text-sm text-gray-500 mt-2'),
                    'Click outside or press Escape to close.'
                  )
                ),
                footer: Fragment(
                  attr.class('justify-end'),
                  Button(
                    { variant: 'default', onClick: close },
                    'Cancel'
                  ),
                  Button(
                    { variant: 'filled', color: 'primary', onClick: close },
                    'Save'
                  )
                ),
              } as never),
          },
          'Open Drawer'
        )
      )
    ),
    sections: [
      Section(
        'Sides',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['left', 'right', 'top', 'bottom'] as const).map(side =>
              Drawer((open) =>
                Button(
                  {
                    variant: 'outline',
                    onClick: () =>
                      open({
                        side,
                        header: html.h2(`${side} Drawer`),
                        body: html.p(`This drawer slides in from the ${side}.`),
                      }),
                  },
                  side
                )
              )
            )
          ),
        'Drawers can anchor to any edge of the viewport.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['sm', 'md', 'lg', 'xl'] as const).map(size =>
              Drawer((open) =>
                Button(
                  {
                    variant: 'light',
                    onClick: () =>
                      open({
                        size,
                        header: html.h2(`${size.toUpperCase()} Drawer`),
                        body: html.p(`This is a ${size} size drawer.`),
                      }),
                  },
                  size.toUpperCase()
                )
              )
            )
          ),
        'Control the width of the drawer panel.'
      ),
      Section(
        'Non-dismissable',
        () =>
          Drawer((open, close) =>
            Button(
              {
                variant: 'filled',
                color: 'warning',
                onClick: () =>
                  open({
                    dismissable: false,
                    showCloseButton: false,
                    header: html.h2('Important'),
                    body: html.div(
                      html.p('You must acknowledge this.'),
                      html.div(
                        attr.class('mt-4 flex justify-end'),
                        Button(
                          { variant: 'filled', color: 'primary', onClick: close },
                          'Acknowledge'
                        )
                      )
                    ),
                  }),
              },
              'Open Non-dismissable'
            )
          ),
        'Drawers can prevent dismissal via outside click or Escape.'
      ),
      Section(
        'With Navigation Content',
        () =>
          Drawer((open) =>
            Button(
              {
                variant: 'outline',
                onClick: () =>
                  open({
                    side: 'left',
                    header: Group(
                      attr.class('items-center gap-2'),
                      Icon({ icon: 'lucide:menu', size: 'sm' }),
                      html.span('Navigation')
                    ),
                    body: Stack(
                      attr.class('gap-1'),
                      ...['Dashboard', 'Settings', 'Profile', 'Help'].map(
                        item =>
                          html.div(
                            attr.class(
                              'px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                            ),
                            item
                          )
                      )
                    ),
                  }),
              },
              'Open Nav Drawer'
            )
          ),
        'Drawers are great for navigation menus and settings panels.'
      ),
    ],
  })
}

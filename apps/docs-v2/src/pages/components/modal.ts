import { Modal, Button, Group, Icon, ConfirmModal } from '@tempots/beatui'
import { html, attr, Fragment } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Modal',
  category: 'Overlays',
  component: 'Modal',
  description:
    'A dialog overlay for focused interactions, with customizable size and position.',
  icon: 'lucide:square',
  order: 1,
}

export default function ModalPage() {
  return ComponentPage(meta, {
    // Modal uses a callback API (open, close) so autoPlayground doesn't apply
    playground: html.div(
      attr.class(
        'flex items-center justify-center gap-4 p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
      ),
      Modal(
        {
          size: 'md',
          onClose: () => console.log('closed'),
        },
        (open, close) =>
          Button(
            {
              variant: 'filled',
              color: 'primary',
              onClick: () =>
                open({
                  header: html.h2('Modal Title'),
                  body: html.div(
                    html.p('This is the modal body content.'),
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
                      'Confirm'
                    )
                  ),
                }),
            },
            'Open Modal'
          )
      )
    ),
    sections: [
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['sm', 'md', 'lg', 'xl'] as const).map(size =>
              Modal(
                { size, onClose: () => {} },
                open =>
                  Button(
                    {
                      variant: 'outline',
                      onClick: () =>
                        open({
                          header: html.h2(`${size.toUpperCase()} Modal`),
                          body: html.p(
                            `This is a ${size} modal dialog.`
                          ),
                        }),
                    },
                    `${size.toUpperCase()}`
                  )
              )
            )
          ),
        'Modals come in four sizes: sm, md, lg, and xl.'
      ),
      Section(
        'Positions',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['center', 'top', 'bottom'] as const).map(position =>
              Modal(
                { size: 'sm', position, onClose: () => {} },
                open =>
                  Button(
                    {
                      variant: 'light',
                      onClick: () =>
                        open({
                          header: html.h2(`${position} positioned`),
                          body: html.p(`This modal is positioned at the ${position}.`),
                        }),
                    },
                    position
                  )
              )
            )
          ),
        'Control where the modal appears within the viewport.'
      ),
      Section(
        'With Custom Header',
        () =>
          Modal(
            { size: 'md', onClose: () => {} },
            open =>
              Button(
                {
                  variant: 'outline',
                  onClick: () =>
                    open({
                      header: Group(
                        attr.class('flex items-center gap-2'),
                        Icon({ icon: 'mdi:information', size: 'md' }),
                        html.h2('Custom Header with Icon')
                      ),
                      body: html.p('The header area is fully customizable.'),
                    }),
                },
                'Open Custom Header'
              )
          ),
        'Modal headers can contain icons, badges, or any content.'
      ),
      Section(
        'Non-dismissable',
        () =>
          Modal(
            {
              size: 'sm',
              dismissable: false,
              showCloseButton: false,
              onClose: () => {},
            },
            (open, close) =>
              Button(
                {
                  variant: 'filled',
                  color: 'warning',
                  onClick: () =>
                    open({
                      header: html.h2('Important'),
                      body: html.div(
                        html.p('You must acknowledge this message.'),
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
        'Modals can prevent dismissal via clicking outside or pressing Escape.'
      ),
      Section(
        'Confirmation Modal',
        () =>
          ConfirmModal(
            {
              confirmText: 'Delete',
              cancelText: 'Cancel',
              size: 'sm',
              onConfirm: () => console.log('confirmed'),
              onCancel: () => console.log('cancelled'),
              onClose: () => {},
            },
            open =>
              Button(
                {
                  variant: 'filled',
                  color: 'danger',
                  onClick: () =>
                    open('Are you sure? This action cannot be undone.'),
                },
                'Delete Item'
              )
          ),
        'Pre-built confirmation dialog with confirm/cancel actions.'
      ),
    ],
  })
}

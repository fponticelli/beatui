import { ConfirmationDialog, Button } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ConfirmationDialog',
  category: 'Overlays',
  component: 'ConfirmationDialog',
  description:
    'A confirmation dialog for destructive or irreversible actions. Displays a title with a colored icon, descriptive body, optional consequence list, and confirm/cancel buttons.',
  icon: 'lucide:shield-alert',
  order: 5,
}

export default function ConfirmDialogPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('ConfirmationDialog', signals =>
      ConfirmationDialog(
        {
          title: signals.title ?? 'Confirm action',
          body: 'Are you sure you want to perform this action? This cannot be undone.',
          icon: signals.icon,
          color: signals.color,
          confirmText: signals.confirmText,
          cancelText: signals.cancelText,
          dismissable: signals.dismissable,
          onConfirm: () => console.log('confirmed'),
          onCancel: () => console.log('cancelled'),
        } as never,
        (open) =>
          Button(
            {
              variant: 'filled',
              color: 'danger',
              onClick: open,
            },
            'Open Confirmation'
          )
      )
    ),
    sections: [
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...([
              { color: 'danger', label: 'Delete', icon: 'lucide:trash-2' },
              { color: 'warning', label: 'Archive', icon: 'lucide:archive' },
              { color: 'info', label: 'Transfer', icon: 'lucide:send' },
              { color: 'success', label: 'Publish', icon: 'lucide:globe' },
            ] as const).map(({ color, label, icon }) =>
              ConfirmationDialog(
                {
                  title: `${label} item`,
                  body: `Are you sure you want to ${label.toLowerCase()} this item?`,
                  icon,
                  color,
                  confirmText: label,
                  onConfirm: () => console.log(`${label} confirmed`),
                },
                (open) =>
                  Button(
                    { variant: 'light', color, onClick: open },
                    label
                  )
              )
            )
          ),
        'ConfirmationDialog supports all theme colors, applied to the icon background and confirm button.'
      ),
      Section(
        'With Consequences',
        () =>
          ConfirmationDialog(
            {
              title: 'Delete collection',
              body: 'This will permanently remove all 24 records in this collection.',
              icon: 'lucide:trash-2',
              color: 'danger',
              consequences: [
                'All records will be moved to trash',
                'Shared access links will be revoked',
                'This action cannot be undone',
              ],
              confirmText: 'Delete collection',
              cancelText: 'Keep collection',
              onConfirm: () => console.log('Delete confirmed'),
              onCancel: () => console.log('Cancelled'),
            },
            (open) =>
              Button(
                { variant: 'filled', color: 'danger', onClick: open },
                'Delete Collection'
              )
          ),
        'Use the consequences array to list specific outcomes of the action as bullet points.'
      ),
      Section(
        'Custom Button Labels',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ConfirmationDialog(
              {
                title: 'Discard changes',
                body: 'You have unsaved changes. Are you sure you want to leave?',
                icon: 'lucide:file-x',
                color: 'warning',
                confirmText: 'Discard changes',
                cancelText: 'Keep editing',
                onConfirm: () => console.log('Discarded'),
              },
              (open) =>
                Button(
                  { variant: 'light', color: 'warning', onClick: open },
                  'Discard'
                )
            ),
            ConfirmationDialog(
              {
                title: 'Sign out',
                body: 'You will be redirected to the login page.',
                icon: 'lucide:log-out',
                color: 'info',
                confirmText: 'Sign out',
                cancelText: 'Stay signed in',
                onConfirm: () => console.log('Signed out'),
              },
              (open) =>
                Button(
                  { variant: 'light', color: 'info', onClick: open },
                  'Sign out'
                )
            )
          ),
        'Provide context-specific labels for the confirm and cancel buttons.'
      ),
      Section(
        'Non-dismissable',
        () =>
          ConfirmationDialog(
            {
              title: 'Required acknowledgement',
              body: 'You must confirm before proceeding with this operation.',
              icon: 'lucide:lock',
              color: 'warning',
              dismissable: false,
              confirmText: 'I understand, proceed',
              onConfirm: () => console.log('Acknowledged'),
            },
            (open) =>
              Button(
                { variant: 'outline', color: 'warning', onClick: open },
                'Required Action'
              )
          ),
        'Set dismissable to false to require explicit confirmation or cancellation.'
      ),
    ],
  })
}

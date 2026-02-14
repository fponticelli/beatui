import { html, attr } from '@tempots/dom'
import {
  Button,
  ConfirmationDialog,
  AlertDialog,
  PromptDialog,
  ScrollablePanel,
  Stack,
  Group,
} from '@tempots/beatui'

export default function DialogsPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('items-start gap-1 p-4'),

      // --- ConfirmationDialog ---
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Confirmation Dialog'),
      html.p(
        'Rich confirmation dialog with icon, description, optional consequence list, and colored action buttons.'
      ),

      Group(
        attr.class('gap-2 flex-wrap'),
        // Danger
        ConfirmationDialog(
          {
            title: 'Delete collection',
            body: 'Are you sure you want to delete "Test Collection"? This will permanently remove all 24 records, 8 fields, and 3 saved views.',
            icon: 'lucide:trash-2',
            color: 'danger',
            consequences: [
              'All records will be moved to trash for 30 days',
              'Linked references in other documents will break',
              'Shared access for 3 collaborators will be revoked',
            ],
            confirmText: 'Delete collection',
            cancelText: 'Keep collection',
            onConfirm: () => console.log('Deleted'),
          },
          open =>
            Button(
              {
                variant: 'filled',
                color: 'danger',
                onClick: open,
              },
              'Delete Collection'
            )
        ),

        // Warning
        ConfirmationDialog(
          {
            title: 'Remove team member',
            body: 'Remove Jordan Lee from the Engineering workspace?',
            icon: 'lucide:users',
            color: 'warning',
            consequences: [
              'They will lose access to all documents and collections',
              'Their comments and edits will be preserved',
              'You can re-invite them later',
            ],
            confirmText: 'Remove member',
            cancelText: 'Cancel',
            onConfirm: () => console.log('Removed'),
          },
          open =>
            Button(
              {
                variant: 'filled',
                color: 'warning',
                onClick: open,
              },
              'Remove Member'
            )
        ),

        // No consequences
        ConfirmationDialog(
          {
            title: 'Discard unsaved changes',
            body: 'You have unsaved changes in "Q3 Budget Report". Leaving now will discard your edits.',
            icon: 'lucide:alert-triangle',
            color: 'warning',
            confirmText: 'Discard changes',
            cancelText: 'Keep editing',
            onConfirm: () => console.log('Discarded'),
          },
          open =>
            Button(
              {
                variant: 'outline',
                color: 'warning',
                onClick: open,
              },
              'Discard Changes'
            )
        )
      ),

      // --- AlertDialog ---
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Alert Dialog'),
      html.p(
        'Alert dialogs for displaying important messages. Supports info, success, warning, and error variants with appropriate icons and colors.'
      ),

      Group(
        attr.class('gap-2 flex-wrap'),
        AlertDialog(
          {
            title: 'Information',
            body: html.p(
              'Your workspace has been synced. All changes are up to date.'
            ),
            variant: 'info',
          },
          open =>
            Button({ variant: 'light', color: 'info', onClick: open }, 'Info')
        ),
        AlertDialog(
          {
            title: 'Changes saved',
            body: html.p('Your settings have been updated successfully.'),
            variant: 'success',
          },
          open =>
            Button(
              { variant: 'light', color: 'success', onClick: open },
              'Success'
            )
        ),
        AlertDialog(
          {
            title: 'Storage almost full',
            body: html.p(
              'You are using 95% of your storage quota. Consider upgrading your plan or removing unused files.'
            ),
            variant: 'warning',
          },
          open =>
            Button(
              { variant: 'light', color: 'warning', onClick: open },
              'Warning'
            )
        ),
        AlertDialog(
          {
            title: 'Connection failed',
            body: html.p(
              'Unable to connect to the server. Please check your network and try again.'
            ),
            variant: 'error',
          },
          open =>
            Button(
              { variant: 'light', color: 'danger', onClick: open },
              'Error'
            )
        )
      ),

      // --- AlertDialog with custom icon ---
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Custom Icon'),
      html.p('Alert dialog with a custom icon override.'),

      AlertDialog(
        {
          title: 'Update available',
          body: html.p(
            'Version 2.4.0 is available. Update now to get the latest features and fixes.'
          ),
          variant: 'info',
          icon: 'lucide:download',
          okText: 'Got it',
        },
        open =>
          Button(
            { variant: 'outline', color: 'info', onClick: open },
            'Update Available'
          )
      ),

      // --- PromptDialog ---
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Prompt Dialog'),
      html.p(
        'Prompt dialog for collecting text input. Supports Enter key to submit.'
      ),

      Group(
        attr.class('gap-2 flex-wrap'),
        PromptDialog(
          {
            title: 'Rename file',
            body: html.p('Enter a new name for this file.'),
            placeholder: 'File name',
            defaultValue: 'untitled.txt',
            confirmText: 'Rename',
            onConfirm: value => console.log('Renamed to:', value),
          },
          open => Button({ variant: 'outline', onClick: open }, 'Rename File')
        ),
        PromptDialog(
          {
            title: 'Create workspace',
            body: html.p('Choose a name for your new workspace.'),
            placeholder: 'Workspace name',
            confirmText: 'Create',
            onConfirm: value => console.log('Created:', value),
          },
          open =>
            Button(
              { variant: 'filled', color: 'primary', onClick: open },
              'New Workspace'
            )
        ),
        PromptDialog(
          {
            title: 'Add comment',
            placeholder: 'Write your comment...',
            confirmText: 'Post',
            cancelText: 'Discard',
            onConfirm: value => console.log('Comment:', value),
          },
          open => Button({ variant: 'light', onClick: open }, 'Add Comment')
        )
      )
    ),
  })
}

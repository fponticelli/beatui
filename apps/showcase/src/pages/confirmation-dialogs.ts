import { html, attr } from '@tempots/dom'
import {
  Button,
  ConfirmationDialog,
  AlertDialog,
  PromptDialog,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionBlock } from '../views/section'

export default function ConfirmationDialogsPage() {
  return WidgetPage({
    id: 'confirmation-dialogs',
    title: 'Dialogs',
    description:
      'Confirmation, alert, and prompt dialogs for common user interactions.',
    body: html.div(
      attr.style(
        'display: flex; flex-direction: column; gap: 24px; padding: 4px'
      ),

      // Confirmation Dialogs
      SectionBlock(
        'Confirmation Dialogs',
        html.div(
          attr.style('display: flex; flex-wrap: wrap; gap: 12px'),
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
                  size: 'sm',
                  onClick: open,
                },
                'Delete collection'
              )
          ),
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
                  size: 'sm',
                  onClick: open,
                },
                'Remove member'
              )
          ),
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
                  size: 'sm',
                  onClick: open,
                },
                'Discard changes'
              )
          )
        )
      ),

      // Alert Dialogs
      SectionBlock(
        'Alert Dialogs',
        html.div(
          attr.style('display: flex; flex-wrap: wrap; gap: 12px'),
          AlertDialog(
            {
              title: 'Information',
              body: html.p(
                'Your workspace has been synced. All changes are up to date.'
              ),
              variant: 'info',
            },
            open =>
              Button(
                { variant: 'light', color: 'info', size: 'sm', onClick: open },
                'Info alert'
              )
          ),
          AlertDialog(
            {
              title: 'Changes saved',
              body: html.p('Your settings have been updated successfully.'),
              variant: 'success',
            },
            open =>
              Button(
                {
                  variant: 'light',
                  color: 'success',
                  size: 'sm',
                  onClick: open,
                },
                'Success alert'
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
                {
                  variant: 'light',
                  color: 'warning',
                  size: 'sm',
                  onClick: open,
                },
                'Warning alert'
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
                {
                  variant: 'light',
                  color: 'danger',
                  size: 'sm',
                  onClick: open,
                },
                'Error alert'
              )
          )
        )
      ),

      // Prompt Dialog
      SectionBlock(
        'Prompt Dialog',
        html.div(
          attr.style('display: flex; flex-wrap: wrap; gap: 12px'),
          PromptDialog(
            {
              title: 'Rename file',
              body: html.p('Enter a new name for this file.'),
              placeholder: 'File name',
              defaultValue: 'untitled.txt',
              confirmText: 'Rename',
              onConfirm: value => console.log('Renamed to:', value),
            },
            open =>
              Button(
                { variant: 'outline', size: 'sm', onClick: open },
                'Rename file'
              )
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
                {
                  variant: 'filled',
                  color: 'primary',
                  size: 'sm',
                  onClick: open,
                },
                'New workspace'
              )
          )
        )
      )
    ),
  })
}

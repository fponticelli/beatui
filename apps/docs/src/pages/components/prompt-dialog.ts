import { PromptDialog, Button } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'PromptDialog',
  category: 'Overlays',
  component: 'PromptDialog',
  description:
    'A dialog that prompts the user for text input. Includes a title, optional description, a text field, and confirm/cancel buttons. Pressing Enter submits the form.',
  icon: 'lucide:text-cursor-input',
  order: 6,
}

export default function PromptDialogPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('PromptDialog', signals =>
      PromptDialog(
        {
          title: signals.title,
          placeholder: signals.placeholder,
          defaultValue: signals.defaultValue,
          confirmText: signals.confirmText,
          cancelText: signals.cancelText,
          dismissable: signals.dismissable,
          onConfirm: (value: string) => console.log('Confirmed:', value),
          onCancel: () => console.log('Cancelled'),
        } as never,
        (open) =>
          Button(
            {
              variant: 'filled',
              color: 'primary',
              onClick: open,
            },
            'Open Prompt'
          )
      ),
      { title: 'Enter a value' }
    ),
    sections: [
      Section(
        'Basic Prompt',
        () =>
          PromptDialog(
            {
              title: 'Rename file',
              body: html.p(
                attr.class('text-sm text-gray-500'),
                'Enter a new name for this file.'
              ),
              placeholder: 'File name',
              defaultValue: 'untitled.txt',
              confirmText: 'Rename',
              onConfirm: (name) => console.log('Renamed to:', name),
            },
            (open) =>
              Button(
                { variant: 'outline', onClick: open },
                'Rename File'
              )
          ),
        'A basic prompt with a pre-filled default value and descriptive body text.'
      ),
      Section(
        'Without Default Value',
        () =>
          PromptDialog(
            {
              title: 'Create new folder',
              placeholder: 'Folder name',
              confirmText: 'Create',
              cancelText: 'Cancel',
              onConfirm: (name) => console.log('Created folder:', name),
            },
            (open) =>
              Button(
                { variant: 'light', color: 'primary', onClick: open },
                'New Folder'
              )
          ),
        'Prompts can start with an empty input field when no defaultValue is provided.'
      ),
      Section(
        'Various Use Cases',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            PromptDialog(
              {
                title: 'Add a tag',
                placeholder: 'Tag name',
                confirmText: 'Add tag',
                onConfirm: (tag) => console.log('Tag added:', tag),
              },
              (open) =>
                Button(
                  { variant: 'light', onClick: open },
                  'Add Tag'
                )
            ),
            PromptDialog(
              {
                title: 'Leave a comment',
                body: html.p(
                  attr.class('text-sm text-gray-500'),
                  'Your comment will be visible to all collaborators.'
                ),
                placeholder: 'Write your comment...',
                confirmText: 'Submit',
                onConfirm: (comment) => console.log('Comment:', comment),
              },
              (open) =>
                Button(
                  { variant: 'light', onClick: open },
                  'Add Comment'
                )
            ),
            PromptDialog(
              {
                title: 'Set a URL',
                placeholder: 'https://example.com',
                confirmText: 'Apply',
                onConfirm: (url) => console.log('URL set:', url),
              },
              (open) =>
                Button(
                  { variant: 'light', onClick: open },
                  'Set Link URL'
                )
            )
          ),
        'PromptDialog is suitable for a wide variety of inline data-entry scenarios.'
      ),
      Section(
        'Non-dismissable',
        () =>
          PromptDialog(
            {
              title: 'Enter your password to continue',
              placeholder: 'Password',
              confirmText: 'Confirm',
              dismissable: false,
              onConfirm: (value) => console.log('Password entered:', value),
            },
            (open) =>
              Button(
                { variant: 'filled', color: 'warning', onClick: open },
                'Require Input'
              )
          ),
        'Prevent the user from dismissing the dialog without providing input.'
      ),
    ],
  })
}

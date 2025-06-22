import {
  Button,
  Modal,
  SimpleModal,
  ConfirmModal,
  Stack,
  Label,
  SegmentedControl,
  TextInput,
  Icon,
  Switch,
  Group,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export const ModalPage = () => {
  const size = prop<ModalSize>('md')
  const closable = prop(true)
  const showCloseButton = prop(true)
  const title = prop('Modal Title')
  const effect = prop<'transparent' | 'visible'>('visible')

  return Stack(
    attr.class('bu-h-full bu-overflow-hidden'),
    ControlsHeader(
      Stack(
        Label('Size'),
        SegmentedControl({
          size: 'sm',
          options: {
            sm: 'SM',
            md: 'MD',
            lg: 'LG',
            xl: 'XL',
          },
          value: size,
          onChange: size.set,
        })
      ),
      Stack(
        Label('Effect'),
        SegmentedControl({
          size: 'sm',
          options: {
            visible: 'Visible',
            transparent: 'Transparent',
          },
          value: effect,
          onChange: effect.set,
        })
      ),
      Stack(
        Label('Closable'),
        Switch({ value: closable, onChange: closable.set })
      ),
      Stack(
        Label('Show Close Button'),
        Switch({ value: showCloseButton, onChange: showCloseButton.set })
      ),
      Stack(
        Label('Title'),
        html.div(
          TextInput({
            value: title,
            onInput: (value: string) => title.set(value),
          })
        )
      )
    ),
    Stack(
      attr.class('bu-items-start bu-gap-4 bu-p-4 bu-h-full bu-overflow-auto'),

      // Basic Modal Example
      html.div(
        attr.class('bu-p-4 bu-border bu-rounded-lg bu-bg-white'),
        html.h3('Basic Modal'),
        html.p(
          'A simple modal with title, body content, and optional close button.'
        ),
        Modal(
          {
            size,
            closable,
            showCloseButton,
            effect,
            onClose: () => console.log('Modal closed'),
          },
          (open, _close) =>
            Button(
              {
                variant: 'filled',
                onClick: () =>
                  open({
                    header: html.div(
                      attr.class('bc-modal__header'),
                      html.h2(attr.class('bc-modal__title'), title)
                    ),
                    body: html.div(
                      html.p('This is the modal body content.'),
                      html.p(
                        'You can put any content here including forms, images, or other components.'
                      ),
                      html.ul(
                        html.li('List item 1'),
                        html.li('List item 2'),
                        html.li('List item 3')
                      )
                    ),
                  }),
              },
              'Open Basic Modal'
            )
        )
      ),

      // Modal with Custom Header
      html.div(
        attr.class('bu-p-4 bu-border bu-rounded-lg bu-bg-white'),
        html.h3('Custom Header Modal'),
        html.p('Modal with custom header content instead of default title.'),
        Modal(
          {
            size,
            closable,
            showCloseButton,
            effect,
            onClose: () => console.log('Custom header modal closed'),
          },
          (open, _close) =>
            Button(
              {
                variant: 'outline',
                onClick: () =>
                  open({
                    header: html.div(
                      attr.class('bc-modal__header'),
                      Group(
                        attr.class('bu-flex bu-items-center bu-gap-2'),
                        Icon({ icon: 'mdi:information', size: 'md' }),
                        html.h2(
                          attr.class('bc-modal__title'),
                          'Custom Header with Icon'
                        )
                      )
                    ),
                    body: html.div(
                      html.p('This modal has a custom header with an icon.'),
                      html.p('The header is completely customizable.')
                    ),
                  }),
              },
              'Open Custom Header Modal'
            )
        )
      ),

      // Modal with Footer Actions
      html.div(
        attr.class('bu-p-4 bu-border bu-rounded-lg bu-bg-white'),
        html.h3('Modal with Footer Actions'),
        html.p('Modal with custom footer containing action buttons.'),
        Modal(
          {
            size,
            closable,
            showCloseButton,
            effect,
            onClose: () => console.log('Footer actions modal closed'),
          },
          (open, close) =>
            Button(
              {
                variant: 'filled',
                color: 'primary',
                onClick: () =>
                  open({
                    header: html.div(
                      attr.class('bc-modal__header'),
                      html.h2(attr.class('bc-modal__title'), 'Save Changes')
                    ),
                    body: html.div(
                      html.p('You have unsaved changes.'),
                      html.p(
                        'Would you like to save your changes before closing?'
                      )
                    ),
                    footer: html.div(
                      attr.class('bc-modal__actions'),
                      Button(
                        {
                          variant: 'text',
                          onClick: () => {
                            console.log('Discarded changes')
                            close()
                          },
                        },
                        'Discard'
                      ),
                      Button(
                        {
                          variant: 'outline',
                          onClick: close,
                        },
                        'Cancel'
                      ),
                      Button(
                        {
                          variant: 'filled',
                          color: 'primary',
                          onClick: () => {
                            console.log('Saved changes')
                            close()
                          },
                        },
                        'Save Changes'
                      )
                    ),
                  }),
              },
              'Open Modal with Actions'
            )
        )
      ),

      // Simple Modal Example
      html.div(
        attr.class('bu-p-4 bu-border bu-rounded-lg bu-bg-white'),
        html.h3('Simple Modal'),
        html.p(
          'Convenience component for basic modals with just body content.'
        ),
        SimpleModal(
          {
            size,
            closable,
            effect,
            body: html.div(
              html.p(
                'This is a simple modal created with the SimpleModal convenience function.'
              ),
              html.p('It automatically handles the body content for you.')
            ),
            onClose: () => console.log('Simple modal closed'),
          },
          (open, _close) =>
            Button(
              {
                variant: 'light',
                onClick: open,
              },
              'Open Simple Modal'
            )
        )
      ),

      // Confirmation Modal Example
      html.div(
        attr.class('bu-p-4 bu-border bu-rounded-lg bu-bg-white'),
        html.h3('Confirmation Modal'),
        html.p('Pre-built confirmation dialog with confirm/cancel actions.'),
        ConfirmModal(
          {
            message:
              'Are you sure you want to delete this item? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            size,
            closable,
            effect,
            onConfirm: () => console.log('Item deleted'),
            onCancel: () => console.log('Delete cancelled'),
            onClose: () => console.log('Confirmation modal closed'),
          },
          (open, _close) =>
            Button(
              {
                variant: 'filled',
                color: 'error',
                onClick: open,
              },
              'Delete Item'
            )
        )
      ),

      // Non-closable Modal Example
      html.div(
        attr.class('bu-p-4 bu-border bu-rounded-lg bu-bg-white'),
        html.h3('Non-closable Modal'),
        html.p(
          'Modal that cannot be closed by clicking outside or pressing escape.'
        ),
        Modal(
          {
            size: 'sm',
            closable: false,
            showCloseButton: false,
            effect,
          },
          (open, close) =>
            Button(
              {
                variant: 'filled',
                color: 'warning',
                onClick: () => {
                  open({
                    header: html.div(
                      attr.class('bc-modal__header'),
                      html.h2(attr.class('bc-modal__title'), 'Processing...')
                    ),
                    body: html.div(
                      attr.class('bu-text-center bu-py-4'),
                      html.p('Please wait while we process your request...'),
                      html.div(
                        attr.class('bu-mt-4'),
                        Button(
                          {
                            variant: 'outline',
                            onClick: close,
                          },
                          'Force Close'
                        )
                      )
                    ),
                  })
                  // Simulate processing time
                  setTimeout(close, 3000)
                },
              },
              'Start Processing'
            )
        )
      )
    )
  )
}

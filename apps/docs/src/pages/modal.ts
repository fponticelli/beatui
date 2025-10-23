import {
  Button,
  Modal,
  ConfirmModal,
  Stack,
  Label,
  SegmentedInput,
  TextInput,
  Icon,
  Switch,
  Group,
  OverlayEffect,
  ScrollablePanel,
  InputWrapper,
} from '@tempots/beatui'
import { html, attr, prop, Fragment } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export default function ModalPage() {
  const size = prop<ModalSize>('md')
  const dismissable = prop(true)
  const showCloseButton = prop(true)
  const title = prop('Modal Title')
  const overlayEffect = prop<OverlayEffect>('opaque')
  const position = prop<
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  >('center')

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Size'),
        SegmentedInput({
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
        Label('Overlay Effect'),
        SegmentedInput({
          size: 'sm',
          options: {
            opaque: 'Opaque',
            transparent: 'Transparent',
            none: 'None',
          },
          value: overlayEffect,
          onChange: overlayEffect.set,
        })
      ),
      Stack(
        Label('Position'),
        SegmentedInput({
          size: 'sm',
          options: {
            center: 'Center',
            top: 'Top',
            bottom: 'Bottom',
            left: 'Left',
            right: 'Right',
            'top-left': 'Top-Left',
            'top-right': 'Top-Right',
            'bottom-left': 'Bottom-Left',
            'bottom-right': 'Bottom-Right',
          },
          value: position,
          onChange: position.set,
        })
      ),
      InputWrapper({
        label: 'Dismissable',
        content: Switch({
          value: dismissable,
          onChange: dismissable.set,
        }),
      }),
      InputWrapper({
        label: 'Show Close Button',
        content: Switch({
          value: showCloseButton,
          onChange: showCloseButton.set,
        }),
      }),
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
    body: Stack(
      attr.class('items-start gap-1 p-4'),

      // Basic Modal Example
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Basic Modal'),
      html.p(
        'A simple modal with title, body content, and optional close button.'
      ),
      Modal(
        {
          size,
          dismissable,
          showCloseButton,
          overlayEffect,
          position,
          onClose: () => console.log('Modal closed'),
        },
        (open, _close) =>
          Button(
            {
              variant: 'filled',
              onClick: () =>
                open({
                  header: html.h2(title),
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
      ),

      // Modal with Custom Header
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Custom Header Modal'),
      html.p('Modal with custom header content instead of default title.'),
      Modal(
        {
          size,
          dismissable,
          showCloseButton,
          overlayEffect,
          position,
          onClose: () => console.log('Custom header modal closed'),
        },
        (open, _close) =>
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
                  body: html.div(
                    html.p('This modal has a custom header with an icon.'),
                    html.p('The header is completely customizable.')
                  ),
                }),
            },
            'Open Custom Header Modal'
          )
      ),

      // Modal with Footer Actions
      html.h3(
        attr.class('text-xl font-semibold pt-4'),
        'Modal with Footer Actions'
      ),
      html.p('Modal with custom footer containing action buttons.'),
      Modal(
        {
          size,
          dismissable,
          showCloseButton,
          overlayEffect,
          position,
          onClose: () => console.log('Footer actions modal closed'),
        },
        (open, close) =>
          Button(
            {
              variant: 'filled',
              color: 'primary',
              onClick: () =>
                open({
                  header: html.h2('Save Changes'),
                  body: html.div(
                    html.p('You have unsaved changes.'),
                    html.p(
                      'Would you like to save your changes before closing?'
                    )
                  ),
                  footer: Fragment(
                    attr.class('justify-between'),
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
      ),

      // Confirmation Modal Example
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Confirmation Modal'),
      html.p('Pre-built confirmation dialog with confirm/cancel actions.'),
      ConfirmModal(
        {
          confirmText: 'Delete',
          cancelText: 'Cancel',
          size,
          dismissable,
          overlayEffect,
          position,
          onConfirm: () => console.log('Item deleted'),
          onCancel: () => console.log('Delete cancelled'),
          onClose: () => console.log('Confirmation modal closed'),
        },
        (open, _close) =>
          Button(
            {
              variant: 'filled',
              color: 'danger',
              onClick: () =>
                open(
                  'Are you sure you want to delete this item? This action cannot be undone.'
                ),
            },
            'Delete Item'
          )
      ),

      // Non-dismissable Modal Example
      html.h3(
        attr.class('text-xl font-semibold pt-4'),
        'Non-dismissable Modal'
      ),
      html.p(
        'Modal that cannot be closed by clicking outside or pressing escape.'
      ),
      Modal(
        {
          size: 'sm',
          dismissable: false,
          showCloseButton: false,
          position,
          overlayEffect,
        },
        (open, close) =>
          Button(
            {
              variant: 'filled',
              color: 'warning',
              onClick: () => {
                open({
                  header: html.h2('Processing...'),
                  body: html.div(
                    attr.class('text-center py-4'),
                    html.p('Please wait while we process your request...'),
                    html.div(
                      attr.class('mt-4'),
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
    ),
  })
}

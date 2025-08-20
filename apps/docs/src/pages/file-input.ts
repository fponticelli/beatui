import { html, attr, prop } from '@tempots/dom'
import {
  FileInput,
  FileControl,
  useForm,
  Button,
  Card,
  TextControl,
  ScrollablePanel,
  Switch,
  Group,
  InputWrapper,
  Stack,
} from '@tempots/beatui'
import { z } from 'zod/v4'
import { ControlsHeader } from '../elements/controls-header'

export function FileInputPage() {
  // Values
  const basicFiles = prop<File[]>([])
  const imageFiles = prop<File[]>([])

  // Controls
  const allowMultiple = prop(true)
  const disabled = prop(false)

  // Form integration example
  const { controller } = useForm({
    schema: z.object({
      name: z.string().min(1, 'Name is required'),
      avatar: z
        .array(z.instanceof(File))
        .max(1, 'Only one avatar file allowed'),
    }),
    initialValue: {
      name: '',
      avatar: [],
    },
  })

  return ScrollablePanel({
    header: ControlsHeader(
      Group(
        InputWrapper({
          label: 'Allow Multiple',
          content: Switch({
            value: allowMultiple,
            onChange: value => (allowMultiple.value = value),
          }),
        }),
        InputWrapper({
          label: 'Disabled',
          content: Switch({
            value: disabled,
            onChange: value => (disabled.value = value),
          }),
        })
      )
    ),
    body: Stack(
      attr.class('bu-gap-4 bu-p-4'),
      // Interactive Example
      Card(
        {},
        html.div(
          attr.class('bu-space-y-4'),
          html.h2(
            attr.class('bu-text-xl bu-font-semibold'),
            'Interactive Example'
          ),
          html.p(
            attr.class('bu-text-gray-600'),
            'Try the file input with different settings using the controls above.'
          ),

          FileInput({
            value: basicFiles,
            allowMultiple,
            disabled,
            onChange: files => {
              console.log('Files changed:', files)
              basicFiles.set(files)
            },
          })
        )
      ),

      // Image Files Only
      Card(
        {},
        html.div(
          attr.class('bu-space-y-4'),
          html.h2(
            attr.class('bu-text-xl bu-font-semibold'),
            'Image Files Only'
          ),
          html.p(
            attr.class('bu-text-gray-600'),
            'File input that only accepts image files with a 2MB size limit per file and maximum of 3 files.'
          ),

          FileInput({
            value: imageFiles,
            allowMultiple: true,
            accept: 'image/*',
            maxFileSize: 2 * 1024 * 1024, // 2MB
            maxFiles: 3,
            onChange: files => {
              console.log('Image files changed:', files)
              imageFiles.set(files)
            },
          })
        )
      ),

      // Form Integration
      Card(
        {},
        html.div(
          attr.class('bu-space-y-4'),
          html.h2(
            attr.class('bu-text-xl bu-font-semibold'),
            'Form Integration'
          ),
          html.p(
            attr.class('bu-text-gray-600'),
            'File controls integrated with form validation using FileControl component.'
          ),

          html.form(
            attr.class('bu-space-y-4'),
            TextControl({
              controller: controller.field('name'),
              placeholder: 'Enter your name',
              label: 'Name',
            }),
            FileControl({
              mode: 'compact',
              controller: controller.field('avatar'),
              accept: 'image/*',
              maxFileSize: 1024 * 1024, // 1MB
              label: 'Avatars',
            }),
            html.br(),
            Button(
              {
                type: 'button',
                variant: 'filled',
                color: 'primary',
                onClick: () => {
                  console.log('Form submitted:', controller.value)
                  alert('Form submitted! Check console for details.')
                },
              },
              'Submit Form'
            )
          )
        )
      )
    ),
  })
}

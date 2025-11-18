import { html, attr, prop } from '@tempots/dom'
import {
  useForm,
  Button,
  Card,
  ScrollablePanel,
  Switch,
  Group,
  InputWrapper,
  Stack,
  FilesInput,
  Control,
  TextInput,
  FileInput,
} from '@tempots/beatui'
import { z } from 'zod'
import { ControlsHeader } from '../elements/controls-header'

export default function FileInputPage() {
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
      avatar: z.instanceof(File).optional(),
      files: z.array(z.instanceof(File)),
    }),
    initialValue: {
      name: '',
      avatar: undefined,
      files: [],
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
      attr.class('gap-4 p-4'),
      // Interactive Example
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Interactive Example'),
          html.p(
            attr.class('text-gray-600-600'),
            'Try the file input with different settings using the controls above.'
          ),

          FilesInput({
            value: basicFiles,
            disabled,
            onChange: files => {
              basicFiles.set(files)
            },
          })
        )
      ),

      // Image Files Only
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Image Files Only'),
          html.p(
            attr.class('text-gray-600-600'),
            'File input that only accepts image files with a 2MB size limit per file and maximum of 3 files.'
          ),

          FilesInput({
            value: imageFiles,
            accept: 'image/*',
            maxFileSize: 2 * 1024 * 1024, // 2MB
            maxFiles: 3,
            onChange: files => {
              imageFiles.set(files)
            },
          })
        )
      ),

      // Compact Mode
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Compact Mode'),
          html.p(
            attr.class('text-gray-600-600'),
            'Compact mode renders the file list inside the drop area and reduces space when no files are selected.'
          ),

          FilesInput({
            value: imageFiles,
            accept: 'image/*',
            maxFileSize: 2 * 1024 * 1024, // 2MB
            maxFiles: 5,
            mode: 'compact',
            onChange: files => {
              imageFiles.set(files)
            },
          })
        )
      ),

      // Form Integration
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Form Integration'),
          html.p(
            attr.class('text-gray-600-600'),
            'File controls integrated with form validation using FileControl component.'
          ),

          html.form(
            attr.class('space-y-4'),
            Control(TextInput, {
              controller: controller.field('name'),
              placeholder: 'Enter your name',
              label: 'Name',
            }),
            Control(FileInput, {
              mode: 'input',
              controller: controller.field('avatar'),
              accept: 'image/*',
              maxFileSize: 1024 * 1024, // 1MB
              label: 'Avatars',
            }),
            Control(FilesInput, {
              mode: 'input',
              controller: controller.field('files'),
              accept: 'image/*',
              maxFileSize: 1024 * 1024, // 1MB
              label: 'Other Files',
            }),
            html.br(),
            Button(
              {
                type: 'button',
                variant: 'filled',
                color: 'primary',
                onClick: () => {
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

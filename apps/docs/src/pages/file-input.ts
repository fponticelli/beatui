import { html, attr, prop } from '@tempots/dom'
import {
  FileInput,
  FileControl,
  useForm,
  Button,
  Card,
  TextControl,
  Label,
  ScrollablePanel,
  Stack,
  Switch,
} from '@tempots/beatui'
import { z } from 'zod/v4'
import { ControlsHeader } from '../elements/controls-header'

export function FileInputPage() {
  // Basic file input example
  const basicFiles = prop<File[]>([])

  // Image files example
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
    defaultValue: {
      name: '',
      avatar: [],
    },
  })

  const formatFileList = (files: File[]) => {
    if (files.length === 0) return 'No files selected'
    return files
      .map(f => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`)
      .join(', ')
  }

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Allow Multiple'),
        Switch({
          value: allowMultiple,
          onChange: value => (allowMultiple.value = value),
        }),

        Label('Disabled'),
        Switch({
          value: disabled,
          onChange: value => (disabled.value = value),
        })
      )
    ),
    body: html.div(
      attr.class('bu-space-y-8 bu-p-6'),

      // Introduction
      html.div(
        html.h1(attr.class('bu-text-3xl bu-font-bold bu-mb-4'), 'File Input'),
        html.p(
          attr.class('bu-text-lg bu-text-gray-600 bu-mb-6'),
          'File input components for uploading single or multiple files with drag & drop support, file type filtering, and size limits.'
        )
      ),

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
              basicFiles.value = files
              console.log('Files changed:', files)
            },
          }),

          html.div(
            attr.class('bu-text-sm bu-text-gray-500 bu-mt-2'),
            html.strong('Selected: '),
            basicFiles.map(formatFileList)
          )
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
              imageFiles.value = files
              console.log('Image files changed:', files)
            },
          }),

          html.div(
            attr.class('bu-text-sm bu-text-gray-500 bu-mt-2'),
            html.strong('Selected: '),
            imageFiles.map(formatFileList)
          )
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
              controller: controller.field('avatar'),
              accept: 'image/*',
              allowMultiple: false,
              maxFileSize: 1024 * 1024, // 1MB
              label: 'Avatar (Single Image)',
            }),

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

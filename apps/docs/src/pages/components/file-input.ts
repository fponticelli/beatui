import { FileInput, FilesInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FileInput',
  category: 'Specialized Inputs',
  component: 'FileInput',
  description: 'A drag-and-drop file input with click-to-select support, file type filtering, size limits, and multiple display modes.',
  icon: 'lucide:upload',
  order: 18,
}

export default function FileInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('FileInput', signals => {
      const value = prop<File | undefined>(undefined)
      return html.div(
        attr.class('w-80'),
        FileInput({
          size: signals.size,
          color: signals.color,
          disabled: signals.disabled,
          value,
          onChange: (f: File | undefined) => value.set(f),
        } as never)
      )
    }),
    sections: [
      Section(
        'Default Mode',
        () => {
          const value = prop<File | undefined>(undefined)
          return html.div(
            attr.class('flex flex-col gap-2 w-80'),
            FileInput({
              value,
              onChange: (f: File | undefined) => value.set(f),
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              value.map(f => f ? `Selected: ${f.name}` : 'No file selected')
            )
          )
        },
        'The default mode shows a full drop zone with a file list below when a file is selected.'
      ),
      Section(
        'Compact Mode',
        () => {
          const value = prop<File | undefined>(undefined)
          return html.div(
            attr.class('w-80'),
            FileInput({
              value,
              mode: 'compact',
              onChange: (f: File | undefined) => value.set(f),
            })
          )
        },
        'Compact mode shows a smaller drop zone with inline file previews.'
      ),
      Section(
        'Input Mode',
        () => {
          const value = prop<File | undefined>(undefined)
          return html.div(
            attr.class('w-80'),
            FileInput({
              value,
              mode: 'input',
              onChange: (f: File | undefined) => value.set(f),
            })
          )
        },
        'Input mode renders as a compact inline field that fits naturally in forms.'
      ),
      Section(
        'File Type Filtering',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 w-80'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'accept: "image/*"'),
              FileInput({
                value: prop<File | undefined>(undefined),
                accept: 'image/*',
                onChange: () => {},
              })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'accept: ".pdf,.docx"'),
              FileInput({
                value: prop<File | undefined>(undefined),
                accept: '.pdf,.docx',
                onChange: () => {},
              })
            )
          ),
        'Use the accept prop with MIME types or file extensions to restrict accepted file types.'
      ),
      Section(
        'Max File Size',
        () =>
          html.div(
            attr.class('w-80'),
            FileInput({
              value: prop<File | undefined>(undefined),
              maxFileSize: 1 * 1024 * 1024,
              onChange: () => {},
            })
          ),
        'Files exceeding the maxFileSize limit (in bytes) are rejected automatically.'
      ),
      Section(
        'Multiple Files (FilesInput)',
        () => {
          const files = prop<File[]>([])
          return html.div(
            attr.class('flex flex-col gap-2 w-80'),
            FilesInput({
              value: files,
              maxFiles: 5,
              accept: 'image/*',
              onChange: (f: File[]) => files.set(f),
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              files.map(f => f.length > 0 ? `${f.length} file(s) selected` : 'No files selected')
            )
          )
        },
        'FilesInput supports multiple file uploads with a configurable maxFiles limit.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 w-80'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Disabled'),
              FileInput({
                value: prop<File | undefined>(undefined),
                disabled: true,
                onChange: () => {},
              })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Error'),
              FileInput({
                value: prop<File | undefined>(undefined),
                hasError: true,
                onChange: () => {},
              })
            )
          ),
        'FileInput supports disabled and error states.'
      ),
    ],
  })
}

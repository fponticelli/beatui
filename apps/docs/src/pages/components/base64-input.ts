import { Base64Input } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Base64Input',
  category: 'Specialized Inputs',
  component: 'Base64Input',
  description:
    'A single-file upload input that stores the file as a base64 string. Supports drag-and-drop, file type filtering, and size limits.',
  icon: 'lucide:file-up',
  order: 20,
}

export default function Base64InputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Base64Input', signals => {
      const value = prop<string | undefined>(undefined)
      return html.div(
        attr.class('max-w-md'),
        Base64Input({
          ...signals,
          value,
          onChange: (v: string | undefined) => value.set(v),
        } as never)
      )
    }),
    sections: [
      Section(
        'File Upload',
        () => {
          const value = prop<string | undefined>(undefined)
          return html.div(
            attr.class('flex flex-col gap-2 max-w-md'),
            Base64Input({
              value,
              onChange: (v: string | undefined) => value.set(v),
            }),
            html.p(
              attr.class('text-xs text-gray-500'),
              value.map(v =>
                v ? `Uploaded: ${Math.round(v.length * 0.75)} bytes` : 'Drop a file or click to browse.'
              )
            )
          )
        },
        'Base64Input wraps Base64sInput with maxFiles=1, providing a single-file upload experience. The value is a raw base64 string (no data: prefix).'
      ),
      Section(
        'Accept Filter',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 max-w-md'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Images only'),
              Base64Input({
                value: prop<string | undefined>(undefined),
                onChange: () => {},
                accept: 'image/*',
              })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'PDF only'),
              Base64Input({
                value: prop<string | undefined>(undefined),
                onChange: () => {},
                accept: '.pdf',
              })
            )
          ),
        'Use the accept prop to restrict file types. Accepts comma-separated MIME types or file extensions.'
      ),
      Section(
        'Max File Size',
        () =>
          html.div(
            attr.class('max-w-md'),
            Base64Input({
              value: prop<string | undefined>(undefined),
              onChange: () => {},
              maxFileSize: 1024 * 100, // 100 KB
            }),
            html.p(
              attr.class('text-xs text-gray-500 mt-1'),
              'Limited to 100 KB.'
            )
          ),
        'Set maxFileSize (in bytes) to reject files that exceed the limit.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 max-w-md'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Disabled'),
              Base64Input({
                value: prop<string | undefined>(undefined),
                onChange: () => {},
                disabled: true,
              })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Error'),
              Base64Input({
                value: prop<string | undefined>(undefined),
                onChange: () => {},
                hasError: true,
              })
            )
          ),
        'Supports disabled and error states.'
      ),
    ],
  })
}

import { PageDropZone, Button, Icon } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'PageDropZone',
  category: 'Tables & Media',
  component: 'PageDropZone',
  description:
    'A full-page drag-and-drop file zone that listens for file drag events anywhere on the document, showing an overlay while dragging and providing programmatic file picker access.',
  icon: 'lucide:file-up',
  order: 8,
}

export default function PageDropZonePage() {
  return ComponentPage(meta, {
    playground: manualPlayground('PageDropZone', _signals => {
      const lastAction = prop<string | null>(null)

      return html.div(
        attr.class('w-full'),
        PageDropZone({
          accept: '*/*',
          onChange: (files, via) => {
            lastAction.set(`${files.length} file(s) via ${via}: ${files.map(f => f.name).join(', ')}`)
          },
          onDragContent: () =>
            html.div(
              attr.class('fixed inset-0 z-50 flex items-center justify-center bg-sky-500/20 backdrop-blur-sm pointer-events-none'),
              html.div(
                attr.class('bg-white dark:bg-gray-900 border-2 border-dashed border-sky-400 rounded-2xl p-12 flex flex-col items-center gap-4 shadow-2xl'),
                Icon({ icon: 'lucide:file-down', size: 'xl' }),
                html.p(attr.class('text-lg font-semibold text-sky-600 dark:text-sky-400'), 'Drop files here')
              )
            ),
          content: ({ isDragging, files, selectFiles }) =>
            html.div(
              attr.class('space-y-4'),
              html.div(
                attr.class('border-2 border-dashed rounded-xl p-8 text-center transition-colors'),
                attr.class(isDragging.map(d =>
                  d
                    ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                )),
                Icon({ icon: 'lucide:upload-cloud', size: 'xl' }),
                html.p(
                  attr.class('mt-3 text-sm font-medium text-gray-700 dark:text-gray-300'),
                  isDragging.map(d => (d ? 'Release to drop files' : 'Drag files anywhere on this page'))
                ),
                html.p(attr.class('mt-1 text-xs text-gray-400'), 'or'),
                html.div(
                  attr.class('mt-3'),
                  Button(
                    { variant: 'outline', onClick: selectFiles },
                    Icon({ icon: 'lucide:folder-open', size: 'sm' }),
                    'Browse files'
                  )
                )
              ),
              files.map(fileList =>
                fileList.length > 0
                  ? html.div(
                      attr.class('space-y-1'),
                      html.p(attr.class('text-xs font-medium text-gray-500 dark:text-gray-400'), `${fileList.length} file(s) selected:`),
                      ...fileList.map(f =>
                        html.div(
                          attr.class('flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded px-3 py-1.5'),
                          Icon({ icon: 'lucide:file', size: 'sm' }),
                          html.span(attr.class('flex-1 truncate'), f.name),
                          html.span(attr.class('text-xs text-gray-400 shrink-0'), `${(f.size / 1024).toFixed(1)} KB`)
                        )
                      )
                    )
                  : html.div()
              )
            ),
        }),
        lastAction.map(action =>
          action != null
            ? html.div(
                attr.class('mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 font-mono'),
                action
              )
            : html.div()
        )
      )
    }),
    sections: [
      Section(
        'Basic Drop Zone',
        () => {
          const files = prop<File[]>([])
          return html.div(
            PageDropZone({
              accept: '*/*',
              onChange: (selected) => files.set(selected),
              content: ({ selectFiles }) =>
                html.div(
                  attr.class('border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center'),
                  html.p(attr.class('text-sm text-gray-600 dark:text-gray-400 mb-3'), 'Drag and drop files or click to browse'),
                  Button({ variant: 'outline', onClick: selectFiles }, 'Select Files')
                ),
            }),
            files.map(list =>
              list.length > 0
                ? html.p(attr.class('mt-2 text-xs text-gray-500'), `Selected: ${list.map(f => f.name).join(', ')}`)
                : html.div()
            )
          )
        },
        'Minimal drop zone with a browse button. File drag events are captured at the document level.'
      ),
      Section(
        'MIME Type Filtering',
        () => {
          const info = prop<string>('No files selected yet.')
          return html.div(
            PageDropZone({
              accept: 'image/*',
              onChange: (files) => info.set(`Accepted ${files.length} image(s): ${files.map(f => f.name).join(', ')}`),
              onInvalidSelection: (files) => info.set(`Rejected ${files.length} non-image file(s)`),
              content: ({ selectFiles }) =>
                html.div(
                  attr.class('border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center'),
                  Icon({ icon: 'lucide:image', size: 'lg' }),
                  html.p(attr.class('mt-2 text-sm text-gray-600 dark:text-gray-400'), 'Images only (image/*)'),
                  html.div(attr.class('mt-3'), Button({ variant: 'outline', onClick: selectFiles }, 'Browse Images'))
                ),
            }),
            html.p(attr.class('mt-2 text-xs text-gray-500 dark:text-gray-400'), info)
          )
        },
        'The accept prop filters files by MIME type. Non-matching files trigger onInvalidSelection instead of onChange.'
      ),
      Section(
        'Drag Overlay',
        () =>
          html.div(
            attr.class('text-sm text-gray-600 dark:text-gray-400 space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg'),
            html.p(
              attr.class('font-medium text-gray-700 dark:text-gray-300'),
              'Drag Overlay Behavior'
            ),
            html.p('The onDragContent prop renders an overlay only while files are being dragged over the page.'),
            html.p('Use it for full-screen drop indicators that appear on drag and disappear on drop or drag-leave.'),
            html.div(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded p-3 mt-2'),
              html.div('onDragContent: () =>'),
              html.div(attr.class('pl-4'), 'html.div('),
              html.div(attr.class('pl-8'), "attr.class('fixed inset-0 bg-primary/20'),"),
              html.div(attr.class('pl-8'), "'Drop files here'"),
              html.div(attr.class('pl-4'), ')')
            )
          ),
        'The drag overlay is portal-rendered and appears whenever files are dragged anywhere over the document.'
      ),
    ],
  })
}

import {
  html,
  attr,
  prop,
  style,
  ForEach,
  NotEmpty,
  Portal,
} from '@tempots/dom'
import {
  ScrollablePanel,
  PageDropZone,
  Stack,
  Group,
  Icon,
  Card,
  Switch,
  InputWrapper,
  Button,
} from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

export default function PageDropZonePage() {
  const enabled = prop(true)
  const droppedFiles = prop<File[]>([])

  return ScrollablePanel({
    header: ControlsHeader(
      Group(
        attr.class('gap-4'),
        InputWrapper({
          label: 'Enable Drop Zone',
          layout: 'horizontal',
          content: Switch({
            value: enabled,
            onChange: v => enabled.set(v),
          }),
        })
      )
    ),
    body: Stack(
      attr.class('p-8 gap-8 items-center justify-center'),
      // Instructions
      Card(
        {},
        attr.class('max-w-2xl p-6'),
        html.h2(
          attr.class('text-2xl font-semibold mb-4'),
          'Page-Level Drop Zone'
        ),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 mb-4'),
          'This component detects when you drag files from your filesystem anywhere over the page. Try dragging a file from your computer onto this page!'
        ),
        html.ul(
          attr.class(
            'list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400'
          ),
          html.li('Drag files from your filesystem over the page'),
          html.li('An overlay will appear when files are detected'),
          html.li('Drop the files to see them listed below'),
          html.li('Toggle the switch above to enable/disable the drop zone')
        )
      ),

      // Dropped files display
      NotEmpty(droppedFiles, files =>
        Card(
          {},
          attr.class('max-w-2xl p-6 w-full'),
          html.div(
            attr.class('flex flex-row items-center gap-2 justify-between mb-4'),
            html.h3(attr.class('text-xl font-semibold'), 'Dropped Files'),

            html.div(
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  size: 'sm',
                  onClick: () => {
                    droppedFiles.set([])
                  },
                },
                'Clear Files'
              )
            )
          ),
          html.ul(
            attr.class('space-y-2'),
            ForEach(files, file =>
              html.li(
                attr.class(
                  'flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded'
                ),
                Icon({ icon: 'mdi:file-outline', size: 'md' }),
                html.div(
                  attr.class('flex-1'),
                  html.div(attr.class('font-medium'), file.$.name),
                  html.div(
                    attr.class('text-sm text-gray-500 dark:text-gray-400'),
                    file.$.size.map(v => `${(v / 1024).toFixed(2)} KB`),
                    ' - ',
                    file.$.type.map(v => v ?? 'unknown type')
                  )
                )
              )
            )
          )
        )
      ),

      // The PageDropZone component
      PageDropZone({
        disabled: enabled.map(v => !v),
        onChange: files => {
          console.log('Files dropped:', files)
          droppedFiles.set(files)
        },
        onDragContent: () =>
          Portal(
            'body',
            html.div(
              attr.class(
                'fixed inset-0 bg-black/50 flex items-center justify-center z-50'
              ),
              style.pointerEvents('none'),
              html.div(
                attr.class(
                  'bg-white dark:bg-gray-800 rounded-lg p-12 shadow-2xl border-4 border-dashed border-primary-500'
                ),
                Stack(
                  attr.class('items-center gap-4'),
                  Icon({
                    icon: 'mdi:cloud-upload-outline',
                    size: 'xl',
                    color: 'primary',
                  }),

                  html.h2(
                    attr.class('text-3xl font-bold text-primary-600'),
                    'Drop Files Here'
                  ),
                  html.p(
                    attr.class('text-gray-600 dark:text-gray-400'),
                    'Release to upload your files'
                  )
                )
              )
            )
          ),
      })
    ),
  })
}

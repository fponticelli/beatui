import { ControlsHeader } from '../elements/controls-header'
import {
  ScrollablePanel,
  PDFJSPreview,
  InputWrapper,
  SegmentedInput,
  NativePdfPreview,
  Switch,
  NumberInput,
  TextInput,
  NativeSelect,
  Option,
  SelectOption,
} from '@tempots/beatui'
import { html, attr, prop, OneOfValue, Value, Fragment } from '@tempots/dom'

export default function PDFPreviewPage() {
  // Sample PDF URL (Mozilla's PDF.js test file)
  const pdfUrl = prop(
    'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
  )
  const pdfEngine = prop<'pdfjs' | 'native'>('pdfjs')
  const toolbar = prop(true)
  const page = prop(1)
  const view = prop<'FitV' | 'FitH' | 'Fit'>('Fit')
  const pagemode = prop<
    | 'none'
    | 'thumbs'
    | 'bookmarks'
    | 'attachments'
    | 'full-screen'
    | 'optionalcontent'
  >('none')
  const scrollbar = prop(true)
  const search = prop('')
  const allowfullscreen = prop(true)

  const zoom = prop<'auto' | 'page-fit' | 'page-width' | number>('page-fit')

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        content: SegmentedInput({
          options: {
            pdfjs: 'PDF.js',
            native: 'Native',
          },
          value: pdfEngine,
          onChange: pdfEngine.set,
        }),
      }),
      InputWrapper({
        label: 'Page',
        content: NumberInput({
          value: page,
          onChange: page.set,
          min: 1,
          step: 1,
        }),
      }),
      OneOfValue(pdfEngine, {
        pdfjs: () =>
          Fragment(
            InputWrapper({
              label: 'Zoom',
              content: NativeSelect({
                options: [
                  Option.value('auto', 'Auto'),
                  Option.value('page-fit', 'Page Fit'),
                  Option.value('page-width', 'Page Width'),
                  Option.value(100, '100%'),
                ] as SelectOption<
                  'auto' | 'page-fit' | 'page-width' | number
                >[],
                value: zoom,
                onChange: zoom.set,
              }),
            })
          ),
        native: () =>
          Fragment(
            InputWrapper({
              label: 'Toolbar',
              content: Switch({
                value: toolbar,
                onChange: toolbar.set,
              }),
            }),
            InputWrapper({
              label: 'View',
              content: NativeSelect({
                options: [
                  Option.value('FitV', 'FitV'),
                  Option.value('FitH', 'FitH'),
                  Option.value('Fit', 'Fit'),
                ] as SelectOption<'FitV' | 'FitH' | 'Fit'>[],
                value: view,
                onChange: view.set,
              }),
            }),
            InputWrapper({
              label: 'Scrollbar',
              content: Switch({
                value: scrollbar,
                onChange: scrollbar.set,
              }),
            })
          ),
      }),
      InputWrapper({
        label: 'Page Mode',
        content: NativeSelect({
          options: [
            Option.value('none', 'None'),
            Option.value('thumbs', 'Thumbs'),
            Option.value('bookmarks', 'Bookmarks'),
            Option.value('attachments', 'Attachments'),
            Option.value('full-screen', 'Full Screen'),
            Option.value('optionalcontent', 'Optional Content'),
          ] as SelectOption<
            | 'none'
            | 'thumbs'
            | 'bookmarks'
            | 'attachments'
            | 'full-screen'
            | 'optionalcontent'
          >[],
          value: pagemode,
          onChange: pagemode.set,
        }),
      }),
      InputWrapper({
        label: 'Search',
        content: TextInput({
          value: search,
          onChange: search.set,
        }),
      }),
      InputWrapper({
        label: 'Allow Fullscreen',
        content: Switch({
          value: allowfullscreen,
          onChange: allowfullscreen.set,
        }),
      })
    ),
    body: html.div(
      attr.class('h-full overflow-hidden bg-gray-300'),
      OneOfValue(pdfEngine, {
        pdfjs: () =>
          PDFJSPreview({
            content: pdfUrl,
            page,
            pagemode: pagemode as Value<
              'none' | 'thumbs' | 'bookmarks' | 'attachments'
            >,
            search,
            allowfullscreen,
            zoom,
          }),
        native: () =>
          NativePdfPreview({
            content: pdfUrl,
            page,
            toolbar,
            view,
            pagemode,
            scrollbar,
            search,
            allowfullscreen,
          }),
      })
    ),
  })
}

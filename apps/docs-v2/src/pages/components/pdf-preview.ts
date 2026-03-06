import { NativePdfPreview, PDFJSPreview } from '@tempots/beatui'
import { html, attr, on, prop, style } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NativePdfPreview',
  category: 'Tables & Media',
  component: 'NativePdfPreview',
  description:
    'Renders a PDF using the browser native viewer via an iframe. Accepts a URL string, Blob, ArrayBuffer, or Uint8Array and manages blob URL lifecycle automatically.',
  icon: 'lucide:file-text',
  order: 10,
}

// A public-domain PDF for demos
const SAMPLE_PDF_URL = 'https://www.w3.org/WAI/WCAG21/wcag21.pdf'

export default function PdfPreviewPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NativePdfPreview', signals => {
      const url = prop<string>(SAMPLE_PDF_URL)

      return html.div(
        attr.class('w-full space-y-3'),
        html.div(
          attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
          style.height('480px'),
          NativePdfPreview({
            content: url,
            toolbar: signals.toolbar as never,
            page: signals.page as never,
            zoom: signals.zoom as never,
          })
        ),
        html.p(
          attr.class('text-xs text-gray-400 text-center'),
          'Native PDF viewer — appearance depends on the browser.'
        )
      )
    }),
    sections: [
      Section(
        'URL String',
        () =>
          html.div(
            attr.class('space-y-2'),
            html.div(
              attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
              style.height('400px'),
              NativePdfPreview({
                content: SAMPLE_PDF_URL,
                toolbar: true,
              })
            ),
            html.p(
              attr.class('text-xs text-gray-400'),
              'Pass a URL string. The component fetches the PDF and converts it to a blob URL to ensure correct content-type for inline rendering.'
            )
          ),
        'The simplest usage: pass a URL string. The component handles fetching and blob URL management.'
      ),
      Section(
        'Without Toolbar',
        () =>
          html.div(
            attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
            style.height('360px'),
            NativePdfPreview({
              content: SAMPLE_PDF_URL,
              toolbar: false,
            })
          ),
        'Set toolbar: false to hide the browser toolbar (Chrome only). Useful for read-only document displays.'
      ),
      Section(
        'Jump to Page',
        () => {
          const pageNum = prop(1)
          return html.div(
            attr.class('space-y-3'),
            html.div(
              attr.class('flex items-center gap-3'),
              html.label(attr.class('text-sm text-gray-600 dark:text-gray-400'), 'Jump to page:'),
              html.input(
                attr.type('number'),
                attr.min('1'),
                attr.value('1'),
                attr.class('w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'),
                on.input((e: Event) => {
                  const v = parseInt((e.target as HTMLInputElement).value, 10)
                  if (!isNaN(v) && v > 0) pageNum.set(v)
                })
              )
            ),
            html.div(
              attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
              style.height('360px'),
              NativePdfPreview({
                content: SAMPLE_PDF_URL,
                page: pageNum,
              })
            )
          )
        },
        'The page option navigates to a specific page on load (Chrome, Firefox, Safari).'
      ),
      Section(
        'PDFJSPreview',
        () =>
          html.div(
            attr.class('space-y-3'),
            html.div(
              attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
              style.height('420px'),
              PDFJSPreview({
                content: SAMPLE_PDF_URL,
                zoom: 'page-width',
              })
            ),
            html.p(
              attr.class('text-xs text-gray-400'),
              'PDFJSPreview uses the Mozilla PDF.js hosted viewer for consistent cross-browser rendering.'
            )
          ),
        'PDFJSPreview embeds the Mozilla PDF.js viewer for consistent rendering across all browsers. It accepts the same content types and provides additional viewer configuration options.'
      ),
      Section(
        'PDFJSPreview Options',
        () =>
          html.div(
            attr.class('space-y-3'),
            html.div(
              attr.class('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden'),
              style.height('420px'),
              PDFJSPreview({
                content: SAMPLE_PDF_URL,
                zoom: 'page-fit',
                sidebarViewOnLoad: 1,
                scrollModeOnLoad: 0,
                spreadModeOnLoad: 0,
              })
            ),
            html.div(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-3 space-y-1'),
              html.div(attr.class('text-gray-700 dark:text-gray-300'), "zoom: 'page-fit'"),
              html.div(attr.class('text-gray-700 dark:text-gray-300'), 'sidebarViewOnLoad: 1  // show thumbnails'),
              html.div(attr.class('text-gray-700 dark:text-gray-300'), 'scrollModeOnLoad: 0  // vertical scroll'),
              html.div(attr.class('text-gray-700 dark:text-gray-300'), 'spreadModeOnLoad: 0  // no spread')
            )
          ),
        'PDFJSPreview exposes extensive viewer options including zoom mode, sidebar state, scroll mode, and spread mode.'
      ),
      Section(
        'Blob / ArrayBuffer Input',
        () =>
          html.div(
            attr.class('space-y-3'),
            html.div(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-1.5 text-gray-700 dark:text-gray-300'),
              html.div('// From fetch response'),
              html.div('const blob = await response.blob()'),
              html.div('NativePdfPreview({ content: blob })'),
              html.div(),
              html.div('// From ArrayBuffer'),
              html.div('const buffer = await response.arrayBuffer()'),
              html.div('NativePdfPreview({ content: buffer })'),
              html.div(),
              html.div('// From Uint8Array'),
              html.div('NativePdfPreview({ content: uint8Array })')
            ),
            html.p(
              attr.class('text-xs text-gray-500 dark:text-gray-400'),
              'All binary formats are automatically converted to blob URLs with the correct content-type. Blob URLs are revoked on disposal to prevent memory leaks.'
            )
          ),
        'Both NativePdfPreview and PDFJSPreview accept Blob, ArrayBuffer, Uint8Array, or URL string. Binary inputs are converted to blob URLs automatically.'
      ),
    ],
  })
}

import {
  html,
  attr,
  Value,
  WithElement,
  Use,
  computedOf,
  OnDispose,
  Fragment,
} from '@tempots/dom'
import { Query } from '@tempots/ui'
import { loadPDFJSCore } from '../../pdfjs/lazy-loader'
import { BeatUII18n } from '../../beatui-i18n'
import { Icon } from '../data/icon'
import type {
  PDFDocumentProxy,
  TypedArray,
} from 'pdfjs-dist/types/src/display/api'

// PDF.js library interface (loaded from CDN)
interface PDFJSLib {
  getDocument(src: string | TypedArray | ArrayBuffer): {
    promise: Promise<PDFDocumentProxy>
  }
  GlobalWorkerOptions?: {
    workerSrc?: string
  }
}

export interface PdfPageViewerOptions {
  /** PDF source: URL string, Uint8Array, or ArrayBuffer */
  source: Value<string | Uint8Array | ArrayBuffer>

  /** Page number to display (1-based, default: 1) */
  page?: Value<number>

  /** Custom CSS class for container */
  class?: Value<string | null>

  /** Scale factor for rendering (default: 2 for good quality) */
  scale?: Value<number>
}

interface PdfRenderRequest {
  source: string | Uint8Array | ArrayBuffer
  page: number
  scale: number
}

interface PdfRenderResult {
  width: number
  height: number
  render: (canvas: HTMLCanvasElement) => Promise<void>
}

/**
 * PdfPageViewer component that displays a single PDF page.
 * Lazy loads pdf.js library only when mounted.
 * Handles loading and error states with appropriate UI feedback.
 */
export function PdfPageViewer({
  source,
  page = 1,
  class: customClass = null,
  scale = 2,
}: PdfPageViewerOptions) {
  const loadPDFLib = loadPDFJSCore()
  let lastSource = Value.get(source)
  let pdfDoc: PDFDocumentProxy | null = null

  return Use(BeatUII18n, t => {
    return html.div(
      attr.class('bc-pdf-page-viewer'),
      attr.class(customClass),

      // Clean up PDF document when component unmounts
      OnDispose(() => {
        if (pdfDoc != null) {
          pdfDoc.destroy()
          pdfDoc = null
        }
      }),

      Query<PdfRenderRequest, PdfRenderResult, string>({
        request: computedOf(
          source,
          page,
          scale
        )((src, pg, sc) => ({
          source: src,
          page: pg,
          scale: sc,
        })),
        load: async ({ request }) => {
          // Load PDF.js library
          const pdfjsLib = (await loadPDFLib) as PDFJSLib

          // Load or reuse PDF document
          if (pdfDoc == null || lastSource !== request.source) {
            // Destroy old document if it exists
            if (pdfDoc != null) {
              pdfDoc.destroy()
              pdfDoc = null
            }

            lastSource = request.source

            // Load new PDF document
            const loadingTask = pdfjsLib.getDocument(request.source)
            pdfDoc = await loadingTask.promise
          }

          // Validate page number
          const pageNum =
            request.page < 1 || request.page > pdfDoc.numPages
              ? 1
              : request.page

          // Get the page
          const pdfPage = await pdfDoc.getPage(pageNum)
          const viewport = pdfPage.getViewport({ scale: request.scale })

          return {
            width: viewport.width,
            height: viewport.height,
            render: async (canvas: HTMLCanvasElement) => {
              canvas.width = viewport.width
              canvas.height = viewport.height
              const context = canvas.getContext('2d')
              if (!context) {
                throw new Error('Failed to get canvas context')
              }

              // Render the page
              const renderTask = pdfPage.render({
                canvas,
                viewport,
              })

              await renderTask.promise
            },
          }
        },
        convertError: err => {
          if (err instanceof Error) {
            const message = err.message
            if (message.includes('Invalid PDF')) {
              return Value.get(t).pdfPageViewer.invalidPdf
            }
            if (message.includes('page')) {
              return message
            }
            return Value.get(t).pdfPageViewer.loadFailed
          }
          return Value.get(t).pdfPageViewer.loadFailed
        },
        pending: () =>
          html.div(
            attr.class('bc-pdf-page-viewer__loading'),
            Icon({
              icon: 'line-md:loading-twotone-loop',
              size: 'lg',
            }),
            html.span(
              attr.class('bc-pdf-page-viewer__loading-text'),
              t.map(t => t.pdfPageViewer.loading)
            )
          ),
        failure: ({ error }) =>
          html.div(
            attr.class('bc-pdf-page-viewer__error'),
            Icon({
              icon: 'line-md:alert-circle',
              size: 'lg',
              color: 'danger',
            }),
            html.span(attr.class('bc-pdf-page-viewer__error-text'), error)
          ),
        success: ({ value }) =>
          html.canvas(
            attr.class('bc-pdf-page-viewer__canvas'),
            attr.width(value.map(v => String(v.width))),
            attr.height(value.map(v => String(v.height))),
            WithElement(canvas => {
              // Render to canvas when value changes
              const dispose = Value.on(value, async result => {
                await result.render(canvas as HTMLCanvasElement)
              })

              return Fragment(OnDispose(dispose))
            })
          ),
      })
    )
  })
}

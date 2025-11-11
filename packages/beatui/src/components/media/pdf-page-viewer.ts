import {
  html,
  attr,
  Value,
  WithElement,
  Use,
  computedOf,
  OnDispose,
  Fragment,
  type TNode,
  Empty,
} from '@tempots/dom'
import { Query, ElementRect } from '@tempots/ui'
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

  /**
   * Scale mode for rendering:
   * - number: Fixed scale factor (e.g., 2 for 2x resolution)
   * - 'fit': Fit to container width while maintaining aspect ratio
   * - 'fill': Fill container (may crop)
   * Default: 'fit'
   */
  scale?: Value<number | 'fit' | 'fill'>
}

interface PdfRenderRequest {
  source: string | Uint8Array | ArrayBuffer
  page: number
  scale: number | 'fit' | 'fill'
  containerWidth: number
  containerHeight: number
}

interface PdfRenderResult {
  pdfWidth: number
  pdfHeight: number
  canvasWidth: number
  canvasHeight: number
  render: (canvas: HTMLCanvasElement) => Promise<void>
}

/**
 * PdfPageViewer component that displays a single PDF page as a canvas element.
 * Lazy loads pdf.js library only when mounted.
 * Returns a canvas element directly - you can pass additional attributes as rest parameters.
 * Automatically adapts to container size when scale is 'fit' or 'fill'.
 *
 * @example
 * PdfPageViewer({ source: pdfUrl, page: 1 }, attr.class('my-canvas'))
 */
export function PdfPageViewer(
  { source, page = 1, scale = 'fit' }: PdfPageViewerOptions,
  ...children: TNode[]
) {
  const loadPDFLib = loadPDFJSCore()
  let lastSource = Value.get(source)
  let pdfDoc: PDFDocumentProxy | null = null

  return Use(BeatUII18n, t => {
    return Fragment(
      // Clean up PDF document when component unmounts
      OnDispose(() => {
        if (pdfDoc != null) {
          pdfDoc.destroy()
          pdfDoc = null
        }
      }),

      ElementRect(rect => {
        return Query<PdfRenderRequest, PdfRenderResult, string>({
          request: computedOf(
            source,
            page,
            scale,
            rect
          )((src, pg, sc, r) => ({
            source: src,
            page: pg,
            scale: sc,
            containerWidth: r.width,
            containerHeight: r.height,
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

            // Calculate scale based on mode
            let actualScale: number
            if (typeof request.scale === 'number') {
              actualScale = request.scale
            } else {
              // Get PDF page dimensions at scale 1
              const baseViewport = pdfPage.getViewport({ scale: 1 })
              const pdfAspect = baseViewport.width / baseViewport.height
              const containerAspect =
                request.containerWidth / request.containerHeight

              if (request.scale === 'fit') {
                // Fit to container width while maintaining aspect ratio
                actualScale = request.containerWidth / baseViewport.width
              } else {
                // 'fill' - fill container (may crop)
                if (pdfAspect > containerAspect) {
                  // PDF is wider - scale to height
                  actualScale = request.containerHeight / baseViewport.height
                } else {
                  // PDF is taller - scale to width
                  actualScale = request.containerWidth / baseViewport.width
                }
              }
            }

            const viewport = pdfPage.getViewport({ scale: actualScale })

            return {
              pdfWidth: viewport.width,
              pdfHeight: viewport.height,
              canvasWidth: Math.floor(viewport.width),
              canvasHeight: Math.floor(viewport.height),
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
              attr.class('bc-pdf-page-viewer'),
              attr.width(value.$.canvasWidth.map(String)),
              attr.height(value.$.canvasHeight.map(String)),
              ...children,
              WithElement(canvas => {
                // Render to canvas when value changes
                Value.on(value, async result => {
                  await result.render(canvas as HTMLCanvasElement)
                })

                return Empty
              })
            ),
        })
      })
    )
  })
}

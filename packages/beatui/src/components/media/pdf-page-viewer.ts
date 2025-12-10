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
  When,
  SplitValue,
  Ensure,
  delaySignal,
} from '@tempots/dom'
import { Query, ElementRect } from '@tempots/ui'
import { loadPDFJSCore } from '../../pdfjs/lazy-loader'
import { BeatUII18n } from '../../beatui-i18n'
import { Icon } from '../data/icon'
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  TypedArray,
  TextContent,
  RenderTask,
} from 'pdfjs-dist/types/src/display/api'
import type { PageViewport } from 'pdfjs-dist/types/src/display/display_utils'

// PDF.js library interface (loaded from CDN)
interface PDFJSLib {
  getDocument(src: string | TypedArray | ArrayBuffer): {
    promise: Promise<PDFDocumentProxy>
  }
  GlobalWorkerOptions?: {
    workerSrc?: string
  }
  TextLayer?: TextLayerConstructor
  AnnotationLayer?: AnnotationLayerConstructor
}

// TextLayer constructor from PDF.js
interface TextLayerConstructor {
  new (params: {
    textContentSource: ReadableStream | TextContent
    container: HTMLElement
    viewport: PageViewport
  }): TextLayerInstance
}

interface TextLayerInstance {
  render(): Promise<void>
  cancel(): void
}

// AnnotationLayer constructor from PDF.js
interface AnnotationLayerConstructor {
  new (params: {
    div: HTMLElement
    page: PDFPageProxy
    viewport: PageViewport
    linkService: SimpleLinkService
    annotationStorage: AnnotationStorage | null
  }): AnnotationLayerInstance
}

interface AnnotationLayerInstance {
  render(params: {
    viewport: PageViewport
    div: HTMLElement
    annotations: AnnotationData[]
    page: PDFPageProxy
    linkService: SimpleLinkService
    renderForms: boolean
  }): Promise<void>
}

// Minimal link service interface for annotations
interface SimpleLinkService {
  getDestinationHash: (dest: string) => string
  getAnchorUrl: (hash: string) => string
  executeNamedAction: (action: string) => void
  executeSetOCGState: (action: unknown) => void
  cachePageRef: (pageNum: number, pageRef: unknown) => void
}

// Annotation data type
interface AnnotationData {
  id: string
  [key: string]: unknown
}

// Annotation storage type
interface AnnotationStorage {
  [key: string]: unknown
}

export interface PdfPageViewerOptions {
  /** PDF source: URL string, Uint8Array, or ArrayBuffer */
  source: SplitValue<string | Uint8Array | ArrayBuffer>

  /** Page number to display (1-based, default: 1) */
  page?: Value<number>

  /**
   * How the PDF should fit in the available space:
   * - 'none': Use explicit scale value (see scale option)
   * - 'width': Fit to container width while maintaining aspect ratio
   * - 'height': Fit to container height while maintaining aspect ratio
   * - 'contain': Fit entire page in container (like CSS object-fit: contain)
   * - 'cover': Fill container, may crop (like CSS object-fit: cover)
   * Default: 'width'
   */
  fit?: Value<'none' | 'width' | 'height' | 'contain' | 'cover'>

  /**
   * Explicit scale factor when fit='none'
   * Ignored when fit is not 'none'
   * Default: 1
   */
  scale?: Value<number>

  /**
   * Rotation angle in degrees (0, 90, 180, 270)
   * Default: 0
   */
  rotation?: Value<0 | 90 | 180 | 270>

  /**
   * Rendering quality/pixel density multiplier
   * Higher values produce sharper images but use more memory
   * Default: 2 (retina quality)
   */
  quality?: Value<number>

  /**
   * Enable text selection layer overlay
   * Default: true
   */
  renderTextLayer?: Value<boolean>

  /**
   * Enable annotation layer (forms, links, etc.)
   * Default: false
   */
  renderAnnotationLayer?: Value<boolean>

  /**
   * Callback when page changes
   */
  onPageChange?: (page: number) => void

  /**
   * Callback when PDF loads successfully
   */
  onLoadComplete?: (info: { numPages: number }) => void
}

interface PdfRenderRequest {
  source: string | Uint8Array | ArrayBuffer
  page: number
  fit: 'none' | 'width' | 'height' | 'contain' | 'cover'
  scale: number
  rotation: 0 | 90 | 180 | 270
  quality: number
  renderTextLayer: boolean
  renderAnnotationLayer: boolean
  containerWidth: number
  containerHeight: number
}

interface PdfRenderResult {
  pdfWidth: number
  pdfHeight: number
  canvasWidth: number
  canvasHeight: number
  highResWidth: number
  highResHeight: number
  render: (
    canvas: HTMLCanvasElement,
    textLayerDiv?: HTMLElement,
    annotationLayerDiv?: HTMLElement
  ) => Promise<void>
}

function equal32(a: Uint8Array, b: Uint8Array) {
  if (a.byteLength !== b.byteLength) return false

  const len = a.byteLength
  const dv1 = new DataView(a.buffer, a.byteOffset, len)
  const dv2 = new DataView(b.buffer, b.byteOffset, len)

  const words = len >>> 2 // divide by 4
  const remainder = len & 3

  for (let i = 0; i < words; i++) {
    if (dv1.getUint32(i * 4) !== dv2.getUint32(i * 4)) return false
  }

  for (let i = len - remainder; i < len; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}

function arrayBufferEquals(a: ArrayBuffer, b: ArrayBuffer) {
  if (a.byteLength !== b.byteLength) return false

  const len = a.byteLength

  const wlen = len >>> 2
  const w1 = new Uint32Array(a, 0, wlen)
  const w2 = new Uint32Array(b, 0, wlen)

  for (let i = 0; i < wlen; i++) {
    if (w1[i] !== w2[i]) return false
  }

  const blen = len & 3
  const b1 = new Uint8Array(a, wlen * 4, blen)
  const b2 = new Uint8Array(b, wlen * 4, blen)

  for (let i = 0; i < blen; i++) {
    if (b1[i] !== b2[i]) return false
  }

  return true
}

function compareSources(
  src1: string | Uint8Array | ArrayBuffer,
  src2: string | Uint8Array | ArrayBuffer
): boolean {
  try {
    if (typeof src1 === 'string' && typeof src2 === 'string') {
      return src1 === src2
    }
    if (src1 instanceof Uint8Array && src2 instanceof Uint8Array) {
      return equal32(src1, src2)
    }
    if (src1 instanceof ArrayBuffer && src2 instanceof ArrayBuffer) {
      return arrayBufferEquals(src1, src2)
    }
    return false
  } catch {
    // Comparing a detached buffer will throw; treat as different
    return false
  }
}

function cloneSource(
  src: string | Uint8Array | ArrayBuffer
): string | Uint8Array | ArrayBuffer {
  if (typeof src === 'string') return src
  if (src instanceof Uint8Array) return src.slice()
  if (src instanceof ArrayBuffer) return src.slice(0)
  return src
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
  {
    source,
    page = 1,
    fit = 'width',
    scale = 1,
    rotation = 0,
    quality = 2,
    renderTextLayer = true,
    renderAnnotationLayer = false,
    onPageChange,
    onLoadComplete,
  }: PdfPageViewerOptions,
  ...children: TNode[]
) {
  const loadPDFLib = loadPDFJSCore()
  let lastSource = cloneSource(
    Value.get(source as Value<string | Uint8Array | ArrayBuffer>)
  )
  let pdfDoc: PDFDocumentProxy | null = null
  let lastPage = Value.get(page)
  let activeRenderTask: RenderTask | null = null

  return Use(BeatUII18n, t => {
    return Fragment(
      // Clean up PDF document when component unmounts
      OnDispose(() => {
        if (activeRenderTask) {
          try {
            activeRenderTask.cancel()
          } catch {
            // ignore cancellation errors
          }
          activeRenderTask = null
        }

        if (pdfDoc != null) {
          pdfDoc.destroy()
          pdfDoc = null
        }
      }),

      ElementRect(sourceRect => {
        const rect = delaySignal(
          sourceRect.map(
            v => (v == null ? null : { width: v.width, height: v.height }),
            (a, b) => {
              return (
                a != null &&
                b != null &&
                a.width === b.width &&
                a.height === b.height
              )
            }
          ),
          100
        )
        return Ensure(rect, rect =>
          Query<PdfRenderRequest, PdfRenderResult, string>({
            request: computedOf(
              source,
              page,
              fit,
              scale,
              rotation,
              quality,
              renderTextLayer,
              renderAnnotationLayer,
              rect
            )((src, pg, fitMode, sc, rot, qual, textLayer, annotLayer, r) => ({
              source: src,
              page: pg,
              fit: fitMode,
              scale: sc,
              rotation: rot,
              quality: qual,
              renderTextLayer: textLayer,
              renderAnnotationLayer: annotLayer,
              containerWidth: r.width,
              containerHeight: r.height,
            })),
            load: async ({ request }) => {
              // Load PDF.js library
              const pdfjsLib = (await loadPDFLib) as PDFJSLib
              const requestSource = request.source
              const comparableSource = cloneSource(requestSource)
              const loadableSource = cloneSource(requestSource)

              // Load or reuse PDF document
              if (
                pdfDoc == null ||
                !compareSources(lastSource, comparableSource)
              ) {
                // Destroy old document if it exists
                if (pdfDoc != null) {
                  pdfDoc.destroy()
                  pdfDoc = null
                }

                lastSource = comparableSource

                // Load new PDF document
                const loadingTask = pdfjsLib.getDocument(loadableSource)
                pdfDoc = await loadingTask.promise

                // Call onLoadComplete callback
                if (onLoadComplete != null) {
                  onLoadComplete({ numPages: pdfDoc.numPages })
                }
              }

              // Validate page number
              const pageNum =
                request.page < 1 || request.page > pdfDoc.numPages
                  ? 1
                  : request.page

              // Call onPageChange callback if page changed
              if (onPageChange != null && pageNum !== lastPage) {
                lastPage = pageNum
                onPageChange(pageNum)
              }

              // Get the page
              const pdfPage = await pdfDoc.getPage(pageNum)

              // Calculate scale based on fit mode
              let actualScale: number
              if (request.fit === 'none') {
                // Use explicit scale value
                actualScale = request.scale
              } else {
                // Get PDF page dimensions at scale 1 with rotation
                const baseViewport = pdfPage.getViewport({
                  scale: 1,
                  rotation: request.rotation,
                })
                const pdfAspect = baseViewport.width / baseViewport.height
                const containerAspect =
                  request.containerWidth / request.containerHeight

                switch (request.fit) {
                  case 'width':
                    // Fit to container width while maintaining aspect ratio
                    actualScale = request.containerWidth / baseViewport.width
                    break
                  case 'height':
                    // Fit to container height while maintaining aspect ratio
                    actualScale = request.containerHeight / baseViewport.height
                    break
                  case 'contain':
                    // Fit entire page in container (use smaller scale)
                    actualScale = Math.min(
                      request.containerWidth / baseViewport.width,
                      request.containerHeight / baseViewport.height
                    )
                    break
                  case 'cover':
                    // Fill container (may crop)
                    if (pdfAspect > containerAspect) {
                      // PDF is wider - scale to height
                      actualScale =
                        request.containerHeight / baseViewport.height
                    } else {
                      // PDF is taller - scale to width
                      actualScale = request.containerWidth / baseViewport.width
                    }
                    break
                }
              }

              // Calculate base viewport (without quality multiplier)
              const baseViewport = pdfPage.getViewport({
                scale: actualScale,
                rotation: request.rotation,
              })

              // Calculate high-res viewport (with quality multiplier for sharp rendering)
              const highResViewport = pdfPage.getViewport({
                scale: actualScale * request.quality,
                rotation: request.rotation,
              })

              return {
                pdfWidth: baseViewport.width,
                pdfHeight: baseViewport.height,
                canvasWidth: Math.floor(baseViewport.width),
                canvasHeight: Math.floor(baseViewport.height),
                highResWidth: Math.floor(highResViewport.width),
                highResHeight: Math.floor(highResViewport.height),
                render: async (
                  canvas: HTMLCanvasElement,
                  textLayerDiv?: HTMLElement,
                  annotationLayerDiv?: HTMLElement
                ) => {
                  // Cancel any in-flight render on this page/canvas before starting a new one
                  if (activeRenderTask) {
                    try {
                      activeRenderTask.cancel()
                      await activeRenderTask.promise.catch(() => {})
                    } catch {
                      // ignore cancellation errors
                    }
                  }

                  // Set canvas internal resolution to high-res for sharp rendering
                  canvas.width = highResViewport.width
                  canvas.height = highResViewport.height

                  // Set canvas display size to base size via CSS
                  canvas.style.width = `${baseViewport.width}px`
                  canvas.style.height = `${baseViewport.height}px`

                  const context = canvas.getContext('2d')
                  if (!context) {
                    throw new Error('Failed to get canvas context')
                  }

                  // Render the page at high resolution
                  const renderTask = pdfPage.render({
                    canvasContext: context,
                    canvas,
                    viewport: highResViewport,
                  })
                  activeRenderTask = renderTask

                  try {
                    await renderTask.promise
                  } catch (err) {
                    // Ignore cancellations; rethrow genuine errors
                    const name =
                      err instanceof Error
                        ? err.name
                        : (err as { name?: string } | undefined)?.name
                    if (name !== 'RenderingCancelledException') {
                      throw err
                    }
                    return
                  } finally {
                    if (activeRenderTask === renderTask) {
                      activeRenderTask = null
                    }
                  }

                  // Render text layer if enabled and container provided
                  // Text layer uses base viewport for correct positioning
                  if (request.renderTextLayer && textLayerDiv != null) {
                    // Clear previous text layer content
                    textLayerDiv.innerHTML = ''

                    try {
                      const textContent = await pdfPage.getTextContent()
                      const TextLayer = pdfjsLib.TextLayer
                      if (TextLayer != null) {
                        const textLayer = new TextLayer({
                          textContentSource: textContent,
                          container: textLayerDiv,
                          viewport: baseViewport,
                        })
                        await textLayer.render()
                      }
                    } catch (err) {
                      console.warn('Failed to render text layer:', err)
                    }
                  }

                  // Render annotation layer if enabled and container provided
                  // Annotation layer uses base viewport for correct positioning
                  if (
                    request.renderAnnotationLayer &&
                    annotationLayerDiv != null
                  ) {
                    // Clear previous annotation layer content
                    annotationLayerDiv.innerHTML = ''
                    annotationLayerDiv.style.width = `${baseViewport.width}px`
                    annotationLayerDiv.style.height = `${baseViewport.height}px`

                    try {
                      const annotations = await pdfPage.getAnnotations()
                      const AnnotationLayer = pdfjsLib.AnnotationLayer
                      if (AnnotationLayer != null && annotations.length > 0) {
                        const linkService: SimpleLinkService = {
                          // Minimal link service for basic functionality
                          getDestinationHash: () => '',
                          getAnchorUrl: (hash: string) => hash,
                          executeNamedAction: () => {},
                          executeSetOCGState: () => {},
                          cachePageRef: () => {},
                        }

                        const annotationLayer = new AnnotationLayer({
                          div: annotationLayerDiv,
                          page: pdfPage,
                          viewport: baseViewport,
                          linkService,
                          annotationStorage: null,
                        })
                        await annotationLayer.render({
                          viewport: baseViewport,
                          div: annotationLayerDiv,
                          annotations: annotations as AnnotationData[],
                          page: pdfPage,
                          linkService,
                          renderForms: true,
                        })
                      }
                    } catch (err) {
                      console.warn('Failed to render annotation layer:', err)
                    }
                  }
                },
              }
            },
            convertError: err => {
              if (err instanceof Error) {
                return err.message
              }
              return JSON.stringify(err)
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
              html.div(
                attr.class(
                  Value.map(fit, fitMode =>
                    fitMode === 'none'
                      ? 'bc-pdf-page-viewer'
                      : `bc-pdf-page-viewer bc-pdf-page-viewer--fit-${fitMode}`
                  )
                ),
                // Wrapper for canvas and layers (provides positioning context)
                html.div(
                  attr.class('bc-pdf-page-viewer__content'),
                  // Only set fixed dimensions when fit is 'none'
                  When(
                    Value.map(fit, fitMode => fitMode === 'none'),
                    () =>
                      attr.style(
                        value.$.canvasWidth.map(
                          w =>
                            `width: ${w}px; height: ${value.value.canvasHeight}px;`
                        )
                      ),
                    () => Fragment()
                  ),
                  // Canvas layer
                  html.canvas(
                    attr.class('bc-pdf-page-viewer__canvas'),
                    attr.width(value.$.canvasWidth.map(String)),
                    attr.height(value.$.canvasHeight.map(String)),
                    ...children
                  ),
                  // Text layer (for text selection)
                  html.div(attr.class('bc-pdf-page-viewer__text-layer')),
                  // Annotation layer (for links, forms, etc.)
                  html.div(attr.class('bc-pdf-page-viewer__annotation-layer'))
                ),
                WithElement(container => {
                  const canvas = container.querySelector(
                    '.bc-pdf-page-viewer__canvas'
                  ) as HTMLCanvasElement
                  const textLayerDiv = container.querySelector(
                    '.bc-pdf-page-viewer__text-layer'
                  ) as HTMLElement
                  const annotationLayerDiv = container.querySelector(
                    '.bc-pdf-page-viewer__annotation-layer'
                  ) as HTMLElement

                  // Render to canvas and layers when value changes
                  Value.on(value, async result => {
                    await result.render(
                      canvas,
                      textLayerDiv,
                      annotationLayerDiv
                    )
                  })

                  return Empty
                })
              ),
          })
        )
      })
    )
  })
}

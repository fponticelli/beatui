/**
 * File download utilities for BeatUI.
 *
 * Provides functions for downloading files from URLs, creating downloads from
 * in-memory content, and monitoring download progress with reactive signals.
 *
 * @module
 */

import { prop, Signal } from '@tempots/dom'

/**
 * Represents an in-progress download with a known content length.
 */
export interface Progress {
  /** Discriminant for the `DownloadResult` union. */
  type: 'progress'
  /** Download progress as a fraction from 0 to 1. */
  value: number
}

/**
 * Represents an in-progress download with an unknown content length.
 */
export interface Undetermined {
  /** Discriminant for the `DownloadResult` union. */
  type: 'undetermined'
}

/**
 * Represents a completed download with the resulting file.
 */
export interface Done {
  /** Discriminant for the `DownloadResult` union. */
  type: 'done'
  /** The downloaded file. */
  file: File
}

/**
 * Represents a failed download with the error that occurred.
 */
export interface DownloadError {
  /** Discriminant for the `DownloadResult` union. */
  type: 'error'
  /** The error that caused the download failure. */
  error: Error
}

/**
 * Discriminated union representing the current state of a monitored download.
 * Use the `type` property to determine the current state.
 */
export type DownloadResult = Progress | Undetermined | Done | DownloadError

/**
 * Downloads a file from a URL and triggers a browser download dialog.
 * Falls back to opening the URL in a new tab if the fetch fails (e.g., due to CORS).
 *
 * @param url - The URL to download from
 * @param filename - The suggested filename for the download
 * @default filename ''
 *
 * @example
 * ```ts
 * await downloadUrl('https://example.com/file.pdf', 'document.pdf')
 * ```
 */
export const downloadUrl = async (url: string, filename = '') => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    URL.revokeObjectURL(blobUrl)
  } catch {
    // Fallback: open in new tab if fetch fails (e.g., CORS issues)
    window.open(url, '_blank')
  }
}
/**
 * Creates a browser download from in-memory content (string or binary data).
 *
 * @param content - The content to download, either a string or a `Uint8Array`
 * @param filename - The suggested filename for the download
 * @param type - The MIME type of the content
 * @default type 'application/octet-stream'
 *
 * @example
 * ```ts
 * downloadContent('Hello, world!', 'hello.txt', 'text/plain')
 * downloadContent(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), 'image.png', 'image/png')
 * ```
 */
export const downloadContent = (
  content: string | Uint8Array<ArrayBuffer>,
  filename: string,
  type = 'application/octet-stream'
) => {
  const blob = new Blob([content], { type })
  downloadUrl(URL.createObjectURL(blob), filename)
  URL.revokeObjectURL(URL.createObjectURL(blob))
}

/**
 * Downloads a file from a URL while providing real-time progress monitoring
 * through a reactive signal. Returns both the progress signal and a cancel function.
 *
 * The signal emits:
 * - `{ type: 'progress', value: 0..1 }` when content length is known
 * - `{ type: 'undetermined' }` when content length is unknown
 * - `{ type: 'done', file }` on successful completion
 * - `{ type: 'error', error }` on failure
 *
 * @param url - The URL to download from
 * @returns An object with a `signal` for monitoring progress and a `cancel` function to abort
 *
 * @example
 * ```ts
 * const { signal, cancel } = downloadUrlAndMonitor('https://example.com/large-file.zip')
 * signal.on(result => {
 *   if (result.type === 'progress') console.log(`${result.value * 100}%`)
 *   if (result.type === 'done') downloadFile(result.file)
 * })
 * // To cancel: cancel()
 * ```
 */
export const downloadUrlAndMonitor = (
  url: string
): { signal: Signal<DownloadResult>; cancel: () => void } => {
  const abortController = new AbortController()
  const result = prop<DownloadResult>({ type: 'progress', value: 0 })
  let done = false
  ;(async () => {
    try {
      const response = await fetch(url, { signal: abortController.signal })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const contentLength = response.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength, 10) : undefined
      const blobPromise = (async () => {
        if (total === undefined || isNaN(total)) {
          result.set({ type: 'undetermined' })
          return await response.blob()
        } else {
          const data = new Uint8Array(total)
          if (response.body == null) {
            throw new Error('Response body is null')
          }
          const reader = response.body.getReader()
          let received = 0
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            data.set(value, received)
            received += value.length
            result.set({
              type: 'progress',
              value: Math.min(received / total, 1),
            })
          }
          return new Blob([data], {
            type: response.headers.get('content-type') ?? undefined,
          })
        }
      })()
      const fileName = url.split('/').pop() || 'download'
      const blob = await blobPromise
      const file = new File([blob], fileName, {
        type: blob.type,
      })
      done = true
      result.set({ type: 'done', file })
    } catch (error) {
      result.set({ type: 'error', error: error as Error })
    } finally {
      done = true
      result.dispose()
    }
  })()
  return {
    signal: result,
    cancel: () => {
      if (!done) {
        abortController.abort()
      }
    },
  }
}

/**
 * Triggers a browser download dialog for a `File` object.
 *
 * @param file - The `File` object to download
 *
 * @example
 * ```ts
 * const file = new File(['content'], 'example.txt', { type: 'text/plain' })
 * downloadFile(file)
 * ```
 */
export const downloadFile = (file: File) => {
  downloadUrl(URL.createObjectURL(file), file.name)
}

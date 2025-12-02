import { prop, Signal } from '@tempots/dom'

export interface Progress {
  type: 'progress'
  value: number
}

export interface Undetermined {
  type: 'undetermined'
}

export interface Done {
  type: 'done'
  file: File
}

export interface DownloadError {
  type: 'error'
  error: Error
}

export type DownloadResult = Progress | Undetermined | Done | DownloadError

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
export const downloadContent = (
  content: string | Uint8Array<ArrayBuffer>,
  filename: string,
  type = 'application/octet-stream'
) => {
  const blob = new Blob([content], { type })
  downloadUrl(URL.createObjectURL(blob), filename)
  URL.revokeObjectURL(URL.createObjectURL(blob))
}

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

export const downloadFile = (file: File) => {
  downloadUrl(URL.createObjectURL(file), file.name)
}

import { prop, Signal } from '@tempots/dom'
import { StreamOptions } from './types'

export function fromFetch(
  input: RequestInfo,
  init?: RequestInit,
  options?: StreamOptions
): {
  response: Signal<string>
  isStreaming: Signal<boolean>
  abort: () => void
} {
  const response = prop('')
  const isStreaming = prop(true)
  const abortController = new AbortController()

  const doAbort = () => {
    abortController.abort()
    response.dispose()
    isStreaming.dispose()
  }

  fetch(input, { ...init, signal: abortController.signal })
    .then(async res => {
      const body = res.body
      if (!body) {
        isStreaming.set(false)
        options?.onComplete?.()
        return
      }
      const reader = body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const decoded = decoder.decode(value, { stream: true })
        if (options?.extractContent) {
          const lines = decoded.split('\n')
          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed) {
              try {
                accumulated += options.extractContent(trimmed)
              } catch {
                // skip lines that fail extraction
              }
            }
          }
          response.set(accumulated)
        } else {
          accumulated += decoded
          response.set(accumulated)
        }
      }
      isStreaming.set(false)
      options?.onComplete?.()
    })
    .catch(err => {
      if (err instanceof Error && err.name === 'AbortError') return
      options?.onError?.(err instanceof Error ? err : new Error(String(err)))
      isStreaming.set(false)
    })

  return { response, isStreaming, abort: doAbort }
}

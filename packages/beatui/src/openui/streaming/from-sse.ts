import { prop, Signal } from '@tempots/dom'
import { StreamOptions } from './types'

export function fromSSE(
  url: string,
  options?: StreamOptions & EventSourceInit
): { response: Signal<string>; isStreaming: Signal<boolean>; abort: () => void } {
  const response = prop('')
  const isStreaming = prop(true)

  const { onComplete, onError, extractContent, withCredentials } = options ?? {}
  const eventSource = new EventSource(url, { withCredentials: withCredentials ?? false })

  let accumulated = ''

  eventSource.addEventListener('message', (event: MessageEvent) => {
    const data: string = event.data
    if (extractContent) {
      try {
        accumulated += extractContent(data)
      } catch {
        // skip messages that fail extraction
      }
    } else {
      accumulated += data
    }
    response.set(accumulated)
  })

  eventSource.addEventListener('error', (event) => {
    if (eventSource.readyState === EventSource.CLOSED) {
      isStreaming.set(false)
      onComplete?.()
    } else {
      const err = new Error('EventSource error')
      onError?.(err)
      isStreaming.set(false)
    }
  })

  const doAbort = () => {
    eventSource.close()
    response.dispose()
    isStreaming.dispose()
  }

  return { response, isStreaming, abort: doAbort }
}

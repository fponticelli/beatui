import { prop, Signal } from '@tempots/dom'
import { StreamOptions } from './types'

export function fromWebSocket(
  url: string,
  options?: StreamOptions & { protocols?: string[] }
): {
  response: Signal<string>
  isStreaming: Signal<boolean>
  close: () => void
  send: (data: string) => void
} {
  const response = prop('')
  const isStreaming = prop(true)

  const { onComplete, onError, extractContent, protocols } = options ?? {}
  const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url)

  let accumulated = ''

  ws.addEventListener('message', (event: MessageEvent) => {
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

  ws.addEventListener('close', () => {
    isStreaming.set(false)
    onComplete?.()
  })

  ws.addEventListener('error', () => {
    const err = new Error('WebSocket error')
    onError?.(err)
    isStreaming.set(false)
  })

  const doClose = () => {
    ws.close()
    response.dispose()
    isStreaming.dispose()
  }

  const doSend = (data: string) => {
    ws.send(data)
  }

  return { response, isStreaming, close: doClose, send: doSend }
}

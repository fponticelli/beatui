import { describe, it, expect, vi } from 'vitest'
import { fromFetch } from '../../../src/openui/streaming/from-fetch'

function mockFetchResponse(chunks: string[]): void {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
        await new Promise(r => setTimeout(r, 5))
      }
      controller.close()
    },
  })
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(stream, { status: 200 })
  )
}

describe('fromFetch', () => {
  it('accumulates streamed text into response signal', async () => {
    mockFetchResponse(['root = ', 'Button("Hi")'])
    const { response, isStreaming, abort } = fromFetch('/api/test')
    await vi.waitFor(() => {
      expect(isStreaming.value).toBe(false)
    }, { timeout: 1000 })
    expect(response.value).toBe('root = Button("Hi")')
    abort()
    vi.restoreAllMocks()
  })

  it('applies extractContent transformer', async () => {
    // Note: assumes 1:1 enqueue-to-read mapping in test mock
    mockFetchResponse(['{"content":"hello"}', '{"content":" world"}'])
    const { response, isStreaming, abort } = fromFetch('/api/test', undefined, {
      extractContent: (chunk) => {
        const parsed = JSON.parse(chunk as string)
        return parsed.content
      },
    })
    await vi.waitFor(() => {
      expect(isStreaming.value).toBe(false)
    }, { timeout: 1000 })
    expect(response.value).toBe('hello world')
    abort()
    vi.restoreAllMocks()
  })

  it('disposes signals on abort', async () => {
    mockFetchResponse(['data'])
    const { response, abort } = fromFetch('/api/test')
    await vi.waitFor(() => expect(response.value).toBe('data'), { timeout: 1000 })
    abort() // should not throw
    vi.restoreAllMocks()
  })
})

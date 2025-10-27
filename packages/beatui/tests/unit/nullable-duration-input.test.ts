import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { NullableDurationInput } from '../../src/components/form/input/nullable-duration-input'
import type { Duration } from '../../src/temporal/types'
import { BeatUI } from '@/index'
import { sleep } from '@tempots/std'

describe('NullableDurationInput', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders empty string when value is null', async () => {
    const value = prop<Duration | null>(null)
    const el = NullableDurationInput({ value, onChange: vi.fn() })
    render(BeatUI({}, el), container)
    await sleep(10)

    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('maps change to null for empty and to parsed duration for valid ISO', async () => {
    const value = prop<Duration | null>(null)
    const onChange = vi.fn()
    const el = NullableDurationInput({ value, onChange })
    render(BeatUI({}, el), container)

    // Wait for Temporal polyfill to load and MaskInput to render
    await sleep(100)

    const input = container.querySelector('input') as HTMLInputElement
    input.value = 'P2DT3H'
    input.dispatchEvent(new Event('change', { bubbles: true }))

    // Wait for the change event to be processed
    await sleep(10)

    expect(onChange).toHaveBeenCalled()
    const dur: Duration = onChange.mock.calls[0][0]
    expect(String(dur)).toBe('P2DT3H')

    onChange.mockClear()
    input.value = ''
    input.dispatchEvent(new Event('change', { bubbles: true }))

    // Wait for the change event to be processed
    await sleep(10)

    expect(onChange).toHaveBeenCalledWith(null)
  })
})

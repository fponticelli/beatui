import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { CopyButton } from '../../src/components/button/copy-button'
import { BeatUI } from '../../src/components/beatui'

describe('CopyButton', () => {
  let container: HTMLElement

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.removeChild(container)
  })

  it('should render with copy icon', () => {
    render(BeatUI({}, CopyButton({ text: 'hello' })), container)

    const wrapper = container.querySelector('.bc-copy-button')
    expect(wrapper).not.toBeNull()

    const button = container.querySelector('.bc-button')
    expect(button).not.toBeNull()
  })

  it('should have correct aria-label', () => {
    render(BeatUI({}, CopyButton({ text: 'hello' })), container)

    const button = container.querySelector('.bc-button')
    expect(button?.getAttribute('aria-label')).toBe('Copy to clipboard')
  })

  it('should switch to copied state on click', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })

    render(BeatUI({}, CopyButton({ text: 'hello' })), container)

    const button = container.querySelector('.bc-button') as HTMLElement
    button.click()

    // Allow async clipboard operation
    await vi.advanceTimersByTimeAsync(10)

    const wrapper = container.querySelector('.bc-copy-button')
    expect(wrapper?.classList.contains('bc-copy-button--copied')).toBe(true)
  })

  it('should reset after timeout', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })

    render(BeatUI({}, CopyButton({ text: 'hello', timeout: 1000 })), container)

    const button = container.querySelector('.bc-button') as HTMLElement
    button.click()

    await vi.advanceTimersByTimeAsync(10)
    expect(
      container.querySelector('.bc-copy-button')?.classList.contains('bc-copy-button--copied')
    ).toBe(true)

    await vi.advanceTimersByTimeAsync(1000)
    expect(
      container.querySelector('.bc-copy-button')?.classList.contains('bc-copy-button--copied')
    ).toBe(false)
  })

  it('should call clipboard writeText with correct text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(BeatUI({}, CopyButton({ text: 'secret-key' })), container)

    const button = container.querySelector('.bc-button') as HTMLElement
    button.click()

    await vi.advanceTimersByTimeAsync(10)
    expect(writeText).toHaveBeenCalledWith('secret-key')
  })

  it('should react to text value changes', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    const text = prop('first')
    render(BeatUI({}, CopyButton({ text })), container)

    text.set('second')

    const button = container.querySelector('.bc-button') as HTMLElement
    button.click()

    await vi.advanceTimersByTimeAsync(10)
    expect(writeText).toHaveBeenCalledWith('second')
  })
})

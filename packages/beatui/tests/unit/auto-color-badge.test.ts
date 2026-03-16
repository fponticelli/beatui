import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { AutoColorBadge } from '../../src/components/data/auto-color-badge'
import type { HSLRange } from '../../src/components/data/auto-color-badge'
import { WithProviders } from '../helpers/test-providers'

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('AutoColorBadge', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  function getBadge(): HTMLElement | null {
    return container.querySelector('.bc-auto-color-badge')
  }

  function getStyle(): string {
    return getBadge()?.getAttribute('style') ?? ''
  }

  it('should render with default options', () => {
    render(WithProviders(() => AutoColorBadge({}, 'Test')), container)
    const badge = getBadge()
    expect(badge).not.toBeNull()
    expect(badge!.textContent).toBe('Test')
  })

  it('should apply size class', () => {
    render(WithProviders(() => AutoColorBadge({ size: 'sm' }, 'Small')), container)
    expect(getBadge()!.className).toContain('bc-badge--size-sm')
  })

  it('should apply roundedness class', () => {
    render(WithProviders(() => AutoColorBadge({ roundedness: 'md' }, 'Round')), container)
    expect(getBadge()!.className).toContain('bc-control--rounded-md')
  })

  it('should generate a background color from text content', async () => {
    render(WithProviders(() => AutoColorBadge({}, 'TypeScript')), container)
    await tick()
    expect(getStyle()).toContain('background-color: hsl(')
    expect(getStyle()).toContain('color:')
  })

  it('should produce the same color for the same text', async () => {
    render(WithProviders(() => AutoColorBadge({}, 'Hello')), container)
    await tick()
    const style1 = getStyle()

    document.body.removeChild(container)
    container = document.createElement('div')
    document.body.appendChild(container)

    render(WithProviders(() => AutoColorBadge({}, 'Hello')), container)
    await tick()
    expect(getStyle()).toBe(style1)
  })

  it('should produce different colors for different text', async () => {
    render(WithProviders(() => AutoColorBadge({}, 'Alpha')), container)
    await tick()
    const style1 = getStyle()

    document.body.removeChild(container)
    container = document.createElement('div')
    document.body.appendChild(container)

    render(WithProviders(() => AutoColorBadge({}, 'Beta')), container)
    await tick()
    expect(getStyle()).not.toBe(style1)
  })

  it('should use white text for dark backgrounds (low lightness)', async () => {
    render(
      WithProviders(() =>
        AutoColorBadge({ lightness: { min: 20, max: 20 } }, 'Dark')
      ),
      container
    )
    await tick()
    expect(getStyle()).toContain('color: #fff')
  })

  it('should use black text for light backgrounds (high lightness)', async () => {
    render(
      WithProviders(() =>
        AutoColorBadge({ lightness: { min: 80, max: 80 } }, 'Light')
      ),
      container
    )
    await tick()
    expect(getStyle()).toContain('color: #000')
  })

  it('should constrain hue to specified range', async () => {
    render(
      WithProviders(() =>
        AutoColorBadge({ hue: { min: 100, max: 100 } }, 'Fixed Hue')
      ),
      container
    )
    await tick()
    expect(getStyle()).toContain('hsl(100.0')
  })

  it('should constrain saturation to specified range', async () => {
    render(
      WithProviders(() =>
        AutoColorBadge({ saturation: { min: 75, max: 75 } }, 'Fixed Sat')
      ),
      container
    )
    await tick()
    expect(getStyle()).toContain('75.0%')
  })

  it('should not set color style for empty text', async () => {
    render(WithProviders(() => AutoColorBadge({}, '')), container)
    await tick()
    expect(getStyle()).not.toContain('background-color')
  })

  it('should update color when content changes via signal', async () => {
    const text = prop('First')
    render(WithProviders(() => AutoColorBadge({}, text)), container)
    await tick()
    const style1 = getStyle()

    text.set('Second')
    await tick()
    expect(getStyle()).not.toBe(style1)
  })

  it('should react to HSL range signal changes', async () => {
    const lightness = prop<HSLRange>({ min: 20, max: 20 })
    render(
      WithProviders(() => AutoColorBadge({ lightness }, 'Reactive')),
      container
    )
    await tick()
    expect(getStyle()).toContain('color: #fff')

    lightness.set({ min: 80, max: 80 })
    await tick()
    expect(getStyle()).toContain('color: #000')
  })

  it('should derive color from explicit text option instead of DOM content', async () => {
    render(
      WithProviders(() =>
        AutoColorBadge({ text: 'admin' }, 'Administrator')
      ),
      container
    )
    await tick()
    const styleWithExplicit = getStyle()

    // Compare with a badge that uses 'admin' as DOM content
    document.body.removeChild(container)
    container = document.createElement('div')
    document.body.appendChild(container)

    render(
      WithProviders(() => AutoColorBadge({}, 'admin')),
      container
    )
    await tick()
    expect(getStyle()).toBe(styleWithExplicit)
  })

  it('should react to explicit text signal changes', async () => {
    const text = prop('first')
    render(
      WithProviders(() => AutoColorBadge({ text }, 'Display')),
      container
    )
    await tick()
    const style1 = getStyle()

    text.set('second')
    await tick()
    expect(getStyle()).not.toBe(style1)
  })

  it('should render bc-badge__content wrapper', () => {
    render(WithProviders(() => AutoColorBadge({}, 'Content')), container)
    const content = container.querySelector('.bc-badge__content')
    expect(content).not.toBeNull()
    expect(content!.textContent).toBe('Content')
  })

  it('should react to size signal changes', async () => {
    const size = prop<'sm' | 'md' | 'lg'>('md')
    render(WithProviders(() => AutoColorBadge({ size }, 'Reactive')), container)
    expect(getBadge()!.className).toContain('bc-badge--size-md')

    size.set('lg')
    await tick()
    expect(getBadge()!.className).toContain('bc-badge--size-lg')
  })
})

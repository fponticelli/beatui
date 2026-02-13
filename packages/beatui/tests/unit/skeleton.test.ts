import { describe, it, expect } from 'vitest'
import { render, prop } from '@tempots/dom'
import { Skeleton } from '../../src/components/data/skeleton'
import { WithProviders } from '../helpers/test-providers'

describe('Skeleton Component', () => {
  it('should render with default props', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => Skeleton({})), container)

    const skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton).not.toBeNull()
    expect(skeleton!.className).toContain('bc-skeleton--text')
    expect(skeleton!.className).toContain('bc-skeleton--animate')
    expect(skeleton!.className).toContain('bc-control--rounded-sm')
  })

  it('should render without animation when animate is false', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => Skeleton({ animate: false })), container)

    const skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton).not.toBeNull()
    expect(skeleton!.className).not.toContain('bc-skeleton--animate')
  })

  it('should render circle variant', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => Skeleton({ variant: 'circle' })), container)

    const skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton).not.toBeNull()
    expect(skeleton!.className).toContain('bc-skeleton--circle')
  })

  it('should render rect variant', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => Skeleton({ variant: 'rect' })), container)

    const skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton).not.toBeNull()
    expect(skeleton!.className).toContain('bc-skeleton--rect')
  })

  it('should apply custom width and height', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => Skeleton({ width: '200px', height: '100px' })),
      container
    )

    const skeleton = container.querySelector('.bc-skeleton') as HTMLElement
    expect(skeleton).not.toBeNull()
    expect(skeleton!.style.width).toBe('200px')
    expect(skeleton!.style.height).toBe('100px')
  })

  it('should render multiple lines for text variant', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => Skeleton({ variant: 'text', lines: 3 })), container)

    const linesContainer = container.querySelector('.bc-skeleton__lines-container')
    expect(linesContainer).not.toBeNull()

    const lines = container.querySelectorAll('.bc-skeleton__line')
    expect(lines.length).toBe(3)
  })

  it('should render single skeleton when lines is 1', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => Skeleton({ variant: 'text', lines: 1 })), container)

    const skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton).not.toBeNull()

    const linesContainer = container.querySelector('.bc-skeleton__lines-container')
    expect(linesContainer).toBeNull()
  })

  it('should have aria-hidden attribute', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => Skeleton({})), container)

    const skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton).not.toBeNull()
    expect(skeleton!.getAttribute('aria-hidden')).toBe('true')
  })

  it('should apply custom roundedness', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => Skeleton({ roundedness: 'lg' })), container)

    const skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton).not.toBeNull()
    expect(skeleton!.className).toContain('bc-control--rounded-lg')
  })

  it('should reactively update variant', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const variant = prop<'text' | 'rect' | 'circle'>('text')

    render(WithProviders(() => Skeleton({ variant })), container)

    let skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton!.className).toContain('bc-skeleton--text')

    variant.set('circle')
    await new Promise(resolve => setTimeout(resolve, 0))

    skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton!.className).toContain('bc-skeleton--circle')
  })

  it('should reactively update animation state', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const animate = prop(true)

    render(WithProviders(() => Skeleton({ animate })), container)

    let skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton!.className).toContain('bc-skeleton--animate')

    animate.set(false)
    await new Promise(resolve => setTimeout(resolve, 0))

    skeleton = container.querySelector('.bc-skeleton')
    expect(skeleton!.className).not.toContain('bc-skeleton--animate')
  })
})

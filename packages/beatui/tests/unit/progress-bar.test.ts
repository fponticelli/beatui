import { describe, it, expect } from 'vitest'
import { render, prop } from '@tempots/dom'
import { ProgressBar } from '../../src/components/data/progress-bar'
import { WithProviders } from '../helpers/test-providers'

describe('ProgressBar Component', () => {
  it('should render with default props', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => ProgressBar({})), container)

    const progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar).not.toBeNull()
    expect(progressBar!.getAttribute('role')).toBe('progressbar')
    expect(progressBar!.className).toContain('bc-progress-bar--size-md')
  })

  it('should set ARIA attributes correctly', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ value: 50, max: 100 })),
      container
    )

    const progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar).not.toBeNull()
    expect(progressBar!.getAttribute('aria-valuenow')).toBe('50')
    expect(progressBar!.getAttribute('aria-valuemin')).toBe('0')
    expect(progressBar!.getAttribute('aria-valuemax')).toBe('100')
    expect(progressBar!.getAttribute('aria-valuetext')).toBe('50%')
  })

  it('should apply indeterminate class and keep ARIA attributes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ indeterminate: true })),
      container
    )

    const progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar).not.toBeNull()
    expect(progressBar!.className).toContain('bc-progress-bar--indeterminate')
    expect(progressBar!.hasAttribute('aria-valuenow')).toBe(true)
    expect(progressBar!.hasAttribute('aria-valuetext')).toBe(true)
  })

  it('should calculate percentage correctly', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ value: 75, max: 100 })),
      container
    )

    const fill = container.querySelector('.bc-progress-bar__fill') as HTMLElement
    expect(fill).not.toBeNull()
    expect(fill!.style.width).toBe('75%')
  })

  it('should handle custom max value', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ value: 3, max: 5 })),
      container
    )

    const progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar!.getAttribute('aria-valuemax')).toBe('5')
    expect(progressBar!.getAttribute('aria-valuetext')).toBe('60%')

    const fill = container.querySelector('.bc-progress-bar__fill') as HTMLElement
    expect(fill!.style.width).toBe('60%')
  })

  it('should clamp percentage to 0-100 range', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ value: 150, max: 100 })),
      container
    )

    const fill = container.querySelector('.bc-progress-bar__fill') as HTMLElement
    expect(fill!.style.width).toBe('100%')
  })

  it('should render label when showLabel is true', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ value: 42, showLabel: true })),
      container
    )

    const label = container.querySelector('.bc-progress-bar__label')
    expect(label).not.toBeNull()
    expect(label!.textContent).toBe('42%')
    expect(label!.getAttribute('aria-hidden')).toBe('true')
  })

  it('should not render label when showLabel is false', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ value: 42, showLabel: false })),
      container
    )

    const label = container.querySelector('.bc-progress-bar__label')
    expect(label).toBeNull()
  })

  it('should apply size variants', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => ProgressBar({ size: 'lg' })), container)

    const progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar).not.toBeNull()
    expect(progressBar!.className).toContain('bc-progress-bar--size-lg')
  })

  it('should apply custom roundedness', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(WithProviders(() => ProgressBar({ roundedness: 'sm' })), container)

    const progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar).not.toBeNull()
    expect(progressBar!.className).toContain('bc-control--rounded-sm')
  })

  it('should reactively update value', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const value = prop(25)

    render(WithProviders(() => ProgressBar({ value })), container)

    let fill = container.querySelector('.bc-progress-bar__fill') as HTMLElement
    expect(fill!.style.width).toBe('25%')

    value.set(75)
    await new Promise(resolve => setTimeout(resolve, 0))

    fill = container.querySelector('.bc-progress-bar__fill') as HTMLElement
    expect(fill!.style.width).toBe('75%')

    const progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar!.getAttribute('aria-valuenow')).toBe('75')
  })

  it('should reactively toggle indeterminate state', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const indeterminate = prop(false)

    render(WithProviders(() => ProgressBar({ indeterminate, value: 50 })), container)

    let progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar!.className).not.toContain('bc-progress-bar--indeterminate')
    expect(progressBar!.hasAttribute('aria-valuenow')).toBe(true)

    indeterminate.set(true)
    await new Promise(resolve => setTimeout(resolve, 0))

    progressBar = container.querySelector('.bc-progress-bar')
    expect(progressBar!.className).toContain('bc-progress-bar--indeterminate')
    expect(progressBar!.hasAttribute('aria-valuenow')).toBe(true)
  })

  it('should handle zero max value gracefully', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ value: 10, max: 0 })),
      container
    )

    const fill = container.querySelector('.bc-progress-bar__fill') as HTMLElement
    expect(fill!.style.width).toBe('0%')
  })

  it('should handle negative values gracefully', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ value: -10, max: 100 })),
      container
    )

    const fill = container.querySelector('.bc-progress-bar__fill') as HTMLElement
    expect(fill!.style.width).toBe('0%')
  })

  it('should not set width style for indeterminate state', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => ProgressBar({ indeterminate: true })),
      container
    )

    const fill = container.querySelector('.bc-progress-bar__fill') as HTMLElement
    expect(fill!.style.width).toBe('')
  })
})

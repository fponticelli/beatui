import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, Provide, prop } from '@tempots/dom'
import { RatingInput } from '../../src/components/form/input/rating-input'
import { Theme } from '../../src/components/theme/theme'

describe('RatingInput Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders custom boundaries', () => {
    const value = prop(0)
    const rating = RatingInput({ value, onChange: vi.fn(), max: 7 })

    render(Provide(Theme, {}, () => rating), container)

    const icons = container.querySelectorAll('.bc-rating-input__icon')
    expect(icons.length).toBe(7)
  })

  it('applies custom fill color and icons', () => {
    const value = prop(0)
    const rating = RatingInput({
      value,
      onChange: vi.fn(),
      fullColor: 'green',
      fullIcon: 'full.svg',
      emptyIcon: 'empty.svg',
    })

    render(Provide(Theme, {}, () => rating), container)

    const wrapper = container.querySelector('.bc-rating-input') as HTMLElement
    const style = wrapper.getAttribute('style') ?? ''
    expect(style).toContain('--rating-fill-color: green')
    expect(style).toContain('full.svg')
    expect(style).toContain('empty.svg')
  })

  it('masks fractional values', () => {
    const value = prop(3.5)
    const rating = RatingInput({ value, onChange: vi.fn() })

    render(Provide(Theme, {}, () => rating), container)

    const icons = container.querySelectorAll('.bc-rating-input__icon')
    const fourthFill = icons[3].querySelector(
      '.bc-rating-input__icon-fill'
    ) as HTMLElement
    expect(fourthFill.style.width).toBe('50%')
  })
})

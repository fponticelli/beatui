import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { RatingInput } from '../../src/components/form/input/rating-input'
import { WithProviders } from '../helpers/test-providers'

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

    render(
      WithProviders(() => RatingInput({ value, onChange: vi.fn(), max: 7 })),
      container
    )

    const icons = container.querySelectorAll('.bc-rating-input__icon-container')
    expect(icons.length).toBe(7)
  })

  it('applies custom color classes and renders icons', () => {
    const value = prop(0)

    render(
      WithProviders(() =>
        RatingInput({
          value,
          onChange: vi.fn(),
          fullColor: 'green',
          fullIcon: 'full.svg',
          emptyIcon: 'empty.svg',
        })
      ),
      container
    )

    const empties = container.querySelectorAll(
      '.bc-rating-input__icon-empty'
    ) as NodeListOf<HTMLElement>
    const clippers = container.querySelectorAll(
      '.bc-rating-input__icon-clipper'
    ) as NodeListOf<HTMLElement>
    const fulls = container.querySelectorAll(
      '.bc-rating-input__icon-full'
    ) as NodeListOf<HTMLElement>

    expect(empties.length).toBeGreaterThan(0)
    expect(clippers.length).toBeGreaterThan(0)
    expect(fulls.length).toBeGreaterThan(0)

    // fullColor applies on clipper container as text color utility
    expect(
      Array.from(clippers[0].classList).some(cls => cls.includes('bu-fg-soft-'))
    ).toBe(true)
  })

  it('masks fractional values', () => {
    const value = prop(3.5)

    render(
      WithProviders(() => RatingInput({ value, onChange: vi.fn() })),
      container
    )

    const clippers = container.querySelectorAll(
      '.bc-rating-input__icon-clipper'
    ) as NodeListOf<HTMLElement>
    expect(clippers[3].style.width).toBe('50%')
  })

  it('supports keyboard interaction (arrows, home/end)', () => {
    const value = prop(0)
    const onChange = vi.fn()

    render(
      WithProviders(() => RatingInput({ value, onChange, max: 5 })),
      container
    )

    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toBeTruthy()

    // ArrowRight increments by 1 (default rounding)
    const right = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })
    slider.dispatchEvent(right)
    expect(onChange).toHaveBeenCalledWith(1)

    // End jumps to max
    const end = new KeyboardEvent('keydown', {
      key: 'End',
      bubbles: true,
      cancelable: true,
    })
    slider.dispatchEvent(end)
    expect(onChange).toHaveBeenCalledWith(5)

    // Home jumps to 0
    const home = new KeyboardEvent('keydown', {
      key: 'Home',
      bubbles: true,
      cancelable: true,
    })
    slider.dispatchEvent(home)
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('exposes proper ARIA slider attributes and onBlur', () => {
    const value = prop(0)
    const onBlur = vi.fn()

    render(
      WithProviders(() =>
        RatingInput({ value, onChange: vi.fn(), max: 5, onBlur })
      ),
      container
    )

    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider.getAttribute('aria-valuemin')).toBe('0')
    expect(slider.getAttribute('aria-valuemax')).toBe('5')
    expect(slider.getAttribute('aria-valuenow')).toBe('0')

    slider.dispatchEvent(new FocusEvent('blur', { bubbles: true }))
    expect(onBlur).toHaveBeenCalled()
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop, html } from '@tempots/dom'
import { RangeSlider } from '../../src/components/form/input/range-slider'
import { WithProviders } from '../helpers/test-providers'

describe('RangeSlider Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  // ── Rendering ──

  describe('rendering', () => {
    it('should render track element', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const track = container.querySelector('.bc-range-slider__track')
      expect(track).not.toBeNull()
    })

    it('should render one thumb in single mode', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const thumbs = container.querySelectorAll('[role="slider"]')
      expect(thumbs.length).toBe(1)
    })

    it('should render two thumbs in range mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            range: [20, 80],
            onRangeChange: vi.fn(),
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll('[role="slider"]')
      expect(thumbs.length).toBe(2)
    })

    it('should render three thumbs in multi-point mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            points: [10, 40, 70],
            onPointsChange: vi.fn(),
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll('[role="slider"]')
      expect(thumbs.length).toBe(3)
    })

    it('should render fill element', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const fill = container.querySelector('.bc-range-slider__fill')
      expect(fill).not.toBeNull()
    })

    it('should position fill for single value', () => {
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange: vi.fn(), min: 0, max: 100 })
        ),
        container
      )

      const fill = container.querySelector(
        '.bc-range-slider__fill'
      ) as HTMLElement
      expect(fill.style.left).toBe('0%')
      expect(fill.style.width).toBe('50%')
    })

    it('should position thumb at correct percentage', () => {
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange: vi.fn(), min: 0, max: 100 })
        ),
        container
      )

      const thumbContainer = container.querySelector(
        '.bc-range-slider__thumb-container'
      ) as HTMLElement
      expect(thumbContainer.style.left).toBe('50%')
    })
  })

  // ── ARIA attributes ──

  describe('ARIA attributes', () => {
    it('should set aria-valuemin, aria-valuemax, aria-valuenow', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 30,
            onChange: vi.fn(),
            min: 10,
            max: 90,
          })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]')!
      expect(thumb.getAttribute('aria-valuemin')).toBe('10')
      expect(thumb.getAttribute('aria-valuemax')).toBe('90')
      expect(thumb.getAttribute('aria-valuenow')).toBe('30')
    })

    it('should set aria-label on each thumb with index', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            range: [20, 80],
            onRangeChange: vi.fn(),
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll('[role="slider"]')
      expect(thumbs[0]!.getAttribute('aria-label')).toBe('Thumb 1')
      expect(thumbs[1]!.getAttribute('aria-label')).toBe('Thumb 2')
    })

    it('should set aria-label on multi-point thumbs', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            points: [10, 50, 90],
            onPointsChange: vi.fn(),
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll('[role="slider"]')
      expect(thumbs[0]!.getAttribute('aria-label')).toBe('Thumb 1')
      expect(thumbs[1]!.getAttribute('aria-label')).toBe('Thumb 2')
      expect(thumbs[2]!.getAttribute('aria-label')).toBe('Thumb 3')
    })

    it('should have tabindex=0 on thumbs for keyboard focus', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const thumb = container.querySelector('[role="slider"]')!
      expect(thumb.getAttribute('tabindex')).toBe('0')
    })

    it('should set correct aria-valuenow for each range thumb', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            range: [25, 75],
            onRangeChange: vi.fn(),
            min: 0,
            max: 100,
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll('[role="slider"]')
      expect(thumbs[0]!.getAttribute('aria-valuenow')).toBe('25')
      expect(thumbs[1]!.getAttribute('aria-valuenow')).toBe('75')
    })
  })

  // ── Keyboard navigation: single mode ──

  describe('keyboard navigation (single mode)', () => {
    it('should increase value on ArrowRight', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, min: 0, max: 100, step: 1 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(51)
    })

    it('should decrease value on ArrowLeft', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, min: 0, max: 100, step: 1 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(49)
    })

    it('should increase value on ArrowUp', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, min: 0, max: 100, step: 5 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(55)
    })

    it('should decrease value on ArrowDown', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, min: 0, max: 100, step: 5 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(45)
    })

    it('should jump to min on Home', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, min: 10, max: 100 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(10)
    })

    it('should jump to max on End', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, min: 0, max: 90 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(90)
    })

    it('should clamp value at max boundary', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 100, onChange, min: 0, max: 100, step: 1 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(100)
    })

    it('should clamp value at min boundary', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 0, onChange, min: 0, max: 100, step: 1 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('should not respond to unrelated keys', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, min: 0, max: 100 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      )
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should respect custom step value', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, min: 0, max: 100, step: 10 })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(60)
    })
  })

  // ── Keyboard navigation: disabled / readonly ──

  describe('disabled and readonly interaction blocking', () => {
    it('should not call onChange when disabled', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, disabled: true })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should not call onChange when readonly', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange, readonly: true })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ── Keyboard navigation: range mode ──

  describe('keyboard navigation (range mode)', () => {
    it('should move first thumb independently', () => {
      const onRangeChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            range: [30, 70],
            onRangeChange,
            min: 0,
            max: 100,
            step: 1,
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll(
        '[role="slider"]'
      ) as NodeListOf<HTMLElement>
      thumbs[0]!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onRangeChange).toHaveBeenCalledWith([31, 70])
    })

    it('should move second thumb independently', () => {
      const onRangeChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            range: [30, 70],
            onRangeChange,
            min: 0,
            max: 100,
            step: 1,
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll(
        '[role="slider"]'
      ) as NodeListOf<HTMLElement>
      thumbs[1]!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      )
      expect(onRangeChange).toHaveBeenCalledWith([30, 69])
    })

    it('should auto-sort when thumbs cross', () => {
      const onRangeChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            range: [50, 51],
            onRangeChange,
            min: 0,
            max: 100,
            step: 5,
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll(
        '[role="slider"]'
      ) as NodeListOf<HTMLElement>
      thumbs[0]!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      const call = onRangeChange.mock.calls[0]![0] as [number, number]
      expect(call[0]).toBeLessThanOrEqual(call[1])
    })
  })

  // ── Keyboard navigation: multi-point mode ──

  describe('keyboard navigation (multi-point mode)', () => {
    it('should move individual points', () => {
      const onPointsChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            points: [20, 50, 80],
            onPointsChange,
            min: 0,
            max: 100,
            step: 1,
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll(
        '[role="slider"]'
      ) as NodeListOf<HTMLElement>
      thumbs[1]!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onPointsChange).toHaveBeenCalledWith([20, 51, 80])
    })

    it('should move first point to Home', () => {
      const onPointsChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            points: [20, 50, 80],
            onPointsChange,
            min: 0,
            max: 100,
          })
        ),
        container
      )

      const thumbs = container.querySelectorAll(
        '[role="slider"]'
      ) as NodeListOf<HTMLElement>
      thumbs[0]!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      )
      expect(onPointsChange).toHaveBeenCalledWith([0, 50, 80])
    })
  })

  // ── Value display ──

  describe('value display', () => {
    it('should show value label when showValue is true', () => {
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange: vi.fn(), showValue: true })
        ),
        container
      )

      const label = container.querySelector('.bc-range-slider__value-label')
      expect(label).not.toBeNull()
      expect(label!.textContent).toBe('50')
    })

    it('should hide value label when showValue is false', () => {
      render(
        WithProviders(() =>
          RangeSlider({ value: 50, onChange: vi.fn(), showValue: false })
        ),
        container
      )

      const label = container.querySelector('.bc-range-slider__value-label')
      expect(label).toBeNull()
    })

    it('should apply formatValue to label', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 75,
            onChange: vi.fn(),
            showValue: true,
            formatValue: (v: number) => `$${v}`,
          })
        ),
        container
      )

      const label = container.querySelector('.bc-range-slider__value-label')
      expect(label!.textContent).toBe('$75')
    })

    it('should show value labels for each range thumb', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            range: [25, 75],
            onRangeChange: vi.fn(),
            showValue: true,
          })
        ),
        container
      )

      const labels = container.querySelectorAll('.bc-range-slider__value-label')
      expect(labels.length).toBe(2)
      expect(labels[0]!.textContent).toBe('25')
      expect(labels[1]!.textContent).toBe('75')
    })

    it('should show value labels for each multi-point thumb', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            points: [10, 40, 90],
            onPointsChange: vi.fn(),
            showValue: true,
          })
        ),
        container
      )

      const labels = container.querySelectorAll('.bc-range-slider__value-label')
      expect(labels.length).toBe(3)
      expect(labels[0]!.textContent).toBe('10')
      expect(labels[1]!.textContent).toBe('40')
      expect(labels[2]!.textContent).toBe('90')
    })
  })

  // ── Tick marks ──

  describe('tick marks', () => {
    it('should render automatic ticks from step when ticks=true', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            step: 25,
            ticks: true,
          })
        ),
        container
      )

      const ticks = container.querySelectorAll('.bc-range-slider__tick')
      expect(ticks.length).toBe(5) // 0, 25, 50, 75, 100
    })

    it('should render custom ticks with labels', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            ticks: [
              { value: 0, label: 'Low' },
              { value: 50, label: 'Mid' },
              { value: 100, label: 'High' },
            ],
          })
        ),
        container
      )

      const ticks = container.querySelectorAll('.bc-range-slider__tick')
      expect(ticks.length).toBe(3)

      const labels = container.querySelectorAll('.bc-range-slider__tick-label')
      expect(labels.length).toBe(3)
      expect(labels[0]!.textContent).toBe('Low')
      expect(labels[1]!.textContent).toBe('Mid')
      expect(labels[2]!.textContent).toBe('High')
    })

    it('should render ticks without labels', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            ticks: [{ value: 25 }, { value: 75 }],
          })
        ),
        container
      )

      const ticks = container.querySelectorAll('.bc-range-slider__tick')
      expect(ticks.length).toBe(2)
      const labels = container.querySelectorAll('.bc-range-slider__tick-label')
      expect(labels.length).toBe(0)
    })

    it('should not render ticks when option is not set', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const ticks = container.querySelectorAll('.bc-range-slider__tick')
      expect(ticks.length).toBe(0)
    })
  })

  // ── Markers ──

  describe('markers', () => {
    it('should render automatic markers from step when markers=true', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            step: 25,
            markers: true,
          })
        ),
        container
      )

      const markers = container.querySelectorAll('.bc-range-slider__marker')
      expect(markers.length).toBe(5) // 0, 25, 50, 75, 100
    })

    it('should render custom markers with labels', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            markers: [
              { value: 20, label: '20%' },
              { value: 50, label: '50%' },
              { value: 80, label: '80%' },
            ],
          })
        ),
        container
      )

      const markers = container.querySelectorAll('.bc-range-slider__marker')
      expect(markers.length).toBe(3)

      const labels = container.querySelectorAll(
        '.bc-range-slider__marker-label'
      )
      expect(labels.length).toBe(3)
      expect(labels[0]!.textContent).toBe('20%')
      expect(labels[1]!.textContent).toBe('50%')
      expect(labels[2]!.textContent).toBe('80%')
    })

    it('should render markers without labels', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            markers: [{ value: 25 }, { value: 75 }],
          })
        ),
        container
      )

      const markers = container.querySelectorAll('.bc-range-slider__marker')
      expect(markers.length).toBe(2)
      const labels = container.querySelectorAll(
        '.bc-range-slider__marker-label'
      )
      expect(labels.length).toBe(0)
    })

    it('should not render markers when option is not set', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const markers = container.querySelectorAll('.bc-range-slider__marker')
      expect(markers.length).toBe(0)
    })

    it('should render markers and ticks together', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            step: 50,
            ticks: true,
            markers: [{ value: 25 }, { value: 75 }],
          })
        ),
        container
      )

      const ticks = container.querySelectorAll('.bc-range-slider__tick')
      const markers = container.querySelectorAll('.bc-range-slider__marker')
      expect(ticks.length).toBe(3) // 0, 50, 100
      expect(markers.length).toBe(2) // 25, 75
    })

    it('should position markers with style.left in horizontal mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            markers: [{ value: 40 }],
          })
        ),
        container
      )

      const marker = container.querySelector(
        '.bc-range-slider__marker'
      ) as HTMLElement
      expect(marker.style.left).toBe('40%')
    })

    it('should position markers with style.bottom in vertical mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            markers: [{ value: 60 }],
            orientation: 'vertical',
          })
        ),
        container
      )

      const marker = container.querySelector(
        '.bc-range-slider__marker'
      ) as HTMLElement
      expect(marker.style.bottom).toBe('60%')
    })
  })

  // ── Custom thumbs ──

  describe('custom thumbs', () => {
    it('should use thumb-custom class when renderThumb is provided', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            renderThumb: (_index, _val) => html.span('custom'),
          })
        ),
        container
      )

      const customThumb = container.querySelector(
        '.bc-range-slider__thumb-custom'
      )
      expect(customThumb).not.toBeNull()

      const defaultThumb = container.querySelector('.bc-range-slider__thumb')
      expect(defaultThumb).toBeNull()
    })

    it('should use default thumb class when renderThumb is not provided', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const defaultThumb = container.querySelector('.bc-range-slider__thumb')
      expect(defaultThumb).not.toBeNull()

      const customThumb = container.querySelector(
        '.bc-range-slider__thumb-custom'
      )
      expect(customThumb).toBeNull()
    })
  })

  // ── Segment styles ──

  describe('segment styles', () => {
    it('should render 3 segments in range mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            range: [25, 75],
            onRangeChange: vi.fn(),
            min: 0,
            max: 100,
            segmentStyles: [
              { color: 'danger' },
              { color: 'success' },
              { color: 'warning' },
            ],
          })
        ),
        container
      )

      const segments = container.querySelectorAll('.bc-range-slider__segment')
      expect(segments.length).toBe(3)
    })

    it('should render 2 segments in single-value mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            segmentStyles: [{ color: 'success' }, { color: 'danger' }],
          })
        ),
        container
      )

      const segments = container.querySelectorAll('.bc-range-slider__segment')
      expect(segments.length).toBe(2)
    })

    it('should render N+1 segments in multi-point mode (N sorted values + boundaries)', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            points: [20, 50, 80],
            onPointsChange: vi.fn(),
            min: 0,
            max: 100,
            segmentStyles: [
              { color: 'danger' },
              { color: 'success' },
              { color: 'warning' },
              { color: 'info' },
            ],
          })
        ),
        container
      )

      const segments = container.querySelectorAll('.bc-range-slider__segment')
      expect(segments.length).toBe(4) // [0,20], [20,50], [50,80], [80,100]
    })

    it('should render plain fill when segmentStyles is not provided', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const fill = container.querySelector('.bc-range-slider__fill')
      expect(fill).not.toBeNull()
      const segments = container.querySelectorAll('.bc-range-slider__segment')
      expect(segments.length).toBe(0)
    })

    it('should apply dashed pattern to segment', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            segmentStyles: [{ color: 'danger', pattern: 'dashed' }],
          })
        ),
        container
      )

      const segments = container.querySelectorAll('.bc-range-slider__segment')
      expect(segments.length).toBeGreaterThan(0)
      expect((segments[0] as HTMLElement).style.borderStyle).toBe('dashed')
    })

    it('should apply dotted pattern to segment', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            segmentStyles: [{ pattern: 'dotted' }],
          })
        ),
        container
      )

      const segment = container.querySelector(
        '.bc-range-slider__segment'
      ) as HTMLElement
      expect(segment.style.borderStyle).toBe('dotted')
    })

    it('should apply thickness to segment', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            segmentStyles: [{ thickness: '8px' }],
          })
        ),
        container
      )

      const segment = container.querySelector(
        '.bc-range-slider__segment'
      ) as HTMLElement
      expect(segment.style.height).toBe('8px')
    })
  })

  // ── Reactive value updates ──

  describe('reactive value updates', () => {
    it('should update thumb position when value prop changes', async () => {
      const value = prop(50)
      render(
        WithProviders(() =>
          RangeSlider({ value, onChange: v => value.set(v), min: 0, max: 100 })
        ),
        container
      )

      const thumbContainer = container.querySelector(
        '.bc-range-slider__thumb-container'
      ) as HTMLElement
      expect(thumbContainer.style.left).toBe('50%')

      value.set(75)
      await new Promise(r => queueMicrotask(r))
      expect(thumbContainer.style.left).toBe('75%')
    })

    it('should update fill when value prop changes', async () => {
      const value = prop(50)
      render(
        WithProviders(() =>
          RangeSlider({ value, onChange: v => value.set(v), min: 0, max: 100 })
        ),
        container
      )

      const fill = container.querySelector(
        '.bc-range-slider__fill'
      ) as HTMLElement
      expect(fill.style.width).toBe('50%')

      value.set(80)
      await new Promise(r => queueMicrotask(r))
      expect(fill.style.width).toBe('80%')
    })

    it('should update value label when value prop changes', async () => {
      const value = prop(50)
      render(
        WithProviders(() =>
          RangeSlider({ value, onChange: v => value.set(v), showValue: true })
        ),
        container
      )

      const label = container.querySelector('.bc-range-slider__value-label')!
      expect(label.textContent).toBe('50')

      value.set(99)
      await new Promise(r => queueMicrotask(r))
      expect(label.textContent).toBe('99')
    })

    it('should update range fill when range prop changes', async () => {
      const range = prop<[number, number]>([20, 80])
      render(
        WithProviders(() =>
          RangeSlider({
            range,
            onRangeChange: v => range.set(v),
            min: 0,
            max: 100,
          })
        ),
        container
      )

      const fill = container.querySelector(
        '.bc-range-slider__fill'
      ) as HTMLElement
      expect(fill.style.left).toBe('20%')
      expect(fill.style.width).toBe('60%')

      range.set([10, 90])
      await new Promise(r => queueMicrotask(r))
      expect(fill.style.left).toBe('10%')
      expect(fill.style.width).toBe('80%')
    })
  })

  // ── Default values ──

  describe('default values', () => {
    it('should use default min=0 and max=100', () => {
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange: vi.fn() })),
        container
      )

      const thumb = container.querySelector('[role="slider"]')!
      expect(thumb.getAttribute('aria-valuemin')).toBe('0')
      expect(thumb.getAttribute('aria-valuemax')).toBe('100')
    })

    it('should use default step=1', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() => RangeSlider({ value: 50, onChange })),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(51)
    })
  })

  // ── Vertical orientation ──

  describe('vertical orientation', () => {
    it('renders track in vertical mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            orientation: 'vertical',
          })
        ),
        container
      )

      const track = container.querySelector('.bc-range-slider__track')
      expect(track).not.toBeNull()
    })

    it('adds bc-range-slider--vertical class when vertical', () => {
      const wrapper = document.createElement('div')
      container.appendChild(wrapper)
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            orientation: 'vertical',
          })
        ),
        wrapper
      )

      // WithElement applies attr.class to its root element (wrapper)
      expect(wrapper.classList.contains('bc-range-slider--vertical')).toBe(true)
    })

    it('does not add bc-range-slider--vertical class when horizontal', () => {
      const wrapper = document.createElement('div')
      container.appendChild(wrapper)
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            orientation: 'horizontal',
          })
        ),
        wrapper
      )

      // WithElement applies attr.class to its root element (wrapper)
      expect(wrapper.classList.contains('bc-range-slider--vertical')).toBe(
        false
      )
    })

    it('positions thumb with style.bottom in vertical mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            orientation: 'vertical',
          })
        ),
        container
      )

      const thumbContainer = container.querySelector(
        '.bc-range-slider__thumb-container'
      ) as HTMLElement
      expect(thumbContainer.style.bottom).toBe('50%')
      expect(thumbContainer.style.left).toBe('')
    })

    it('positions fill with bottom/height in vertical mode (single value)', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 25,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            orientation: 'vertical',
          })
        ),
        container
      )

      const fill = container.querySelector(
        '.bc-range-slider__fill'
      ) as HTMLElement
      expect(fill.style.bottom).toBe('0%')
      expect(fill.style.height).toBe('25%')
      expect(fill.style.left).toBe('')
      expect(fill.style.width).toBe('')
    })

    it('positions range fill with bottom/height in vertical mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            range: [25, 75],
            onRangeChange: vi.fn(),
            min: 0,
            max: 100,
            orientation: 'vertical',
          })
        ),
        container
      )

      const fill = container.querySelector(
        '.bc-range-slider__fill'
      ) as HTMLElement
      expect(fill.style.bottom).toBe('25%')
      expect(fill.style.height).toBe('50%')
    })

    it('keyboard ArrowUp increases value in vertical mode', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange,
            min: 0,
            max: 100,
            step: 1,
            orientation: 'vertical',
          })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(51)
    })

    it('keyboard ArrowDown decreases value in vertical mode', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange,
            min: 0,
            max: 100,
            step: 1,
            orientation: 'vertical',
          })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(49)
    })

    it('keyboard ArrowRight increases value in vertical mode', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange,
            min: 0,
            max: 100,
            step: 5,
            orientation: 'vertical',
          })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(55)
    })

    it('keyboard ArrowLeft decreases value in vertical mode', () => {
      const onChange = vi.fn()
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange,
            min: 0,
            max: 100,
            step: 5,
            orientation: 'vertical',
          })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]') as HTMLElement
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      )
      expect(onChange).toHaveBeenCalledWith(45)
    })

    it('sets aria-orientation=vertical on thumbs when vertical', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            orientation: 'vertical',
          })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]')!
      expect(thumb.getAttribute('aria-orientation')).toBe('vertical')
    })

    it('does not set aria-orientation on horizontal thumbs', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            orientation: 'horizontal',
          })
        ),
        container
      )

      const thumb = container.querySelector('[role="slider"]')!
      expect(thumb.getAttribute('aria-orientation')).toBeNull()
    })

    it('positions ticks with style.bottom in vertical mode', () => {
      render(
        WithProviders(() =>
          RangeSlider({
            value: 50,
            onChange: vi.fn(),
            min: 0,
            max: 100,
            ticks: [{ value: 0 }, { value: 50 }, { value: 100 }],
            orientation: 'vertical',
          })
        ),
        container
      )

      const ticks = container.querySelectorAll(
        '.bc-range-slider__tick'
      ) as NodeListOf<HTMLElement>
      expect(ticks.length).toBe(3)
      // tick at value=0 should be at bottom: 0%
      expect(ticks[0]!.style.bottom).toBe('0%')
      expect(ticks[0]!.style.left).toBe('')
      // tick at value=50 should be at bottom: 50%
      expect(ticks[1]!.style.bottom).toBe('50%')
      // tick at value=100 should be at bottom: 100%
      expect(ticks[2]!.style.bottom).toBe('100%')
    })

    it('updates thumb bottom position reactively in vertical mode', async () => {
      const value = prop(50)
      render(
        WithProviders(() =>
          RangeSlider({
            value,
            onChange: v => value.set(v),
            min: 0,
            max: 100,
            orientation: 'vertical',
          })
        ),
        container
      )

      const thumbContainer = container.querySelector(
        '.bc-range-slider__thumb-container'
      ) as HTMLElement
      expect(thumbContainer.style.bottom).toBe('50%')

      value.set(80)
      await new Promise(r => queueMicrotask(r))
      expect(thumbContainer.style.bottom).toBe('80%')
    })
  })
})

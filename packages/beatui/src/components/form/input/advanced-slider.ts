import {
  attr,
  computedOf,
  html,
  on,
  prop,
  style,
  Value,
  Fragment,
  aria,
  WithElement,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { ThemeColorName } from '../../../tokens'
import { backgroundValue } from '../../theme/style-utils'

/**
 * Definition of a tick mark on the slider track.
 */
export interface SliderTick {
  /** The numeric value where this tick appears */
  value: number
  /** Optional label displayed below the tick mark */
  label?: string
}

/**
 * Configuration options for the {@link AdvancedSlider} component.
 *
 * Supports single value, range (two thumbs), and multi-point (arbitrary number
 * of thumbs) modes. Features tick marks, value labels, and customizable colors.
 */
export interface AdvancedSliderOptions {
  /** Minimum value of the slider range */
  min?: number
  /** Maximum value of the slider range */
  max?: number
  /** Step increment between valid values. @default 1 */
  step?: number
  /** Whether the slider is disabled. @default false */
  disabled?: Value<boolean>
  /** Visual size of the slider. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color for the filled track and thumbs. @default 'primary' */
  color?: Value<ThemeColorName>

  /**
   * Single value mode: the current slider value.
   * Use this for a simple single-thumb slider.
   */
  value?: Value<number>
  /** Callback for single-value mode changes */
  onChange?: (value: number) => void

  /**
   * Range mode: a two-element array `[low, high]`.
   * When provided, two thumbs are rendered.
   */
  range?: Value<[number, number]>
  /** Callback for range mode changes */
  onRangeChange?: (range: [number, number]) => void

  /**
   * Multi-point mode: an array of values, each getting its own thumb.
   * When provided, multiple thumbs are rendered at initialization time.
   * The number of points is fixed after component creation.
   */
  points?: Value<number[]>
  /** Callback for multi-point mode changes */
  onPointsChange?: (points: number[]) => void

  /**
   * Tick marks along the slider track.
   * Can be `true` for automatic step-based ticks, or an array of custom tick definitions.
   */
  ticks?: boolean | SliderTick[]

  /**
   * Whether to show the current value label(s) above the thumb(s).
   * @default false
   */
  showValue?: boolean

  /**
   * Custom formatter for the displayed value labels.
   * @default (v) => String(v)
   */
  formatValue?: (value: number) => string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function snapToStep(value: number, min: number, step: number): number {
  return Math.round((value - min) / step) * step + min
}

function pctOf(value: number, min: number, max: number): number {
  if (max === min) return 0
  return ((value - min) / (max - min)) * 100
}

function generateSliderClasses(
  size: ControlSize,
  disabled: boolean
): string {
  const classes = [
    'bc-advanced-slider',
    `bc-advanced-slider--size-${size}`,
  ]
  if (disabled) classes.push('bc-advanced-slider--disabled')
  return classes.join(' ')
}

function generateSliderStyles(color: ThemeColorName): string {
  const light = backgroundValue(color, 'solid', 'light')
  const dark = backgroundValue(color, 'solid', 'dark')
  const styles = new Map<string, string>()
  styles.set('--slider-color', light.backgroundColor)
  styles.set('--slider-color-dark', dark.backgroundColor)
  return Array.from(styles.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}

/**
 * An advanced slider component supporting single value, range selection,
 * and multi-point modes with tick marks and value display.
 *
 * - **Single mode**: Pass `value` and `onChange` for a standard single-thumb slider.
 * - **Range mode**: Pass `range` and `onRangeChange` for a two-thumb range selector.
 * - **Multi-point mode**: Pass `points` and `onPointsChange` for arbitrary number of thumbs.
 *
 * Additional features include configurable tick marks (automatic or custom),
 * value labels above the thumbs, step snapping, and theme-aware coloring.
 *
 * @param options - Configuration for the slider
 * @returns A styled slider element
 *
 * @example
 * ```ts
 * // Simple slider with value display
 * const vol = prop(50)
 * AdvancedSlider({
 *   value: vol, onChange: vol.set,
 *   min: 0, max: 100,
 *   showValue: true,
 *   ticks: true,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Range slider
 * const priceRange = prop<[number, number]>([20, 80])
 * AdvancedSlider({
 *   range: priceRange, onRangeChange: priceRange.set,
 *   min: 0, max: 100, step: 5,
 *   ticks: [
 *     { value: 0, label: '$0' },
 *     { value: 50, label: '$50' },
 *     { value: 100, label: '$100' },
 *   ],
 *   showValue: true,
 *   formatValue: v => `$${v}`,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Multi-point slider
 * const pts = prop([10, 40, 70])
 * AdvancedSlider({
 *   points: pts, onPointsChange: pts.set,
 *   min: 0, max: 100,
 *   showValue: true,
 *   color: 'green',
 * })
 * ```
 */
export function AdvancedSlider({
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  size = 'md',
  color = 'primary',
  value,
  onChange,
  range,
  points,
  onRangeChange,
  onPointsChange,
  ticks,
  showValue = false,
  formatValue = (v: number) => String(v),
}: AdvancedSliderOptions) {
  // Determine mode and number of thumbs
  const mode: 'single' | 'range' | 'multi' =
    points != null ? 'multi' : range != null ? 'range' : 'single'

  // Determine thumb count at creation time
  const thumbCount =
    mode === 'multi'
      ? Value.get(points!).length
      : mode === 'range'
        ? 2
        : 1

  // Build tick marks
  const tickMarks: SliderTick[] = []
  if (ticks === true) {
    for (let v = min; v <= max; v += step) {
      tickMarks.push({ value: v })
    }
  } else if (Array.isArray(ticks)) {
    tickMarks.push(...ticks)
  }

  // Internal reactive values representing all thumb positions
  const thumbValues: Value<number[]> = (() => {
    if (mode === 'multi') {
      return Value.map(points!, (pts: number[]) => [...pts])
    }
    if (mode === 'range') {
      return Value.map(range!, (r: [number, number]) => [r[0], r[1]])
    }
    return Value.map(value ?? 0, (v: number) => [v])
  })()

  const activeThumb = prop<number | null>(null)

  function emitChange(values: number[]) {
    if (mode === 'multi') {
      onPointsChange?.(values)
    } else if (mode === 'range') {
      const sorted = [values[0]!, values[1]!] as [number, number]
      if (sorted[0] > sorted[1]) {
        sorted.reverse()
      }
      onRangeChange?.(sorted as [number, number])
    } else {
      onChange?.(values[0]!)
    }
  }

  function handlePointerAction(
    trackEl: HTMLElement,
    clientX: number,
    thumbIndex: number | null
  ) {
    const rect = trackEl.getBoundingClientRect()
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1)
    const rawValue = min + pct * (max - min)
    const snapped = clamp(snapToStep(rawValue, min, step), min, max)

    const currentValues = Value.get(thumbValues)

    if (thumbIndex != null) {
      const newValues = [...currentValues]
      newValues[thumbIndex] = snapped
      emitChange(newValues)
    } else {
      // Find closest thumb
      let closest = 0
      let closestDist = Math.abs(currentValues[0]! - snapped)
      for (let i = 1; i < currentValues.length; i++) {
        const dist = Math.abs(currentValues[i]! - snapped)
        if (dist < closestDist) {
          closest = i
          closestDist = dist
        }
      }
      const newValues = [...currentValues]
      newValues[closest] = snapped
      activeThumb.set(closest)
      emitChange(newValues)
    }
  }

  // Create a reactive value for each individual thumb position
  function thumbValueAt(index: number): Value<number> {
    return Value.map(thumbValues, (vals: number[]) => vals[index] ?? min)
  }

  // Build thumb elements statically based on thumbCount
  function createThumb(index: number) {
    const thumbVal = thumbValueAt(index)
    const thumbPct = Value.map(thumbVal, (v: number) => `${pctOf(v, min, max)}%`)

    return html.div(
      attr.class('bc-advanced-slider__thumb-container'),
      style.left(thumbPct),

      // Value label
      showValue
        ? html.div(
            attr.class('bc-advanced-slider__value-label'),
            Value.map(thumbVal, (v: number) => formatValue(v))
          )
        : Fragment(),

      html.div(
        attr.class('bc-advanced-slider__thumb'),
        attr.role('slider'),
        attr.tabindex(0),
        aria.valuemin(min),
        aria.valuemax(max),
        aria.valuenow(thumbVal),
        aria.label(`Thumb ${index + 1}`),
        on.keydown((e: KeyboardEvent) => {
          if (Value.get(disabled)) return
          const currentVals = Value.get(thumbValues)
          const current = currentVals[index]!
          let newVal = current

          switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
              e.preventDefault()
              newVal = clamp(current + step, min, max)
              break
            case 'ArrowLeft':
            case 'ArrowDown':
              e.preventDefault()
              newVal = clamp(current - step, min, max)
              break
            case 'Home':
              e.preventDefault()
              newVal = min
              break
            case 'End':
              e.preventDefault()
              newVal = max
              break
            default:
              return
          }

          const newValues = [...currentVals]
          newValues[index] = newVal
          emitChange(newValues)
        }),
        on.pointerdown((e: PointerEvent) => {
          e.stopPropagation()
          if (Value.get(disabled)) return
          activeThumb.set(index)
        })
      )
    )
  }

  return WithElement(trackEl => {
    const onPointerDown = (e: PointerEvent) => {
      if (Value.get(disabled)) return
      e.preventDefault()

      handlePointerAction(trackEl, e.clientX, null)

      const onPointerMove = (moveEvt: PointerEvent) => {
        handlePointerAction(trackEl, moveEvt.clientX, activeThumb.value)
      }

      const onPointerUp = () => {
        activeThumb.set(null)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    }

    // Compute filled track style
    const filledStyle = computedOf(thumbValues)((vals: number[]) => {
      if (mode === 'range' && vals.length === 2) {
        const lo = pctOf(Math.min(vals[0]!, vals[1]!), min, max)
        const hi = pctOf(Math.max(vals[0]!, vals[1]!), min, max)
        return `left: ${lo}%; width: ${hi - lo}%`
      }
      if (mode === 'multi' && vals.length >= 2) {
        const sorted = [...vals].sort((a, b) => a - b)
        const lo = pctOf(sorted[0]!, min, max)
        const hi = pctOf(sorted[sorted.length - 1]!, min, max)
        return `left: ${lo}%; width: ${hi - lo}%`
      }
      // Single: fill from left
      const pct = pctOf(vals[0] ?? min, min, max)
      return `left: 0%; width: ${pct}%`
    })

    // Build thumb elements
    const thumbElements = Array.from({ length: thumbCount }, (_, i) =>
      createThumb(i)
    )

    return Fragment(
      attr.class(
        computedOf(size, disabled)((s: ControlSize, d: boolean) =>
          generateSliderClasses(s ?? 'md', d ?? false)
        )
      ),
      attr.style(
        computedOf(color)((c: ThemeColorName) => generateSliderStyles(c ?? 'primary'))
      ),
      attr.role('group'),
      aria.label('Slider'),
      on.pointerdown(onPointerDown),

      // Track
      html.div(
        attr.class('bc-advanced-slider__track'),
        // Filled portion
        html.div(
          attr.class('bc-advanced-slider__fill'),
          attr.style(filledStyle)
        ),

        // Tick marks
        tickMarks.length > 0
          ? html.div(
              attr.class('bc-advanced-slider__ticks'),
              ...tickMarks.map(tick => {
                const pct = pctOf(tick.value, min, max)
                return html.div(
                  attr.class('bc-advanced-slider__tick'),
                  style.left(`${pct}%`),
                  tick.label != null
                    ? html.span(
                        attr.class('bc-advanced-slider__tick-label'),
                        tick.label
                      )
                    : Fragment()
                )
              })
            )
          : Fragment(),

        // Thumbs (statically rendered, reactively positioned)
        ...thumbElements
      )
    )
  })
}

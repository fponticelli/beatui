import {
  attr,
  computedOf,
  html,
  on,
  prop,
  style,
  Value,
  Empty,
  Fragment,
  aria,
  WithElement,
  MapSignal,
  When,
  TNode,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { ThemeColorName } from '../../../tokens'
import { backgroundValue } from '../../theme/style-utils'
import { roundToStep } from './step-utils'

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
  min?: Value<number>
  /** Maximum value of the slider range */
  max?: Value<number>
  /** Step increment between valid values. @default 1 */
  step?: Value<number>
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
  ticks?: Value<boolean | SliderTick[]>

  /**
   * Whether to show the current value label(s) above the thumb(s).
   * @default false
   */
  showValue?: Value<boolean>

  /**
   * Custom formatter for the displayed value labels.
   * @default (v) => String(v)
   */
  formatValue?: (value: number) => string

  /**
   * Colors for individual segments between consecutive thumbs in multi-point mode.
   * Each entry corresponds to the segment between thumb[i] and thumb[i+1].
   * If fewer colors than segments are provided, remaining segments use the default color.
   * If not provided, a single fill spanning all thumbs is used (existing behavior).
   */
  segmentColors?: Value<ThemeColorName[]>

  /**
   * Custom renderer for the thumb element. When provided, replaces the default
   * circular thumb with your custom content. The rendered content is placed
   * inside the thumb container that handles positioning, ARIA attributes,
   * keyboard navigation, and pointer events.
   *
   * @param index - The zero-based index of the thumb
   * @param value - A reactive value holding the current thumb position
   * @returns A TNode to render as the thumb
   */
  renderThumb?: (index: number, value: Value<number>) => TNode
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function snapToStep(value: number, min: number, step: number): number {
  return roundToStep(Math.round((value - min) / step) * step + min, step)
}

function pctOf(value: number, min: number, max: number): number {
  if (max === min) return 0
  return ((value - min) / (max - min)) * 100
}

function generateSliderClasses(size: ControlSize, disabled: boolean): string {
  const classes = ['bc-advanced-slider', `bc-advanced-slider--size-${size}`]
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
  min: minOpt = 0,
  max: maxOpt = 100,
  step: stepOpt = 1,
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
  segmentColors,
  renderThumb,
}: AdvancedSliderOptions) {
  // Determine mode and number of thumbs
  const mode: 'single' | 'range' | 'multi' =
    points != null ? 'multi' : range != null ? 'range' : 'single'

  // Determine thumb count at creation time
  const thumbCount =
    mode === 'multi' ? Value.get(points!).length : mode === 'range' ? 2 : 1

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
    const mn = Value.get(minOpt)
    const mx = Value.get(maxOpt)
    const st = Value.get(stepOpt)
    const rect = trackEl.getBoundingClientRect()
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1)
    const rawValue = mn + pct * (mx - mn)
    const snapped = clamp(snapToStep(rawValue, mn, st), mn, mx)

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
    return computedOf(
      thumbValues,
      minOpt
    )((vals: number[], mn: number) => vals[index] ?? mn)
  }

  // Build thumb elements statically based on thumbCount
  function createThumb(index: number, trackEl: HTMLElement) {
    const thumbVal = thumbValueAt(index)
    const thumbPct = computedOf(
      thumbVal,
      minOpt,
      maxOpt
    )((v: number, mn: number, mx: number) => `${pctOf(v, mn, mx)}%`)

    return html.div(
      attr.class('bc-advanced-slider__thumb-container'),
      style.left(thumbPct),

      // Value label
      When(
        showValue,
        () =>
          html.div(
            attr.class('bc-advanced-slider__value-label'),
            Value.map(thumbVal, (v: number) => formatValue(v))
          ),
        () => Empty
      ),

      html.div(
        attr.class(
          renderThumb
            ? 'bc-advanced-slider__thumb-custom'
            : 'bc-advanced-slider__thumb'
        ),
        attr.role('slider'),
        attr.tabindex(0),
        aria.valuemin(minOpt),
        aria.valuemax(maxOpt),
        aria.valuenow(thumbVal),
        aria.label(`Thumb ${index + 1}`),
        on.keydown((e: KeyboardEvent) => {
          if (Value.get(disabled)) return
          const mn = Value.get(minOpt)
          const mx = Value.get(maxOpt)
          const st = Value.get(stepOpt)
          const currentVals = Value.get(thumbValues)
          const current = currentVals[index]!
          let newVal: number

          switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
              e.preventDefault()
              newVal = clamp(roundToStep(current + st, st), mn, mx)
              break
            case 'ArrowLeft':
            case 'ArrowDown':
              e.preventDefault()
              newVal = clamp(roundToStep(current - st, st), mn, mx)
              break
            case 'Home':
              e.preventDefault()
              newVal = mn
              break
            case 'End':
              e.preventDefault()
              newVal = mx
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
          e.preventDefault()
          if (Value.get(disabled)) return
          activeThumb.set(index)

          const onPointerMove = (moveEvt: PointerEvent) => {
            handlePointerAction(trackEl, moveEvt.clientX, index)
          }

          const onPointerUp = () => {
            activeThumb.set(null)
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
          }

          window.addEventListener('pointermove', onPointerMove)
          window.addEventListener('pointerup', onPointerUp)
        }),
        renderThumb ? renderThumb(index, thumbVal) : Empty
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

    // Compute filled track style or segments
    const useSegments =
      segmentColors != null && (mode === 'range' || mode === 'multi')

    const filledStyle = useSegments
      ? ''
      : computedOf(
          thumbValues,
          minOpt,
          maxOpt
        )((vals: number[], mn: number, mx: number) => {
          if (mode === 'range' && vals.length === 2) {
            const lo = pctOf(Math.min(vals[0]!, vals[1]!), mn, mx)
            const hi = pctOf(Math.max(vals[0]!, vals[1]!), mn, mx)
            return `left: ${lo}%; width: ${hi - lo}%`
          }
          if (mode === 'multi' && vals.length >= 2) {
            const sorted = [...vals].sort((a, b) => a - b)
            const lo = pctOf(sorted[0]!, mn, mx)
            const hi = pctOf(sorted[sorted.length - 1]!, mn, mx)
            return `left: ${lo}%; width: ${hi - lo}%`
          }
          // Single: fill from left
          const pct = pctOf(vals[0] ?? mn, mn, mx)
          return `left: 0%; width: ${pct}%`
        })

    // Build thumb elements
    const thumbElements = Array.from({ length: thumbCount }, (_, i) =>
      createThumb(i, trackEl)
    )

    // Reactive tick marks
    const tickContent = ticks
      ? MapSignal(
          computedOf(
            ticks,
            minOpt,
            maxOpt,
            stepOpt
          )((t: boolean | SliderTick[], mn: number, mx: number, st: number) => {
            if (t === true) {
              const marks: SliderTick[] = []
              for (let v = mn; v <= mx; v += st) {
                marks.push({ value: v })
              }
              return { marks, mn, mx }
            }
            if (Array.isArray(t)) {
              return { marks: t, mn, mx }
            }
            return { marks: [] as SliderTick[], mn, mx }
          }),
          ({ marks, mn, mx }) => {
            if (marks.length === 0) return Empty
            return html.div(
              attr.class('bc-advanced-slider__ticks'),
              ...marks.map(tick => {
                const pct = pctOf(tick.value, mn, mx)
                return html.div(
                  attr.class('bc-advanced-slider__tick'),
                  style.left(`${pct}%`),
                  tick.label != null
                    ? html.span(
                        attr.class('bc-advanced-slider__tick-label'),
                        tick.label
                      )
                    : Empty
                )
              })
            )
          }
        )
      : Empty

    // Reactive segment rendering
    const segmentContent = useSegments
      ? MapSignal(
          computedOf(
            thumbValues,
            minOpt,
            maxOpt
          )((vals: number[], mn: number, mx: number) => ({ vals, mn, mx })),
          ({ vals, mn, mx }) => {
            const sorted = [...vals].sort((a, b) => a - b)
            const segments: {
              left: number
              width: number
              color: ThemeColorName
            }[] = []

            for (let i = 0; i < sorted.length - 1; i++) {
              const leftVal = sorted[i]!
              const rightVal = sorted[i + 1]!
              const leftPct = pctOf(leftVal, mn, mx)
              const rightPct = pctOf(rightVal, mn, mx)
              const colors = Value.get(segmentColors!)
              const segmentColor = colors[i] ?? Value.get(color) ?? 'primary'

              segments.push({
                left: leftPct,
                width: rightPct - leftPct,
                color: segmentColor,
              })
            }

            return Fragment(
              ...segments.map(seg => {
                const light = backgroundValue(seg.color, 'solid', 'light')
                const dark = backgroundValue(seg.color, 'solid', 'dark')
                const segmentStyle = `left: ${seg.left}%; width: ${seg.width}%; --slider-color: ${light.backgroundColor}; --slider-color-dark: ${dark.backgroundColor}`

                return html.div(
                  attr.class('bc-advanced-slider__fill'),
                  attr.style(segmentStyle)
                )
              })
            )
          }
        )
      : html.div(
          attr.class('bc-advanced-slider__fill'),
          attr.style(filledStyle)
        )

    return Fragment(
      attr.class(computedOf(size, disabled)(generateSliderClasses)),
      attr.style(Value.map(color, generateSliderStyles)),
      attr.role('group'),
      aria.label('Slider'),
      on.pointerdown(onPointerDown),

      // Track
      html.div(
        attr.class('bc-advanced-slider__track'),
        segmentContent,
        tickContent,
        // Thumbs (statically rendered, reactively positioned)
        ...thumbElements
      )
    )
  })
}

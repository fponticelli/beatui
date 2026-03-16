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
 * Orientation of the range slider.
 */
export type RangeSliderOrientation = 'horizontal' | 'vertical'

/**
 * Definition of a tick mark on the range slider track.
 */
export interface RangeSliderTick {
  /** The numeric value where this tick appears */
  value: number
  /** Optional label displayed near the tick mark */
  label?: string
}

/**
 * Definition of a marker dot on the range slider track.
 * Markers are small circles rendered directly on the track,
 * unlike ticks which extend outward from the track.
 */
export interface RangeSliderMarker {
  /** The numeric value where this marker appears */
  value: number
  /** Optional label displayed below (horizontal) or beside (vertical) the marker */
  label?: string
}

/**
 * Style configuration for an individual track segment.
 */
export interface RangeSliderSegmentStyle {
  /** Theme color for this segment */
  color?: ThemeColorName
  /** CSS height override for this segment's thickness (e.g. '6px', '0.5rem') */
  thickness?: string
  /** CSS border-style pattern for this segment (e.g. 'solid', 'dashed', 'dotted') */
  pattern?: 'solid' | 'dashed' | 'dotted'
}

/**
 * Configuration options for the {@link RangeSlider} component.
 *
 * Supports single-value, dual-thumb (range), and multi-point modes with
 * customizable thumbs, segment styles, tick marks, and full keyboard
 * accessibility.
 */
export interface RangeSliderOptions {
  /** Minimum value of the slider range. @default 0 */
  min?: Value<number>
  /** Maximum value of the slider range. @default 100 */
  max?: Value<number>
  /** Step increment between valid values. @default 1 */
  step?: Value<number>
  /** Whether the slider is disabled. @default false */
  disabled?: Value<boolean>
  /** Whether the slider is readonly (visible but non-interactive). @default false */
  readonly?: Value<boolean>
  /** Visual size of the slider. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color for the filled track and thumbs. @default 'primary' */
  color?: Value<ThemeColorName>

  /**
   * Single-value mode: the current slider value.
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
   * Tick marks along the slider track (extend outward from the track).
   * Can be `true` for automatic step-based ticks, or an array of custom tick definitions.
   */
  ticks?: Value<boolean | RangeSliderTick[]>

  /**
   * Marker dots rendered directly on the track surface.
   * Can be `true` for automatic step-based markers, or an array of custom marker definitions.
   * Unlike ticks, markers are small circles that sit on the track itself.
   */
  markers?: Value<boolean | RangeSliderMarker[]>

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
   * Custom styles for individual track segments.
   *
   * For single-value mode: index 0 = filled segment, index 1 = unfilled segment.
   * For range mode: index 0 = before low, index 1 = between thumbs, index 2 = after high.
   * For multi-point mode: segments between consecutive sorted thumbs, plus
   * one before the first and one after the last.
   */
  segmentStyles?: Value<RangeSliderSegmentStyle[]>

  /**
   * Custom renderer for the thumb element. When provided, replaces the default
   * circular thumb with custom content. The rendered content is placed inside
   * the thumb container that handles positioning, ARIA attributes, keyboard
   * navigation, and pointer events.
   *
   * @param index - The zero-based index of the thumb
   * @param value - A reactive value holding the current thumb position
   * @returns A TNode to render as the thumb
   */
  renderThumb?: (index: number, value: Value<number>) => TNode

  /**
   * Orientation of the slider. When 'vertical', the track runs top-to-bottom
   * visually but min is at the bottom and max is at the top.
   * The container element must have a defined height for vertical mode.
   * @default 'horizontal'
   */
  orientation?: Value<RangeSliderOrientation>
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

function generateClasses(
  size: ControlSize,
  disabled: boolean,
  readonly: boolean,
  orientation: RangeSliderOrientation
): string {
  const classes = ['bc-range-slider', `bc-range-slider--size-${size}`]
  if (disabled) classes.push('bc-range-slider--disabled')
  if (readonly) classes.push('bc-range-slider--readonly')
  if (orientation === 'vertical') classes.push('bc-range-slider--vertical')
  return classes.join(' ')
}

function generateColorStyles(color: ThemeColorName): string {
  const light = backgroundValue(color, 'solid', 'light')
  const dark = backgroundValue(color, 'solid', 'dark')
  return `--rs-color: ${light.backgroundColor}; --rs-color-dark: ${dark.backgroundColor}`
}

/**
 * A range slider component supporting single-value, dual-thumb range,
 * and multi-point modes with customizable thumbs, segment styles, tick
 * marks, and keyboard accessibility.
 *
 * - **Single mode**: Pass `value` and `onChange` for a standard single-thumb slider.
 * - **Range mode**: Pass `range` and `onRangeChange` for a two-thumb range selector.
 * - **Multi-point mode**: Pass `points` and `onPointsChange` for arbitrary number of thumbs.
 *
 * @param options - Configuration for the range slider
 * @returns A styled range slider element
 *
 * @example
 * ```ts
 * // Simple single-value slider
 * const vol = prop(50)
 * RangeSlider({
 *   value: vol, onChange: vol.set,
 *   min: 0, max: 100,
 *   showValue: true,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Dual-thumb range selector
 * const priceRange = prop<[number, number]>([20, 80])
 * RangeSlider({
 *   range: priceRange, onRangeChange: priceRange.set,
 *   min: 0, max: 100,
 *   showValue: true,
 *   formatValue: v => `$${v}`,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Multi-point slider
 * const pts = prop([10, 40, 70])
 * RangeSlider({
 *   points: pts, onPointsChange: pts.set,
 *   min: 0, max: 100,
 *   showValue: true,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Vertical slider (container must have a defined height)
 * const vol = prop(50)
 * html.div(
 *   attr.style('height: 200px'),
 *   RangeSlider({
 *     value: vol, onChange: vol.set,
 *     min: 0, max: 100,
 *     orientation: 'vertical',
 *   })
 * )
 * ```
 */
export function RangeSlider({
  min: minOpt = 0,
  max: maxOpt = 100,
  step: stepOpt = 1,
  disabled = false,
  readonly: readonlyOpt = false,
  size = 'md',
  color = 'primary',
  value,
  onChange,
  range,
  onRangeChange,
  points,
  onPointsChange,
  ticks,
  markers,
  showValue = false,
  formatValue = (v: number) => String(v),
  segmentStyles,
  renderThumb,
  orientation: orientationOpt = 'horizontal',
}: RangeSliderOptions) {
  // Determine mode and number of thumbs
  const mode: 'single' | 'range' | 'multi' =
    points != null ? 'multi' : range != null ? 'range' : 'single'

  const thumbCount =
    mode === 'multi' ? Value.get(points!).length : mode === 'range' ? 2 : 1

  // Read orientation once at creation time — not reactive
  const isVertical = Value.get(orientationOpt) === 'vertical'

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
      if (sorted[0] > sorted[1]) sorted.reverse()
      onRangeChange?.(sorted)
    } else {
      onChange?.(values[0]!)
    }
  }

  function isInteractive(): boolean {
    return !Value.get(disabled) && !Value.get(readonlyOpt)
  }

  function handlePointerAction(
    trackEl: HTMLElement,
    clientX: number,
    clientY: number,
    thumbIndex: number | null
  ) {
    const mn = Value.get(minOpt)
    const mx = Value.get(maxOpt)
    const st = Value.get(stepOpt)
    const rect = trackEl.getBoundingClientRect()

    let pct: number
    if (isVertical) {
      // Invert: bottom = min, top = max
      pct = clamp(1 - (clientY - rect.top) / rect.height, 0, 1)
    } else {
      pct = clamp((clientX - rect.left) / rect.width, 0, 1)
    }

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

  function thumbValueAt(index: number): Value<number> {
    return computedOf(
      thumbValues,
      minOpt
    )((vals: number[], mn: number) => vals[index] ?? mn)
  }

  function createThumb(index: number, trackEl: HTMLElement) {
    const thumbVal = thumbValueAt(index)
    const thumbPct = computedOf(
      thumbVal,
      minOpt,
      maxOpt
    )((v: number, mn: number, mx: number) => `${pctOf(v, mn, mx)}%`)

    return html.div(
      attr.class('bc-range-slider__thumb-container'),
      isVertical ? style.bottom(thumbPct) : style.left(thumbPct),

      // Value label
      When(
        showValue,
        () =>
          html.div(
            attr.class('bc-range-slider__value-label'),
            Value.map(thumbVal, (v: number) => formatValue(v))
          ),
        () => Empty
      ),

      html.div(
        attr.class(
          renderThumb
            ? 'bc-range-slider__thumb-custom'
            : 'bc-range-slider__thumb'
        ),
        attr.role('slider'),
        attr.tabindex(0),
        aria.valuemin(minOpt),
        aria.valuemax(maxOpt),
        aria.valuenow(thumbVal),
        aria.label(`Thumb ${index + 1}`),
        isVertical ? aria.orientation('vertical') : Empty,
        on.keydown((e: KeyboardEvent) => {
          if (!isInteractive()) return
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
          if (!isInteractive()) return
          activeThumb.set(index)

          const onPointerMove = (moveEvt: PointerEvent) => {
            handlePointerAction(
              trackEl,
              moveEvt.clientX,
              moveEvt.clientY,
              index
            )
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
      if (!isInteractive()) return
      e.preventDefault()

      handlePointerAction(trackEl, e.clientX, e.clientY, null)

      const onPointerMove = (moveEvt: PointerEvent) => {
        handlePointerAction(
          trackEl,
          moveEvt.clientX,
          moveEvt.clientY,
          activeThumb.value
        )
      }

      const onPointerUp = () => {
        activeThumb.set(null)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    }

    // Build fill style (used when no custom segment styles)
    const filledStyle = computedOf(
      thumbValues,
      minOpt,
      maxOpt
    )((vals: number[], mn: number, mx: number) => {
      if (isVertical) {
        if ((mode === 'range' || mode === 'multi') && vals.length >= 2) {
          const sorted = [...vals].sort((a, b) => a - b)
          const lo = pctOf(sorted[0]!, mn, mx)
          const hi = pctOf(sorted[sorted.length - 1]!, mn, mx)
          return `bottom: ${lo}%; height: ${hi - lo}%`
        }
        const pct = pctOf(vals[0] ?? mn, mn, mx)
        return `bottom: 0%; height: ${pct}%`
      } else {
        if ((mode === 'range' || mode === 'multi') && vals.length >= 2) {
          const sorted = [...vals].sort((a, b) => a - b)
          const lo = pctOf(sorted[0]!, mn, mx)
          const hi = pctOf(sorted[sorted.length - 1]!, mn, mx)
          return `left: ${lo}%; width: ${hi - lo}%`
        }
        // Single: fill from left
        const pct = pctOf(vals[0] ?? mn, mn, mx)
        return `left: 0%; width: ${pct}%`
      }
    })

    // Build segment elements if custom segment styles are provided
    const segmentContent =
      segmentStyles != null
        ? MapSignal(
            computedOf(
              thumbValues,
              minOpt,
              maxOpt,
              segmentStyles,
              color
            )(
              (
                vals: number[],
                mn: number,
                mx: number,
                styles: RangeSliderSegmentStyle[],
                clr: ThemeColorName
              ) => ({ vals, mn, mx, styles, clr })
            ),
            ({ vals, mn, mx, styles, clr }) => {
              // Build boundary points for segments
              const sorted = [...vals].sort((a, b) => a - b)
              const boundaries = [mn, ...sorted, mx]

              return Fragment(
                ...boundaries.slice(0, -1).map((start, i) => {
                  const end = boundaries[i + 1]!
                  const segStyle = styles[i]
                  const startPct = pctOf(start, mn, mx)
                  const endPct = pctOf(end, mn, mx)
                  const segColor = segStyle?.color ?? clr
                  const light = backgroundValue(segColor, 'solid', 'light')
                  const dark = backgroundValue(segColor, 'solid', 'dark')
                  const thickness = segStyle?.thickness
                  const pattern = segStyle?.pattern ?? 'solid'
                  const thicknessVar = thickness ? `height: ${thickness};` : ''
                  const patternStyle =
                    pattern !== 'solid'
                      ? `border-style: ${pattern}; background: none; border-color: ${light.backgroundColor};`
                      : ''

                  let positionStyle: string
                  if (isVertical) {
                    positionStyle = `bottom: ${startPct}%; height: ${endPct - startPct}%;`
                  } else {
                    positionStyle = `left: ${startPct}%; width: ${endPct - startPct}%;`
                  }

                  const inlineStyle = `${positionStyle} --rs-color: ${light.backgroundColor}; --rs-color-dark: ${dark.backgroundColor}; ${thicknessVar} ${patternStyle}`

                  return html.div(
                    attr.class(
                      'bc-range-slider__fill bc-range-slider__segment'
                    ),
                    attr.style(inlineStyle)
                  )
                })
              )
            }
          )
        : html.div(attr.class('bc-range-slider__fill'), attr.style(filledStyle))

    // Build thumb elements
    const thumbElements = Array.from({ length: thumbCount }, (_, i) =>
      createThumb(i, trackEl)
    )

    // Tick marks
    const tickContent = ticks
      ? MapSignal(
          computedOf(
            ticks,
            minOpt,
            maxOpt,
            stepOpt
          )(
            (
              t: boolean | RangeSliderTick[],
              mn: number,
              mx: number,
              st: number
            ) => {
              if (t === true) {
                const marks: RangeSliderTick[] = []
                for (let v = mn; v <= mx; v += st) {
                  marks.push({ value: v })
                }
                return { marks, mn, mx }
              }
              if (Array.isArray(t)) {
                return { marks: t, mn, mx }
              }
              return { marks: [] as RangeSliderTick[], mn, mx }
            }
          ),
          ({ marks, mn, mx }) => {
            if (marks.length === 0) return Empty
            return html.div(
              attr.class('bc-range-slider__ticks'),
              ...marks.map(tick => {
                const pct = pctOf(tick.value, mn, mx)
                return html.div(
                  attr.class('bc-range-slider__tick'),
                  isVertical ? style.bottom(`${pct}%`) : style.left(`${pct}%`),
                  tick.label != null
                    ? html.span(
                        attr.class('bc-range-slider__tick-label'),
                        tick.label
                      )
                    : Empty
                )
              })
            )
          }
        )
      : Empty

    // Marker dots on the track
    const markerContent = markers
      ? MapSignal(
          computedOf(
            markers,
            minOpt,
            maxOpt,
            stepOpt
          )(
            (
              m: boolean | RangeSliderMarker[],
              mn: number,
              mx: number,
              st: number
            ) => {
              if (m === true) {
                const dots: RangeSliderMarker[] = []
                for (let v = mn; v <= mx; v += st) {
                  dots.push({ value: v })
                }
                return { dots, mn, mx }
              }
              if (Array.isArray(m)) {
                return { dots: m, mn, mx }
              }
              return { dots: [] as RangeSliderMarker[], mn, mx }
            }
          ),
          ({ dots, mn, mx }) => {
            if (dots.length === 0) return Empty
            return html.div(
              attr.class('bc-range-slider__markers'),
              ...dots.map(marker => {
                const pct = pctOf(marker.value, mn, mx)
                return html.div(
                  attr.class('bc-range-slider__marker'),
                  isVertical ? style.bottom(`${pct}%`) : style.left(`${pct}%`),
                  marker.label != null
                    ? html.span(
                        attr.class('bc-range-slider__marker-label'),
                        marker.label
                      )
                    : Empty
                )
              })
            )
          }
        )
      : Empty

    return Fragment(
      attr.class(
        computedOf(size, disabled, readonlyOpt, orientationOpt)(generateClasses)
      ),
      attr.style(Value.map(color, generateColorStyles)),
      attr.role('group'),
      aria.label(
        mode === 'multi'
          ? 'Multi-point slider'
          : mode === 'range'
            ? 'Range slider'
            : 'Slider'
      ),
      on.pointerdown(onPointerDown),

      // Track
      html.div(
        attr.class('bc-range-slider__track'),
        segmentContent,
        markerContent,
        tickContent,
        ...thumbElements
      )
    )
  })
}

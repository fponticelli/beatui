import {
  attr,
  computedOf,
  html,
  on,
  prop,
  Value,
  Empty,
  Fragment,
  aria,
  WithElement,
  MapSignal,
  When,
  TNode,
  OnDispose,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { ThemeColorName } from '../../../tokens'
import { backgroundValue } from '../../theme/style-utils'
import { roundToStep } from './step-utils'

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
 * Style configuration for an individual track segment.
 */
export interface RangeSliderSegmentStyle {
  /** Theme color for this segment */
  color?: ThemeColorName
  /** CSS height/width override for this segment's thickness (e.g. '6px', '0.5rem') */
  thickness?: string
  /** CSS border-style pattern for this segment (e.g. 'solid', 'dashed', 'dotted') */
  pattern?: 'solid' | 'dashed' | 'dotted'
}

/**
 * Orientation of the range slider.
 */
export type RangeSliderOrientation = 'horizontal' | 'vertical'

/**
 * Configuration options for the {@link RangeSlider} component.
 *
 * Supports single-value and dual-thumb (range) modes with vertical/horizontal
 * orientations, customizable thumbs and segment styles, tick marks, and full
 * keyboard accessibility.
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
  /** Orientation of the slider. @default 'horizontal' */
  orientation?: Value<RangeSliderOrientation>

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
   * Tick marks along the slider track.
   * Can be `true` for automatic step-based ticks, or an array of custom tick definitions.
   */
  ticks?: Value<boolean | RangeSliderTick[]>

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
   * For single-value mode: index 0 = filled segment, index 1 = unfilled segment.
   * For range mode: index 0 = before low, index 1 = between thumbs, index 2 = after high.
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
  const classes = [
    'bc-range-slider',
    `bc-range-slider--size-${size}`,
    `bc-range-slider--${orientation}`,
  ]
  if (disabled) classes.push('bc-range-slider--disabled')
  if (readonly) classes.push('bc-range-slider--readonly')
  return classes.join(' ')
}

function generateColorStyles(color: ThemeColorName): string {
  const light = backgroundValue(color, 'solid', 'light')
  const dark = backgroundValue(color, 'solid', 'dark')
  return `--rs-color: ${light.backgroundColor}; --rs-color-dark: ${dark.backgroundColor}`
}

/**
 * A range slider component supporting single-value and dual-thumb range
 * selection with vertical/horizontal orientation, customizable thumbs
 * and segment styles, tick marks, and keyboard accessibility.
 *
 * Integrates with BeatUI's existing slider ecosystem (see also
 * {@link SliderInput} for native HTML5 sliders and {@link AdvancedSlider}
 * for multi-point mode).
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
 * // Vertical orientation
 * RangeSlider({
 *   value: prop(30), onChange: () => {},
 *   orientation: 'vertical',
 *   min: 0, max: 100,
 * })
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
  orientation: orientationOpt = 'horizontal',
  value,
  onChange,
  range,
  onRangeChange,
  ticks,
  showValue = false,
  formatValue = (v: number) => String(v),
  segmentStyles,
  renderThumb,
}: RangeSliderOptions) {
  const mode: 'single' | 'range' = range != null ? 'range' : 'single'
  const thumbCount = mode === 'range' ? 2 : 1

  const thumbValues: Value<number[]> =
    mode === 'range'
      ? Value.map(range!, (r: [number, number]) => [r[0], r[1]])
      : Value.map(value ?? 0, (v: number) => [v])

  const activeThumb = prop<number | null>(null)

  function emitChange(values: number[]) {
    if (mode === 'range') {
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
    const orient = Value.get(orientationOpt)
    const rect = trackEl.getBoundingClientRect()

    let pct: number
    if (orient === 'vertical') {
      // For vertical: bottom = min, top = max
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
    const orient = orientationOpt
    const thumbPct = computedOf(
      thumbVal,
      minOpt,
      maxOpt
    )((v: number, mn: number, mx: number) => `${pctOf(v, mn, mx)}%`)

    return html.div(
      attr.class('bc-range-slider__thumb-container'),
      // Position differs by orientation
      WithElement(el => {
        const unsub = Value.on(
          computedOf(thumbPct, orient)((pct, o) => ({ pct, o })),
          ({ pct, o }) => {
            if (o === 'vertical') {
              el.style.bottom = pct
              el.style.left = ''
            } else {
              el.style.left = pct
              el.style.bottom = ''
            }
          }
        )
        return Fragment(
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
            aria.orientation(orientationOpt as any),
            on.keydown((e: KeyboardEvent) => {
              if (!isInteractive()) return
              const mn = Value.get(minOpt)
              const mx = Value.get(maxOpt)
              const st = Value.get(stepOpt)
              const currentVals = Value.get(thumbValues)
              const current = currentVals[index]!
              const o = Value.get(orientationOpt)
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

              // Swap direction for vertical: Up = increase, Down = decrease (already correct)
              // For horizontal: Right = increase, Left = decrease (already correct)
              void o // orientation handled naturally

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
          ),

          OnDispose(unsub)
        )
      })
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

    // Build fill style
    const filledStyle = computedOf(
      thumbValues,
      minOpt,
      maxOpt,
      orientationOpt
    )((vals: number[], mn: number, mx: number, orient: RangeSliderOrientation) => {
      const prop = orient === 'vertical' ? 'bottom' : 'left'
      const dim = orient === 'vertical' ? 'height' : 'width'

      if (mode === 'range' && vals.length === 2) {
        const lo = pctOf(Math.min(vals[0]!, vals[1]!), mn, mx)
        const hi = pctOf(Math.max(vals[0]!, vals[1]!), mn, mx)
        return `${prop}: ${lo}%; ${dim}: ${hi - lo}%`
      }
      // Single: fill from start
      const pct = pctOf(vals[0] ?? mn, mn, mx)
      return `${prop}: 0%; ${dim}: ${pct}%`
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
              orientationOpt,
              color
            )(
              (
                vals: number[],
                mn: number,
                mx: number,
                styles: RangeSliderSegmentStyle[],
                orient: RangeSliderOrientation,
                clr: ThemeColorName
              ) => ({
                vals,
                mn,
                mx,
                styles,
                orient,
                clr,
              })
            ),
            ({ vals, mn, mx, styles, orient, clr }) => {
              const posProp = orient === 'vertical' ? 'bottom' : 'left'
              const dimProp = orient === 'vertical' ? 'height' : 'width'

              if (mode === 'range' && vals.length === 2) {
                const lo = Math.min(vals[0]!, vals[1]!)
                const hi = Math.max(vals[0]!, vals[1]!)
                // 3 segments: [min..lo], [lo..hi], [hi..max]
                const segments = [
                  { start: mn, end: lo, style: styles[0] },
                  { start: lo, end: hi, style: styles[1] },
                  { start: hi, end: mx, style: styles[2] },
                ]
                return Fragment(
                  ...segments.map((seg, _i) => {
                    const startPct = pctOf(seg.start, mn, mx)
                    const endPct = pctOf(seg.end, mn, mx)
                    const segColor = seg.style?.color ?? clr
                    const light = backgroundValue(segColor, 'solid', 'light')
                    const dark = backgroundValue(segColor, 'solid', 'dark')
                    const thickness = seg.style?.thickness
                    const pattern = seg.style?.pattern ?? 'solid'
                    const thicknessVar = thickness
                      ? orient === 'vertical'
                        ? `width: ${thickness};`
                        : `height: ${thickness};`
                      : ''
                    const patternStyle =
                      pattern !== 'solid'
                        ? `border-style: ${pattern}; background: none; border-color: ${light.backgroundColor};`
                        : ''
                    const inlineStyle = `${posProp}: ${startPct}%; ${dimProp}: ${endPct - startPct}%; --rs-color: ${light.backgroundColor}; --rs-color-dark: ${dark.backgroundColor}; ${thicknessVar} ${patternStyle}`

                    return html.div(
                      attr.class('bc-range-slider__fill bc-range-slider__segment'),
                      attr.style(inlineStyle)
                    )
                  })
                )
              }

              // Single mode: 2 segments [min..value], [value..max]
              const v = vals[0] ?? mn
              const segments = [
                { start: mn, end: v, style: styles[0] },
                { start: v, end: mx, style: styles[1] },
              ]
              return Fragment(
                ...segments.map(seg => {
                  const startPct = pctOf(seg.start, mn, mx)
                  const endPct = pctOf(seg.end, mn, mx)
                  const segColor = seg.style?.color ?? clr
                  const light = backgroundValue(segColor, 'solid', 'light')
                  const dark = backgroundValue(segColor, 'solid', 'dark')
                  const thickness = seg.style?.thickness
                  const pattern = seg.style?.pattern ?? 'solid'
                  const thicknessVar = thickness
                    ? orient === 'vertical'
                      ? `width: ${thickness};`
                      : `height: ${thickness};`
                    : ''
                  const patternStyle =
                    pattern !== 'solid'
                      ? `border-style: ${pattern}; background: none; border-color: ${light.backgroundColor};`
                      : ''
                  const inlineStyle = `${posProp}: ${startPct}%; ${dimProp}: ${endPct - startPct}%; --rs-color: ${light.backgroundColor}; --rs-color-dark: ${dark.backgroundColor}; ${thicknessVar} ${patternStyle}`

                  return html.div(
                    attr.class('bc-range-slider__fill bc-range-slider__segment'),
                    attr.style(inlineStyle)
                  )
                })
              )
            }
          )
        : html.div(
            attr.class('bc-range-slider__fill'),
            attr.style(filledStyle)
          )

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
            stepOpt,
            orientationOpt
          )(
            (
              t: boolean | RangeSliderTick[],
              mn: number,
              mx: number,
              st: number,
              orient: RangeSliderOrientation
            ) => {
              if (t === true) {
                const marks: RangeSliderTick[] = []
                for (let v = mn; v <= mx; v += st) {
                  marks.push({ value: v })
                }
                return { marks, mn, mx, orient }
              }
              if (Array.isArray(t)) {
                return { marks: t, mn, mx, orient }
              }
              return { marks: [] as RangeSliderTick[], mn, mx, orient }
            }
          ),
          ({ marks, mn, mx, orient }) => {
            if (marks.length === 0) return Empty
            const posProp = orient === 'vertical' ? 'bottom' : 'left'
            return html.div(
              attr.class('bc-range-slider__ticks'),
              ...marks.map(tick => {
                const pct = pctOf(tick.value, mn, mx)
                return html.div(
                  attr.class('bc-range-slider__tick'),
                  attr.style(`${posProp}: ${pct}%`),
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

    return Fragment(
      attr.class(
        computedOf(
          size,
          disabled,
          readonlyOpt,
          orientationOpt
        )(generateClasses)
      ),
      attr.style(Value.map(color, generateColorStyles)),
      attr.role('group'),
      aria.label(mode === 'range' ? 'Range slider' : 'Slider'),
      on.pointerdown(onPointerDown),

      // Track
      html.div(
        attr.class('bc-range-slider__track'),
        segmentContent,
        tickContent,
        ...thumbElements
      )
    )
  })
}

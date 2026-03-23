import {
  attr,
  Renderable,
  Use,
  Value,
  html,
  When,
  Signal,
  prop,
  WithElement,
  effectOf,
  Empty,
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'
import { AlphaChannelPicker, ChannelPicker, ColorField } from './channel-picker'
import { drawHueCanvas, drawCheckerboard } from './canvas-draw'
import { withColor } from '@tempots/std/color-channel'
import {
  Color,
  colorToString,
  type RGBA,
  rgba,
  parseColor,
  convertColor,
} from '@tempots/std/color'
import { roundTo } from '@tempots/std'
import { BeatUII18n } from '../../../../beatui-i18n'
import { Label } from '../../../typography'
import { TextInput } from '../text-input'

export interface HexColorPickerOptions {
  /** The current color as a hex string (e.g. '#ff0000', '#ff000080'). */
  value: Value<string>
  /** Callback with the new hex string. */
  onChange?: (value: string) => void
  /** Callback with the new hex string (on input). */
  onInput?: (value: string) => void
  withAlpha?: Value<boolean>
  disabled?: Value<boolean>
  displayColorSwatch?: Value<boolean>
}

function toPercent(v: number) {
  return roundTo(v * 100, 2)
}

function fromPercent(v: number) {
  return roundTo(v / 100, 4)
}

function parseToRgba(s: string): RGBA {
  try {
    return convertColor(parseColor(s), 'rgb') as RGBA
  } catch {
    return rgba(0, 0, 0, 1)
  }
}

function rgbaToHex(c: RGBA, includeAlpha: boolean): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(1, n)) * 255)
      .toString(16)
      .padStart(2, '0')
  const hex = `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`
  if (includeAlpha && c.alpha < 1) {
    return hex + toHex(c.alpha)
  }
  return hex
}

/**
 * Standalone hex color picker with color field, hue channel strip,
 * hex text input, optional alpha, and color swatch preview.
 *
 * Accepts and emits hex strings. Internally converts to RGBA (0-1) for
 * the color field and channel strips.
 */
export function HexColorPicker(options: HexColorPickerOptions): Renderable {
  const {
    value,
    onChange,
    onInput,
    withAlpha = false,
    disabled = false,
    displayColorSwatch = true,
  } = options

  // Parse string value to RGBA internally
  const color = Value.toSignal(value).map(parseToRgba)
  const alpha = color.$.alpha.map(toPercent) as Signal<number>
  const colorNoAlpha = color
    .map(c => withColor(c, { alpha: 1 }))
    .map(colorToString)

  // Emit as hex string
  const emitHex = (c: RGBA, fn?: (value: string) => void) => {
    if (fn == null) return
    fn(rgbaToHex(c, Value.get(withAlpha)))
  }

  // Derive hue from RGB (0-360)
  const hueSignal = color.map(c => {
    const { r, g, b } = c
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    const d = max - min
    if (d < 1e-10) return 0
    const h =
      max === r
        ? ((g - b) / d + (g < b ? 6 : 0)) * 60
        : max === g
          ? ((b - r) / d + 2) * 60
          : ((r - g) / d + 4) * 60
    return isNaN(h) ? 0 : h
  }) as Signal<number>

  // Hex string for text input
  const hexString = color.map(c =>
    rgbaToHex(c, Value.get(withAlpha))
  ) as Signal<string>

  // HSV → RGBA helper
  const hsvToRgba = (h: number, s: number, v: number, a: number): RGBA => {
    const hh = ((h % 360) + 360) % 360
    const c2 = v * s
    const x = c2 * (1 - Math.abs(((hh / 60) % 2) - 1))
    const m = v - c2
    let r1: number, g1: number, b1: number
    if (hh < 60) [r1, g1, b1] = [c2, x, 0]
    else if (hh < 120) [r1, g1, b1] = [x, c2, 0]
    else if (hh < 180) [r1, g1, b1] = [0, c2, x]
    else if (hh < 240) [r1, g1, b1] = [0, x, c2]
    else if (hh < 300) [r1, g1, b1] = [x, 0, c2]
    else [r1, g1, b1] = [c2, 0, x]
    return rgba(r1 + m, g1 + m, b1 + m, a)
  }

  const handleColorFieldChange = (
    pos: { x: number; y: number },
    fn?: (value: string) => void
  ) => {
    if (fn == null) return
    emitHex(hsvToRgba(hueSignal.value, pos.x, 1 - pos.y, color.value.alpha), fn)
  }

  const handleHueChange = (newHue: number, fn?: (value: string) => void) => {
    if (fn == null) return
    const c = color.value
    const max = Math.max(c.r, c.g, c.b),
      min = Math.min(c.r, c.g, c.b)
    const v = max
    const s = max === 0 ? 0 : (max - min) / max
    emitHex(hsvToRgba(newHue, s, v, c.alpha), fn)
  }

  const handleAlphaChange = (fn?: (value: string) => void) => {
    if (fn == null) return undefined
    return (v: number) => {
      emitHex(withColor(color.value, { alpha: fromPercent(v) }), fn)
    }
  }

  return Use(BeatUII18n, t =>
    html.div(
      attr.class('bc-color-picker__container'),

      ColorField({
        handlePosition: color.map(c => {
          const max = Math.max(c.r, c.g, c.b),
            min = Math.min(c.r, c.g, c.b)
          const v = max
          const s = max === 0 ? 0 : (max - min) / max
          return { x: s, y: 1 - v }
        }),
        disabled,
        onChange: pos => handleColorFieldChange(pos, onChange),
        onInput: pos => handleColorFieldChange(pos, onInput),
        handleColor: colorNoAlpha,
        render: ({ ctx, width, height }) => {
          const pureHue = hsvToRgba(hueSignal.value, 1, 1, 1)
          const hGrad = ctx.createLinearGradient(0, 0, width, 0)
          hGrad.addColorStop(0, '#ffffff')
          hGrad.addColorStop(1, colorToString(pureHue))
          ctx.fillStyle = hGrad
          ctx.fillRect(0, 0, width, height)
          const vGrad = ctx.createLinearGradient(0, 0, 0, height)
          vGrad.addColorStop(0, 'rgba(0,0,0,0)')
          vGrad.addColorStop(1, 'rgba(0,0,0,1)')
          ctx.fillStyle = vGrad
          ctx.fillRect(0, 0, width, height)
        },
        dependencies: [hueSignal],
      }),
      html.div(
        attr.class('bc-color-picker__controls'),
        html.div(
          attr.class('bc-color-picker__channels-container'),
          html.div(
            attr.class('bc-color-picker__channels'),
            // Hue channel
            ChannelPicker({
              label: t.$.colorPicker.$.hue,
              value: hueSignal,
              onChange: v => handleHueChange(v, onChange),
              onInput: v => handleHueChange(v, onInput),
              draw: drawHueCanvas,
              min: 0,
              max: 360,
              handleColor: hueSignal.map(h =>
                colorToString(hsvToRgba(h, 1, 1, 1))
              ),
              unit: '°',
              disabled,
            }),
            When(withAlpha, () =>
              AlphaChannelPicker({
                label: t.$.colorPicker.$.alpha,
                value: alpha,
                color: color as Signal<Color>,
                onChange: handleAlphaChange(onChange),
                onInput: handleAlphaChange(onInput),
                dependencies: [
                  color.$.r,
                  color.$.g,
                  color.$.b,
                ] as Signal<unknown>[],
                disabled,
              })
            ),
            Label(attr.class('bc-color-picker__label'), t.$.colorPicker.$.hex),
            html.div(
              attr.class('bc-color-picker__channel__input'),
              TextInput({
                value: hexString,
                disabled,
                onChange: v => {
                  if (onChange) onChange(v.startsWith('#') ? v : `#${v}`)
                },
              })
            )
          )
        ),
        When(displayColorSwatch, () => {
          const size = prop({ w: 0, h: 0 })
          const checkerPatternSize = 8
          return html.div(
            attr.class('bc-color-picker__swatch-container'),
            html.canvas(
              attr.class('bc-color-picker__swatch'),
              attr.width(Value.map(size.$.w, String)),
              attr.height(Value.map(size.$.h, String)),
              ElementRect(r => {
                r.on(v => size.set({ w: v.width, h: v.height }))
                return Empty
              }),
              WithElement((canvas: HTMLCanvasElement) => {
                const ctx = canvas.getContext('2d')
                if (!ctx) return
                effectOf(
                  size,
                  color
                )(() => {
                  const width = size.value.w
                  const height = size.value.h
                  if (width === 0 || height === 0) return

                  if (color.value.alpha < 1) {
                    drawCheckerboard(ctx, width, height, checkerPatternSize)
                  }

                  ctx.fillStyle = colorToString(color.value)
                  ctx.fillRect(0, 0, width, height)
                })
              })
            )
          )
        })
      )
    )
  )
}

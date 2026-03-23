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
import { drawCheckerboard } from './canvas-draw'
import { withColor } from '@tempots/std/color-channel'
import { Color, colorToString, type RGBA } from '@tempots/std/color'
import { roundTo } from '@tempots/std'
import { BeatUII18n } from '../../../../beatui-i18n'

export interface RgbColorPickerOptions {
  value: Value<RGBA>
  onChange?: (value: RGBA) => void
  onInput?: (value: RGBA) => void
  withAlpha?: Value<boolean>
  disabled?: Value<boolean>
  displayColorSwatch?: Value<boolean>
}

function toPercent(v: number) {
  return roundTo(v * 100, 2)
}

function fromPercent(v: number) {
  return Math.round(v * 100) / 10000
}

/**
 * Standalone RGB color picker with color field, R/G/B channel strips,
 * optional alpha, and color swatch preview.
 *
 * RGBA channels are 0–1 internally. Displayed as 0–100% in the inputs.
 */
export function RgbColorPicker(options: RgbColorPickerOptions): Renderable {
  const {
    value,
    onChange,
    onInput,
    withAlpha = false,
    disabled = false,
    displayColorSwatch = true,
  } = options

  const color = Value.toSignal(value)
  const red = color.$.r.map(toPercent) as Signal<number>
  const green = color.$.g.map(toPercent) as Signal<number>
  const blue = color.$.b.map(toPercent) as Signal<number>
  const alpha = color.$.alpha.map(toPercent) as Signal<number>
  const colorNoAlpha = color
    .map(c => withColor(c, { alpha: 1 }))
    .map(colorToString)

  const emitOn = (
    c: 'r' | 'g' | 'b' | 'alpha',
    fn?: (value: RGBA) => void,
    convert?: (v: number) => number
  ) => {
    if (fn == null) return undefined
    return (v: number) => {
      if (convert) v = convert(v)
      fn(withColor(color.value, { [c]: v }))
    }
  }

  return Use(BeatUII18n, t =>
    html.div(
      attr.class('bc-color-picker__container'),

      ColorField({
        handlePosition: color.map(v => ({
          x: v.r,
          y: 1 - v.g,
        })),
        disabled,
        onChange: pos => {
          onChange?.(
            withColor(color.value, {
              r: Math.round(pos.x * 10000) / 10000,
              g: Math.round((1 - pos.y) * 10000) / 10000,
            })
          )
        },
        onInput: pos => {
          onInput?.(
            withColor(color.value, {
              r: Math.round(pos.x * 10000) / 10000,
              g: Math.round((1 - pos.y) * 10000) / 10000,
            })
          )
        },
        handleColor: colorNoAlpha,
        render: ({ ctx, width, height }) => {
          // X axis: red (0→1), Y axis: green (1→0, top=high green)
          // Blue is fixed by the blue channel strip
          for (let yi = 0; yi < height; yi++) {
            const g = 1 - yi / (height - 1)
            const grad = ctx.createLinearGradient(0, 0, width, 0)
            grad.addColorStop(
              0,
              colorToString(withColor(color.value, { r: 0, g }))
            )
            grad.addColorStop(
              1,
              colorToString(withColor(color.value, { r: 1, g }))
            )
            ctx.fillStyle = grad
            ctx.fillRect(0, yi, width, 1)
          }
        },
        dependencies: [blue],
      }),
      html.div(
        attr.class('bc-color-picker__controls'),
        html.div(
          attr.class('bc-color-picker__channels-container'),
          html.div(
            attr.class('bc-color-picker__channels'),
            // Red channel (displayed as 0-100%)
            ChannelPicker({
              label: t.$.colorPicker.$.red,
              value: red,
              onChange: emitOn('r', onChange, fromPercent),
              onInput: emitOn('r', onInput, fromPercent),
              draw: ({ ctx, width, height }) => {
                const grad = ctx.createLinearGradient(0, 0, width, 0)
                grad.addColorStop(
                  0,
                  colorToString(withColor(color.value, { r: 0 }))
                )
                grad.addColorStop(
                  1,
                  colorToString(withColor(color.value, { r: 1 }))
                )
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, width, height)
              },
              dependencies: [green, blue],
              handleColor: colorNoAlpha,
              min: 0,
              max: 100,
              unit: '%',
              disabled,
            }),
            // Green channel (displayed as 0-100%)
            ChannelPicker({
              label: t.$.colorPicker.$.green,
              value: green,
              onChange: emitOn('g', onChange, fromPercent),
              onInput: emitOn('g', onInput, fromPercent),
              draw: ({ ctx, width, height }) => {
                const grad = ctx.createLinearGradient(0, 0, width, 0)
                grad.addColorStop(
                  0,
                  colorToString(withColor(color.value, { g: 0 }))
                )
                grad.addColorStop(
                  1,
                  colorToString(withColor(color.value, { g: 1 }))
                )
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, width, height)
              },
              dependencies: [red, blue],
              handleColor: colorNoAlpha,
              min: 0,
              max: 100,
              unit: '%',
              disabled,
            }),
            // Blue channel (displayed as 0-100%)
            ChannelPicker({
              label: t.$.colorPicker.$.blue,
              value: blue,
              onChange: emitOn('b', onChange, fromPercent),
              onInput: emitOn('b', onInput, fromPercent),
              draw: ({ ctx, width, height }) => {
                const grad = ctx.createLinearGradient(0, 0, width, 0)
                grad.addColorStop(
                  0,
                  colorToString(withColor(color.value, { b: 0 }))
                )
                grad.addColorStop(
                  1,
                  colorToString(withColor(color.value, { b: 1 }))
                )
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, width, height)
              },
              dependencies: [red, green],
              handleColor: colorNoAlpha,
              min: 0,
              max: 100,
              unit: '%',
              disabled,
            }),
            When(withAlpha, () =>
              AlphaChannelPicker({
                label: t.$.colorPicker.$.alpha,
                value: alpha,
                color: color as Signal<Color>,
                onChange: emitOn('alpha', onChange, fromPercent),
                onInput: emitOn('alpha', onInput, fromPercent),
                dependencies: [red, green, blue],
                disabled,
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

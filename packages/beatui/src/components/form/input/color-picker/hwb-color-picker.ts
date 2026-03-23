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
import { Color, colorToString, type HWBA } from '@tempots/std/color'
import { roundTo } from '@tempots/std'
import { BeatUII18n } from '../../../../beatui-i18n'

export interface HwbColorPickerOptions {
  value: Value<HWBA>
  onChange?: (value: HWBA) => void
  onInput?: (value: HWBA) => void
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

/**
 * Standalone HWB color picker with color field, H/W/B channel strips,
 * optional alpha, and color swatch preview.
 */
export function HwbColorPicker(options: HwbColorPickerOptions): Renderable {
  const {
    value,
    onChange,
    onInput,
    withAlpha = false,
    disabled = false,
    displayColorSwatch = true,
  } = options

  const color = Value.toSignal(value)
  const hue = color.$.h as Signal<number>
  const wht = color.$.w.map(toPercent) as Signal<number>
  const blk = color.$.b.map(toPercent) as Signal<number>
  const alpha = color.$.alpha.map(toPercent) as Signal<number>
  const colorNoAlpha = color
    .map(c => withColor(c, { alpha: 1 }))
    .map(colorToString)

  const emitOn = (
    c: 'h' | 'w' | 'b' | 'alpha',
    fn?: (value: HWBA) => void,
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
          x: v.w,
          y: v.b,
        })),
        disabled,
        onChange: pos => {
          onChange?.(
            withColor(color.value, {
              w: roundTo(pos.x, 4),
              b: roundTo(pos.y, 4),
            })
          )
        },
        onInput: pos => {
          onInput?.(
            withColor(color.value, {
              w: roundTo(pos.x, 4),
              b: roundTo(pos.y, 4),
            })
          )
        },
        handleColor: colorNoAlpha,
        render: ({ ctx, width, height }) => {
          // X axis: whiteness (0→1), Y axis: blackness (0→1)
          // Top-left: pure hue, top-right: white
          // Bottom-left: black, bottom-right: gray
          const whiteGrad = ctx.createLinearGradient(0, 0, width, 0)
          whiteGrad.addColorStop(
            0,
            colorToString(withColor(color.value, { w: 0, b: 0 }))
          )
          whiteGrad.addColorStop(1, 'white')
          ctx.fillStyle = whiteGrad
          ctx.fillRect(0, 0, width, height)

          const blackGrad = ctx.createLinearGradient(0, 0, 0, height)
          blackGrad.addColorStop(0, 'rgba(0,0,0,0)')
          blackGrad.addColorStop(1, 'black')
          ctx.fillStyle = blackGrad
          ctx.fillRect(0, 0, width, height)
        },
        dependencies: [hue],
      }),
      html.div(
        attr.class('bc-color-picker__controls'),
        html.div(
          attr.class('bc-color-picker__channels-container'),
          html.div(
            attr.class('bc-color-picker__channels'),
            // Hue channel — handle shows pure hue, not the mixed color
            ChannelPicker({
              label: t.$.colorPicker.$.hue,
              value: hue,
              onChange: emitOn('h', onChange),
              onInput: emitOn('h', onInput),
              draw: drawHueCanvas,
              min: 0,
              max: 360,

              handleColor: hue.map(_h =>
                colorToString(withColor(color.value, { w: 0, b: 0 }))
              ),
              unit: '°',
              disabled,
            }),
            // Whiteness channel
            ChannelPicker({
              label: t.$.colorPicker.$.whiteness,
              value: wht,
              onChange: emitOn('w', onChange, fromPercent),
              onInput: emitOn('w', onInput, fromPercent),
              draw: ({ ctx, width, height }) => {
                const grad = ctx.createLinearGradient(0, 0, width, 0)
                const start = colorToString(withColor(color.value, { w: 0 }))
                const end = colorToString(withColor(color.value, { w: 1 }))
                grad.addColorStop(0, start)
                grad.addColorStop(1, end)
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, width, height)
              },
              dependencies: [hue, blk],
              handleColor: colorNoAlpha,
              min: 0,
              max: 100,

              unit: '%',
              disabled,
            }),
            // Blackness channel
            ChannelPicker({
              label: t.$.colorPicker.$.blackness,
              value: blk,
              onChange: emitOn('b', onChange, fromPercent),
              onInput: emitOn('b', onInput, fromPercent),
              draw: ({ ctx, width, height }) => {
                const grad = ctx.createLinearGradient(0, 0, width, 0)
                const start = colorToString(withColor(color.value, { b: 0 }))
                const end = colorToString(withColor(color.value, { b: 1 }))
                grad.addColorStop(0, start)
                grad.addColorStop(1, end)
                ctx.fillStyle = grad
                ctx.fillRect(0, 0, width, height)
              },
              dependencies: [hue, wht],
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
                dependencies: [hue, wht, blk],
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

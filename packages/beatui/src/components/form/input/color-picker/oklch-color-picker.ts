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
import { Color, colorToString, type OKLCHA } from '@tempots/std/color'
import { roundTo } from '@tempots/std'
import { BeatUII18n } from '../../../../beatui-i18n'

export interface OklchColorPickerOptions {
  value: Value<OKLCHA>
  onChange?: (value: OKLCHA) => void
  onInput?: (value: OKLCHA) => void
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
 * Standalone OKLCH color picker with color field, L/C/H channel strips,
 * optional alpha, and color swatch preview.
 */
export function OklchColorPicker(options: OklchColorPickerOptions): Renderable {
  const {
    value,
    onChange,
    onInput,
    withAlpha = false,
    disabled = false,
    displayColorSwatch = true,
  } = options

  const color = Value.toSignal(value)
  const lig = color.$.l.map(toPercent) as Signal<number>
  const chroma = color.$.c as Signal<number>
  const hue = color.$.h as Signal<number>
  const alpha = color.$.alpha.map(toPercent) as Signal<number>
  const colorNoAlpha = color
    .map(c => withColor(c, { alpha: 1 }))
    .map(colorToString)

  const emitOn = (
    c: 'l' | 'c' | 'h' | 'alpha',
    fn?: (value: OKLCHA) => void,
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
          x: v.c / 0.4, // chroma normalized to 0-1
          y: 1 - v.l, // lightness inverted (bright at top)
        })),
        disabled,
        onChange: pos => {
          onChange?.(
            withColor(color.value, {
              c: Math.round(pos.x * 0.4 * 10000) / 10000,
              l: Math.round((1 - pos.y) * 10000) / 10000,
            })
          )
        },
        onInput: pos => {
          onInput?.(
            withColor(color.value, {
              c: Math.round(pos.x * 0.4 * 10000) / 10000,
              l: Math.round((1 - pos.y) * 10000) / 10000,
            })
          )
        },
        handleColor: colorNoAlpha,
        render: ({ ctx, width, height }) => {
          // X axis: chroma (0→0.4), Y axis: lightness (1→0, top=bright)
          // Draw one vertical gradient per column — browser gamut-maps
          // the oklch() colors smoothly instead of hard-clipping to sRGB
          const h = color.value.h
          const stops = 5 // lightness gradient stops per column
          for (let xi = 0; xi < width; xi++) {
            const c = (xi / (width - 1)) * 0.4
            const grad = ctx.createLinearGradient(0, 0, 0, height)
            for (let si = 0; si <= stops; si++) {
              const l = 1 - si / stops
              grad.addColorStop(si / stops, `oklch(${l} ${c} ${h})`)
            }
            ctx.fillStyle = grad
            ctx.fillRect(xi, 0, 1, height)
          }
        },
        dependencies: [hue],
      }),
      html.div(
        attr.class('bc-color-picker__controls'),
        html.div(
          attr.class('bc-color-picker__channels-container'),
          html.div(
            attr.class('bc-color-picker__channels'),
            // Lightness channel
            ChannelPicker({
              label: t.$.colorPicker.$.lightness,
              value: lig,
              onChange: emitOn('l', onChange, fromPercent),
              onInput: emitOn('l', onInput, fromPercent),
              draw: ({ ctx, width, height }) => {
                const { c: cv, h: hv } = color.value
                for (let x = 0; x < width; x++) {
                  const l = x / (width - 1)
                  ctx.fillStyle = `oklch(${l} ${cv} ${hv})`
                  ctx.fillRect(x, 0, 1, height)
                }
              },
              dependencies: [chroma, hue],
              handleColor: colorNoAlpha,
              min: 0,
              max: 100,

              unit: '%',
              disabled,
            }),
            // Chroma channel
            ChannelPicker({
              label: t.$.colorPicker.$.chroma,
              value: chroma.map(c => roundTo(c * 1000, 0)) as Signal<number>,
              onChange: emitOn('c', onChange, v => v / 1000),
              onInput: emitOn('c', onInput, v => v / 1000),
              draw: ({ ctx, width, height }) => {
                const { l: lv, h: hv } = color.value
                for (let x = 0; x < width; x++) {
                  const c = (x / (width - 1)) * 0.4
                  ctx.fillStyle = `oklch(${lv} ${c} ${hv})`
                  ctx.fillRect(x, 0, 1, height)
                }
              },
              dependencies: [lig, hue],
              handleColor: colorNoAlpha,
              min: 0,
              max: 400,
              step: 1,
              disabled,
            }),
            // Hue channel — handle shows pure hue color
            ChannelPicker({
              label: t.$.colorPicker.$.hue,
              value: hue,
              onChange: emitOn('h', onChange),
              onInput: emitOn('h', onInput),
              draw: ({ ctx, width, height }) => {
                const { l: lv, c: cv } = color.value
                for (let x = 0; x < width; x++) {
                  const h = (x / (width - 1)) * 360
                  ctx.fillStyle = `oklch(${lv} ${cv} ${h})`
                  ctx.fillRect(x, 0, 1, height)
                }
              },
              dependencies: [lig, chroma],
              handleColor: hue.map(_h =>
                colorToString(withColor(color.value, { l: 0.7, c: 0.3 }))
              ),
              min: 0,
              max: 360,

              unit: '°',
              disabled,
            }),
            When(withAlpha, () =>
              AlphaChannelPicker({
                label: t.$.colorPicker.$.alpha,
                value: alpha,
                color: color as Signal<Color>,
                onChange: emitOn('alpha', onChange, fromPercent),
                onInput: emitOn('alpha', onInput, fromPercent),
                dependencies: [lig, chroma, hue],
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

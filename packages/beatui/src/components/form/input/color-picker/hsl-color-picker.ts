import {
  attr,
  Renderable,
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
import { Color, colorToString, type HSLA } from '@tempots/std/color'
import { roundTo } from '@tempots/std'

export interface HslColorPickerOptions {
  value: Value<HSLA>
  onChange?: (value: HSLA) => void
  onInput?: (value: HSLA) => void
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
 * The HSL format input panel.
 */
export function HslColorPicker(options: HslColorPickerOptions): Renderable {
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
  const sat = color.$.s.map(toPercent) as Signal<number>
  const lig = color.$.l.map(toPercent) as Signal<number>
  const alpha = color.$.alpha.map(toPercent) as Signal<number>
  const colorNoAlpha = color
    .map(c => withColor(c, { alpha: 1 }))
    .map(colorToString)

  const emitOn = (
    c: 'h' | 's' | 'l' | 'alpha',
    fn?: (value: HSLA) => void,
    convert?: (v: number) => number
  ) => {
    if (fn == null) return undefined
    return (v: number) => {
      if (convert) v = convert(v)
      fn(withColor(color.value, { [c]: v }))
    }
  }

  return html.div(
    attr.class('bc-color-picker__container'),

    ColorField({
      handlePosition: color.map(v => ({
        x: v.s,
        y: 1 - v.l,
      })),
      disabled,
      onChange: pos => {
        onChange?.(withColor(color.value, { s: pos.x, l: 1 - pos.y }))
      },
      onInput: pos => {
        onInput?.(withColor(color.value, { s: pos.x, l: 1 - pos.y }))
      },
      handleColor: colorNoAlpha,
      render: ({ ctx, width, height }) => {
        // Base: S axis locked at L=50%
        const satGradient = ctx.createLinearGradient(0, 0, width, 0)
        satGradient.addColorStop(
          0,
          colorToString(withColor(color.value, { s: 0, l: 0.5 }))
        )
        satGradient.addColorStop(
          1,
          colorToString(withColor(color.value, { s: 1, l: 0.5 }))
        )
        ctx.fillStyle = satGradient
        ctx.fillRect(0, 0, width, height)

        // White fades in toward top (L → 100%)
        const whiteGradient = ctx.createLinearGradient(0, 0, 0, height)
        whiteGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        whiteGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = whiteGradient
        ctx.fillRect(0, 0, width, height)

        // Black fades in toward bottom (L → 0%)
        const blackGradient = ctx.createLinearGradient(0, 0, 0, height)
        blackGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
        blackGradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
        ctx.fillStyle = blackGradient
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
          // Hue channel
          ChannelPicker({
            label: 'Hue',
            value: hue,

            onChange: emitOn('h', onChange),
            onInput: emitOn('h', onInput),
            draw: drawHueCanvas,
            min: 0,
            max: 360,
            handleColor: colorNoAlpha,
            unit: '°',
            disabled,
          }),
          // Saturation channel
          ChannelPicker({
            label: 'Saturation',
            value: sat,
            onChange: emitOn('s', onChange, fromPercent),
            onInput: emitOn('s', onInput, fromPercent),
            draw: ({ ctx, width, height }) => {
              const grad = ctx.createLinearGradient(0, 0, width, 0)
              const start = colorToString(withColor(color.value, { s: 0 }))
              const end = colorToString(withColor(color.value, { s: 1 }))
              grad.addColorStop(0, start)
              grad.addColorStop(1, end)
              ctx.fillStyle = grad
              ctx.fillRect(0, 0, width, height)
            },
            dependencies: [hue, lig],
            handleColor: colorNoAlpha,
            min: 0,
            max: 100,
            unit: '%',
            disabled,
          }),
          // Lightness channel
          ChannelPicker({
            label: 'Lightness',
            value: lig,
            onChange: emitOn('l', onChange, fromPercent),
            onInput: emitOn('l', onInput, fromPercent),
            draw: ({ ctx, width, height }) => {
              const grad = ctx.createLinearGradient(0, 0, width, 0)
              const start = colorToString(withColor(color.value, { l: 0 }))
              const mid = colorToString(withColor(color.value, { l: 0.5 }))
              const end = colorToString(withColor(color.value, { l: 1 }))
              grad.addColorStop(0, start)
              grad.addColorStop(0.5, mid)
              grad.addColorStop(1, end)
              ctx.fillStyle = grad
              ctx.fillRect(0, 0, width, height)
            },
            dependencies: [hue, sat],
            handleColor: colorNoAlpha,
            min: 0,
            max: 100,
            unit: '%',
            disabled,
          }),
          When(withAlpha, () =>
            AlphaChannelPicker({
              value: alpha,
              color: color as Signal<Color>,
              onChange: emitOn('alpha', onChange, fromPercent),
              onInput: emitOn('alpha', onInput, fromPercent),
              dependencies: [hue, sat, lig],
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
}

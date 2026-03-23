import {
  // RgbColorPicker,  // TODO: uncomment after refactor
  HwbColorPicker,
  HslColorPicker,
  OklchColorPicker,
  RgbColorPicker,
  HexColorPicker,
  // HwbColorPicker,
  // OklchColorPicker,
} from '@tempots/beatui'
import { html, attr, prop, Value } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'
import { hsla, colorToString, hwba, oklcha, rgba } from '@tempots/std/color'

export const meta: ComponentPageMeta = {
  name: 'ColorPicker',
  category: 'Inputs',
  component: 'ColorPicker',
  description:
    'A full-featured color picker with saturation/lightness area, hue strip, optional alpha, format-specific input panels, and swatch presets. Supports hex, RGB, HSL, HWB, and OKLCH. Each format also available as a standalone picker.',
  icon: 'lucide:palette',
  order: 25,
}

function pickerPreview(label: string, value: ReturnType<typeof prop<string>>) {
  return html.div(
    attr.class('flex items-center gap-2 mt-1'),
    html.div(
      attr.class(
        'w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0'
      ),
      attr.style(value.map(v => `background-color: ${v}`))
    ),
    html.span(
      attr.class('text-xs font-mono text-gray-500 dark:text-gray-400 truncate'),
      value
    )
  )
}

export default function ColorPickerPage() {
  const color = prop(hsla(216, 1, 0.5, 0.7))
  const color2 = prop(hwba(216, 1, 0.5, 0.7))
  const color3 = prop(oklcha(216, 1, 0.5, 0.7))
  const color4 = prop(rgba(0.5, 1, 0.5, 0.7))
  const color5 = prop('#ccaabbdd')

  return ComponentPage(meta, {
    playground: html.div(
      attr.class('flex flex-col gap-4 items-center'),
      HslColorPicker({
        value: color,
        onChange: v => color.set(v),
        withAlpha: true,
      }),
      html.div(color.map(colorToString)),

      HwbColorPicker({
        value: color2,
        onChange: v => color2.set(v),
        withAlpha: true,
      }),
      html.div(color2.map(colorToString)),

      OklchColorPicker({
        value: color3,
        onChange: v => color3.set(v),
        withAlpha: true,
      }),
      html.div(color3.map(colorToString)),

      RgbColorPicker({
        value: color4,
        onChange: v => color4.set(v),
        withAlpha: true,
      }),
      html.div(color4.map(colorToString)),

      HexColorPicker({
        value: color5,
        onChange: v => color5.set(v),
        withAlpha: true,
      }),
      html.div(color5)
      // pickerPreview('', color)
    ),
    // playground: html.div(
    //   attr.class('flex flex-col gap-4 items-center'),
    //   ColorPicker({ value: color, onChange: color.set }),
    //   pickerPreview('', color)
    // ),
    // sections: [
    //   Section(
    //     'ChannelPicker',
    //     () => {
    //       const hueVal = prop(0.6) // normalized 0-1 (= 216°)
    //       return html.div(
    //         attr.class('flex flex-col gap-4 max-w-sm'),
    //         // A simple hue channel
    //         ChannelPicker({
    //           label: 'Hue',
    //           value: hueVal,
    //           onChange: v => hueVal.set(v),
    //           draw: (canvas: HTMLCanvasElement) => {
    //             const ctx = canvas.getContext('2d')
    //             if (!ctx) return
    //             const w = canvas.width
    //             const h = canvas.height
    //             const grad = ctx.createLinearGradient(0, 0, w, 0)
    //             // Rainbow hue stops
    //             const colors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000']
    //             colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c))
    //             ctx.fillStyle = grad
    //             ctx.fillRect(0, 0, w, h)
    //           },
    //           displayValue: Value.map(hueVal, v => Math.round(v * 360)),
    //           onDisplayChange: v => hueVal.set(v / 360),
    //           min: 0,
    //           max: 360,
    //         }),
    //         // A red channel (0-255)
    //         ChannelPicker({
    //           label: 'Red',
    //           value: prop(0.5),
    //           onChange: () => {},
    //           draw: (canvas: HTMLCanvasElement) => {
    //             const ctx = canvas.getContext('2d')
    //             if (!ctx) return
    //             const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    //             grad.addColorStop(0, 'rgb(0,100,150)')
    //             grad.addColorStop(1, 'rgb(255,100,150)')
    //             ctx.fillStyle = grad
    //             ctx.fillRect(0, 0, canvas.width, canvas.height)
    //           },
    //           displayValue: 128,
    //           onDisplayChange: () => {},
    //           min: 0,
    //           max: 255,
    //         }),
    //         // An alpha channel with grid
    //         ChannelPicker({
    //           label: 'Alpha',
    //           value: prop(0.7),
    //           onChange: () => {},
    //           draw: (canvas: HTMLCanvasElement) => {
    //             const ctx = canvas.getContext('2d')
    //             if (!ctx) return
    //             const w = canvas.width
    //             const h = canvas.height
    //             // Checkerboard first
    //             const sq = 6
    //             for (let x = 0; x < w; x += sq * 2) {
    //               for (let y = 0; y < h; y += sq * 2) {
    //                 ctx.fillStyle = '#ccc'
    //                 ctx.fillRect(x, y, sq, sq)
    //                 ctx.fillRect(x + sq, y + sq, sq, sq)
    //                 ctx.fillStyle = '#fff'
    //                 ctx.fillRect(x + sq, y, sq, sq)
    //                 ctx.fillRect(x, y + sq, sq, sq)
    //               }
    //             }
    //             const grad = ctx.createLinearGradient(0, 0, w, 0)
    //             grad.addColorStop(0, 'rgba(59,130,246,0)')
    //             grad.addColorStop(1, 'rgba(59,130,246,1)')
    //             ctx.fillStyle = grad
    //             ctx.fillRect(0, 0, w, h)
    //           },
    //           displayValue: 70,
    //           onDisplayChange: () => {},
    //           min: 0,
    //           max: 100,
    //           showGrid: true,
    //         }),
    //         html.p(
    //           attr.class('text-sm text-gray-500 font-mono'),
    //           Value.map(hueVal, v => `Hue: ${Math.round(v * 360)}°`)
    //         )
    //       )
    //     },
    //     'The ChannelPicker building block — a horizontal gradient strip with drag handle and number input. Used by all format-specific pickers for their channels.'
    //   ),
    //   Section(
    //     'Basic',
    //     () => {
    //       const c = prop('#ef4444')
    //       return html.div(
    //         attr.class('flex flex-col gap-3'),
    //         ColorPicker({ value: c, onChange: c.set }),
    //         pickerPreview('', c)
    //       )
    //     },
    //     'Pick a color using the saturation/lightness area and hue strip.'
    //   ),
    //   Section(
    //     'With Alpha',
    //     () => {
    //       const c = prop('rgba(59, 130, 246, 0.7)')
    //       return html.div(
    //         attr.class('flex flex-col gap-3'),
    //         ColorPicker({
    //           value: c,
    //           onChange: c.set,
    //           withAlpha: true,
    //           formats: ['rgb', 'hsl'],
    //         }),
    //         pickerPreview('', c)
    //       )
    //     },
    //     'Enable alpha with withAlpha. The alpha strip and preview circle appear, and an A input is added to each panel.'
    //   ),
    //   Section(
    //     'Limited Formats',
    //     () => {
    //       const c = prop('#3b82f6')
    //       return html.div(
    //         attr.class('flex flex-col gap-3'),
    //         ColorPicker({
    //           value: c,
    //           onChange: c.set,
    //           formats: ['hex', 'rgb'],
    //         }),
    //         pickerPreview('', c)
    //       )
    //     },
    //     'Use formats to limit available color spaces. The format selector adjusts automatically.'
    //   ),
    //   Section(
    //     'With Swatches',
    //     () => {
    //       const c = prop('#3b82f6')
    //       return html.div(
    //         attr.class('flex flex-col gap-3'),
    //         ColorPicker({
    //           value: c,
    //           onChange: c.set,
    //           swatches: [
    //             '#ef4444', '#f97316', '#eab308', '#22c55e',
    //             '#3b82f6', '#8b5cf6', '#ec4899', '#000000',
    //           ],
    //         }),
    //         pickerPreview('', c)
    //       )
    //     },
    //     'Provide preset swatches for quick color selection.'
    //   ),

    //   // ── Standalone Pickers ───────────────────────────────────────────────
    //   Section(
    //     'HexColorPicker',
    //     () => {
    //       const c = prop('#e74c3c')
    //       return html.div(
    //         attr.class('flex flex-col gap-3'),
    //         HexColorPicker({ value: c, onChange: c.set }),
    //         pickerPreview('hex', c)
    //       )
    //     },
    //     'Standalone hex color picker. SL canvas + hue strip + hex text input.'
    //   ),
    //   // TODO: uncomment RgbColorPicker section after refactor
    //   Section(
    //     'HslColorPicker',
    //     () => {
    //       const c = prop('hsl(280, 70%, 50%)')
    //       return html.div(
    //         attr.class('flex flex-col gap-3'),
    //         HslColorPicker({ value: c, onChange: c.set }),
    //         pickerPreview('hsl', c)
    //       )
    //     },
    //     'Standalone HSL picker with H, S, L channel inputs.'
    //   ),
    //   // TODO: uncomment HwbColorPicker, OklchColorPicker, and Standalone with Alpha sections after refactor
    //   Section(
    //     'Disabled',
    //     () =>
    //       ColorPicker({
    //         value: '#3b82f6',
    //         onChange: () => {},
    //         disabled: true,
    //       }),
    //     'Disabled state prevents all interaction.'
    //   ),
    // ],
  })
}

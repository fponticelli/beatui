import {
  attr,
  Renderable,
  Value,
  WithElement,
  html,
  TNode,
  style,
  prop,
  Signal,
  Empty,
  Prop,
  Fragment,
  on,
  When,
  effectOf,
  Ensure,
  NillifyValue,
} from '@tempots/dom'
import { NumberInput } from '../number-input'
import { ElementRect } from '@tempots/ui'
import { Label } from '../../../typography'
import { Color, colorToString, withColor } from '@tempots/std'
import { drawCheckerboard } from './canvas-draw'

export interface RenderOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
  ctx: CanvasRenderingContext2D
}

export interface ChannelPickerOptions {
  /** Current value. */
  value: Value<number>
  /** Callback on value change. */
  onChange?: (value: number) => void
  /** Callback on value input. */
  onInput?: (value: number) => void
  /** Function to draw the strip background. */
  draw: (options: RenderOptions) => void
  /** Dependencies that trigger a redraw. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: (Signal<any> | Prop<never>)[]
  /** Min for the number input. */
  min: Value<number>
  /** Max for the number input. */
  max: Value<number>
  /** Step for the number input. */
  step?: Value<number>
  unit?: TNode
  /** Handle color as CSS string. */
  handleColor?: Value<string>
  /** Whether disabled. @default false */
  disabled?: Value<boolean>
  /** Strip height. @default 14 */
  stripHeight?: Value<number>
  label: Value<string>
}

export function ChannelPicker(options: ChannelPickerOptions): Renderable {
  const {
    value,
    onChange,
    onInput,
    draw,
    dependencies = [],
    min,
    max,
    step = 1,
    handleColor,
    disabled = false,
    label,
    unit,
  } = options

  const percent = Value.toSignal(
    Value.map(
      value,
      v => ((v - Value.get(min)) / (Value.get(max) - Value.get(min))) * 100
    )
  )

  const stripSize = prop({ w: 0, h: 0 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deps = [...dependencies, stripSize as Prop<any>]

  const mouseDown = prop(false)
  let canvasElement: HTMLCanvasElement | null = null

  function handlePointerEvent(e: PointerEvent, force?: boolean) {
    if ((!Value.get(mouseDown) && !force) || Value.get(disabled)) return
    const rect = canvasElement?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const delta = Value.get(max) - Value.get(min)
    const normalized = Math.max(
      Value.get(min),
      Math.min(Value.get(max), Value.get(min) + (x / rect.width) * delta)
    )
    onChange?.(normalized)
    onInput?.(normalized)
  }

  const strip = html.div(
    attr.class('bc-color-picker__strip-wrap'),
    ElementRect(r => {
      r.on(v => stripSize.set({ w: v.width, h: v.height }))
      return Empty
    }),
    html.div(
      attr.class('bc-color-picker__canvas-wrap'),
      html.canvas(
        attr.class('bc-color-picker__canvas'),
        attr.width(Value.map(stripSize.$.w, String)),
        attr.height(Value.map(stripSize.$.h, String)),
        on.pointerdown(e => {
          const ev = e as unknown as PointerEvent
          ;(ev.target as HTMLElement).setPointerCapture(ev.pointerId)
          mouseDown.set(true)
          handlePointerEvent(ev, true)
        }),
        on.pointerup(e => {
          const ev = e as unknown as PointerEvent
          ;(ev.target as HTMLElement).releasePointerCapture(ev.pointerId)
          mouseDown.set(false)
        }),
        on.pointermove(e => handlePointerEvent(e as unknown as PointerEvent)),
        WithElement((canvas: HTMLCanvasElement) => {
          canvasElement = canvas
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          effectOf(...deps)(() => {
            draw({
              canvas,
              ctx,
              width: canvas.width,
              height: canvas.height,
            })
          })
        })
      )
    ),
    html.div(
      attr.class('bc-color-picker__handle'),
      style.left(percent.map(v => `${v.toFixed(1)}%`)),
      style.backgroundColor(handleColor)
    )
  )

  return Fragment(
    ElementRect(r =>
      When(
        r.$.width.map(w => w > 400),
        () => Label(attr.class('bc-color-picker__label'), label),
        () =>
          Fragment(
            attr.class('bc-color-picker__compact'),
            Label(
              attr.class('bc-color-picker__label'),
              Value.map(label, l => l.slice(0, 1))
            )
          )
      )
    ),
    html.div(attr.class('bc-color-picker__channel__strip'), strip),
    html.div(
      attr.class('bc-color-picker__channel__input'),
      NumberInput({
        value,
        onChange,
        onInput,
        min,
        max,
        step,
        disabled,
        unit,
        formatted: true,
      })
    )
  )
}

export interface AlphaChannelPickerOptions {
  /** Current value. */
  value: Value<number>
  /** The color to use for the strip. */
  color: Signal<Color>
  /** Callback on value change. */
  onChange?: (value: number) => void
  /** Callback on value input. */
  onInput?: (value: number) => void
  /** Dependencies that trigger a redraw. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: (Signal<any> | Prop<never>)[]
  /** Whether disabled. @default false */
  disabled?: Value<boolean>
}

const emitOn = (fn?: (value: number) => void) => {
  if (fn == null) return undefined
  return (v: number) => {
    fn(v)
  }
}

export function AlphaChannelPicker(
  options: AlphaChannelPickerOptions
): Renderable {
  const { value, color, onChange, onInput, dependencies, disabled } = options
  return ChannelPicker({
    label: 'Alpha',
    value,
    onChange: emitOn(onChange),
    onInput: emitOn(onInput),
    draw: ({ ctx, width, height }) => {
      drawCheckerboard(ctx, width, height, height / 2)
      const grad = ctx.createLinearGradient(0, 0, width, 0)
      const start = colorToString(withColor(color.value, { alpha: 0 }))
      const end = colorToString(withColor(color.value, { alpha: 1 }))
      grad.addColorStop(0, start)
      grad.addColorStop(1, end)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    },
    dependencies,
    min: 0,
    max: 100,
    unit: '%',
    disabled,
  })
}

export interface ColorFieldOptions {
  render: (options: RenderOptions) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: Signal<any>[]
  handlePosition?: Signal<{ x: number; y: number }>
  handleColor?: Value<string>
  disabled?: Value<boolean>
  onChange?: (value: { x: number; y: number }) => void
  onInput?: (value: { x: number; y: number }) => void
}

export function ColorField(options: ColorFieldOptions): Renderable {
  const {
    render,
    dependencies,
    handlePosition,
    handleColor,
    disabled = false,
    onChange,
    onInput,
  } = options
  const size = prop({ w: 0, h: 0 })
  const mouseDown = prop(false)
  const deps = [...(dependencies ?? []), size]
  let canvasElement: HTMLCanvasElement | null = null

  function handlePointerEvent(e: PointerEvent, force?: boolean) {
    if ((!Value.get(mouseDown) && !force) || Value.get(disabled)) return
    const rect = canvasElement?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const val = {
      x: Math.max(0, Math.min(1, x / rect.width)),
      y: Math.max(0, Math.min(1, y / rect.height)),
    }
    onChange?.(val)
    onInput?.(val)
  }

  return html.div(
    attr.class('bc-color-picker__field-container'),
    html.canvas(
      attr.width(Value.map(size.$.w, String)),
      attr.height(Value.map(size.$.h, String)),
      attr.class('bc-color-picker__field'),
      ElementRect(r => {
        r.on(v => size.set({ w: v.width, h: v.height }))
        return Empty
      }),
      Ensure(handlePosition as NillifyValue<{ x: number; y: number }>, () =>
        Fragment(
          on.pointerdown(e => {
            const ev = e as unknown as PointerEvent
            ;(ev.target as HTMLElement).setPointerCapture(ev.pointerId)
            mouseDown.set(true)
            handlePointerEvent(ev, true)
          }),
          on.pointerup(e => {
            const ev = e as unknown as PointerEvent
            ;(ev.target as HTMLElement).releasePointerCapture(ev.pointerId)
            mouseDown.set(false)
          }),
          on.pointermove(e => handlePointerEvent(e as unknown as PointerEvent))
        )
      ),
      WithElement((canvas: HTMLCanvasElement) => {
        canvasElement = canvas
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        effectOf(...deps)(() => {
          render({
            canvas,
            ctx,
            width: canvas.width,
            height: canvas.height,
          })
        })
      })
    ),
    Ensure(handlePosition as NillifyValue<{ x: number; y: number }>, pos =>
      Fragment(
        attr.class('bc-color-picker__field-interactive'),
        html.div(
          attr.class('bc-color-picker__handle'),
          style.left(pos.$.x.map(v => `${(v * 100).toFixed(1)}%`)),
          style.top(pos.$.y.map(v => `${(v * 100).toFixed(1)}%`)),
          style.backgroundColor(handleColor)
        )
      )
    )
  )
}

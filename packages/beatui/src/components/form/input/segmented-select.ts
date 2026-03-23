import {
  TNode,
  Value,
  attr,
  html,
  on,
  style,
  prop,
  computedOf,
  WithElement,
  OnDispose,
  ForEach,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { ThemeColorName } from '../../../tokens'
import { backgroundValue, ExtendedColor } from '../../theme/style-utils'
import { delayedAnimationFrame } from '@tempots/std'
import { ElementRect } from '@tempots/ui'
import { SelectOption, Option, ValueOption } from './option'

function arrEquality<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * Configuration options for the {@link SegmentedSelect} component.
 *
 * @template T - The type of the selectable option values
 */
export interface SegmentedSelectOptions<T> {
  /** The list of selectable options. Groups are flattened and breaks are ignored. */
  options: Value<SelectOption<T>[]>
  /** The currently selected value */
  value: Value<T>
  /** Callback invoked when a different option is selected */
  onChange?: (value: T) => void
  /** Custom equality function for comparing option values. @default strict equality (===) */
  equality?: (a: T, b: T) => boolean
  /** Visual size of the segmented control. @default 'md' */
  size?: Value<ControlSize>
  /** Whether the segmented control is disabled. @default false */
  disabled?: Value<boolean>
  /**
   * Shape variant. `'pill'` uses fully rounded corners, `'squared'` uses control-like
   * border-radius and taller padding to match the height of regular inputs like TextInput.
   * @default 'squared'
   */
  variant?: Value<'pill' | 'squared'>
  /**
   * Theme color for the active segment indicator and text, using solid button-style coloring.
   * When not set, uses the default white indicator with primary-tinted active text.
   */
  color?: Value<ThemeColorName>
}

function generateSegmentedSelectClasses(
  size: ControlSize,
  disabled: boolean,
  variant: 'pill' | 'squared'
): string {
  const classes = ['bc-segmented-input', `bc-segmented-input--size-${size}`]

  if (variant === 'squared') {
    classes.push('bc-segmented-input--squared')
  }

  if (disabled) {
    classes.push('bc-segmented-input--disabled')
  }

  return classes.join(' ')
}

function generateSegmentedSelectStyles(
  color: ThemeColorName | undefined
): string {
  if (color == null) return ''
  const styles = new Map<string, string>()

  const baseLight = backgroundValue(color as ExtendedColor, 'solid', 'light')
  const baseDark = backgroundValue(color as ExtendedColor, 'solid', 'dark')

  styles.set('--si-indicator-bg', baseLight.backgroundColor)
  styles.set('--si-active-text', baseLight.textColor)
  styles.set('--si-indicator-bg-dark', baseDark.backgroundColor)
  styles.set('--si-active-text-dark', baseDark.textColor)

  return Array.from(styles.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * Extracts all ValueOptions from a SelectOption array, flattening groups and ignoring breaks.
 */
function flattenOptions<T>(options: SelectOption<T>[]): ValueOption<T>[] {
  return options.flatMap(o => {
    if (o.type === 'value') return [o]
    if (o.type === 'group') return flattenOptions(o.options)
    return []
  })
}

/**
 * A segmented control that allows selecting one value from a list of typed options.
 *
 * Renders a horizontal row of clickable segments with a sliding indicator, similar to
 * {@link SegmentedInput}, but accepts {@link SelectOption} arrays with typed values
 * instead of a static key-label record. This makes it suitable for use with the same
 * option data used by {@link NativeSelect} or {@link DropdownInput}.
 *
 * Groups are flattened and breaks are ignored since segments are rendered as a flat row.
 * Disabled individual options are respected.
 *
 * @template T - The type of the selectable option values
 * @param options - Configuration options for the segmented select
 * @param children - Additional child nodes to render after the control
 * @returns A styled segmented control element with animated indicator
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { SegmentedSelect, Option } from '@tempots/beatui'
 *
 * const selected = prop('list')
 * SegmentedSelect({
 *   options: [
 *     Option.value('list', 'List'),
 *     Option.value('grid', 'Grid'),
 *     Option.value('table', 'Table'),
 *   ],
 *   value: selected,
 *   onChange: v => selected.set(v),
 * })
 * ```
 *
 * @example
 * ```ts
 * // With typed enum values
 * type Status = 'active' | 'inactive' | 'archived'
 * const status = prop<Status>('active')
 * SegmentedSelect<Status>({
 *   options: [
 *     Option.value('active', 'Active'),
 *     Option.value('inactive', 'Inactive'),
 *     Option.value('archived', 'Archived', { disabled: true }),
 *   ],
 *   value: status,
 *   onChange: v => status.set(v),
 * })
 * ```
 */
export function SegmentedSelect<T>(
  {
    options,
    value,
    onChange,
    equality = (a, b) => a === b,
    size = 'md',
    disabled = false,
    variant = 'squared',
    color,
  }: SegmentedSelectOptions<T>,
  ...children: TNode[]
) {
  const flatOptions = Value.map(options, flattenOptions)
  const valueSignal = Value.toSignal(value)
  const rects = prop([] as { left: number; width: number }[], arrEquality)

  return html.div(
    attr.class(
      computedOf(
        size,
        disabled,
        variant
      )((size, disabled, variant) =>
        generateSegmentedSelectClasses(
          size ?? 'md',
          disabled ?? false,
          variant ?? 'squared'
        )
      )
    ),
    attr.style(
      color != null
        ? Value.map(color, c => generateSegmentedSelectStyles(c))
        : ''
    ),
    html.div(
      attr.class('bc-segmented-input__container'),
      html.div(
        attr.class('bc-segmented-input__indicator'),
        style.width(
          computedOf(
            valueSignal,
            rects,
            flatOptions
          )((v, rects, opts) => {
            const idx = opts.findIndex(o => equality(o.value, v as T))
            const rect = rects[idx]
            return rect != null ? `${rect.width}px` : '0px'
          })
        ),
        style.left(
          computedOf(
            valueSignal,
            rects,
            flatOptions
          )((v, rects, opts) => {
            const idx = opts.findIndex(o => equality(o.value, v as T))
            const rect = rects[idx]
            return rect != null ? `${rect.left}px` : '0px'
          })
        )
      ),
      ForEach(flatOptions, (option, { index }) => {
        return html.button(
          attr.type('button'),
          on.click(e => {
            e.preventDefault()
            const opt = Value.get(option)
            if (opt.disabled) return
            if (Value.get(disabled)) return
            onChange?.(opt.value)
          }),
          attr.disabled(
            computedOf(
              disabled,
              option
            )(
              (globalDisabled, o) =>
                (globalDisabled ?? false) || (o.disabled ?? false)
            )
          ),
          attr.class(
            computedOf(
              valueSignal,
              option
            )((v, o): string =>
              equality(o.value, v as T)
                ? 'bc-segmented-input__segment bc-segmented-input__segment--active'
                : 'bc-segmented-input__segment bc-segmented-input__segment--inactive'
            )
          ),
          ElementRect(rect => {
            function updateRect() {
              rects.update(sizes => {
                const newSizes = [...sizes]
                while (newSizes.length <= index) {
                  newSizes.push({ left: 0, width: 0 })
                }
                newSizes[index] = {
                  width: rect.value.width,
                  left: rect.value.localLeft,
                }
                return newSizes
              })
            }
            const cancel = delayedAnimationFrame(updateRect)
            return OnDispose(cancel, rect.on(updateRect))
          }),
          option.$.before != null
            ? html.span(
                attr.class('bc-segmented-input__segment-before'),
                option.$.before as unknown as TNode
              )
            : null,
          option.$.label,
          option.$.after != null
            ? html.span(
                attr.class('bc-segmented-input__segment-after'),
                option.$.after as unknown as TNode
              )
            : null
        )
      })
    ),
    ...children
  )
}

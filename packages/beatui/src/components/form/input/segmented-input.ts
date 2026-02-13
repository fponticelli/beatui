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
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { delayedAnimationFrame, objectEntries } from '@tempots/std'
import { ElementRect } from '@tempots/ui'
function arrEquality<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * Configuration options for the {@link SegmentedInput} component.
 *
 * @template T - A record type mapping segment keys to their display labels (as TNode)
 * @template K - The key type of the record (defaults to keyof T)
 */
export interface SegmentedInputOptions<
  T extends Record<string, TNode>,
  K extends keyof T = keyof T,
> {
  /** A record mapping segment identifiers to their display content (text, icons, or any TNode) */
  options: T
  /** The currently selected segment key */
  value: Value<K>
  /** Callback invoked when a different segment is selected */
  onChange?: (value: K) => void
  /** Visual size of the segmented control. @default 'md' */
  size?: Value<ControlSize>
  /** Whether the segmented control is disabled. @default false */
  disabled?: Value<boolean>
  /**
   * Shape variant. `'pill'` uses fully rounded corners, `'squared'` uses control-like
   * border-radius and taller padding to match the height of regular inputs like TextInput.
   * @default 'pill'
   */
  variant?: Value<'pill' | 'squared'>
}

function generateSegmentedInputClasses(
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

/**
 * A segmented control input that allows selecting one of several mutually exclusive options.
 *
 * Renders a horizontal row of clickable segments with a sliding indicator that animates
 * to highlight the currently selected segment. Each segment is defined by a key-value pair
 * in the `options` record, where keys serve as identifiers and values are rendered as
 * segment labels (text, icons, or any TNode). The sliding indicator width and position
 * are dynamically measured from the DOM using {@link ElementRect} and updated via
 * `requestAnimationFrame`.
 *
 * @template T - A record type mapping segment keys to their display labels
 * @param options - Configuration options for the segmented control
 * @param children - Additional child nodes to render after the segmented control
 * @returns A styled segmented control element with animated indicator
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { SegmentedInput } from '@tempots/beatui'
 *
 * const view = prop<'list' | 'grid' | 'table'>('list')
 * SegmentedInput({
 *   options: {
 *     list: 'List',
 *     grid: 'Grid',
 *     table: 'Table',
 *   },
 *   value: view,
 *   onChange: view.set,
 *   size: 'md',
 * })
 * ```
 *
 * @example
 * ```ts
 * // With icon labels
 * SegmentedInput({
 *   options: {
 *     light: Icon({ icon: 'line-md:sun' }),
 *     dark: Icon({ icon: 'line-md:moon' }),
 *   },
 *   value: prop<'light' | 'dark'>('light'),
 *   onChange: (v) => console.log('Theme:', v),
 * })
 * ```
 */
export function SegmentedInput<T extends Record<string, TNode>>(
  {
    options,
    value,
    onChange,
    size = 'md',
    disabled = false,
    variant = 'pill',
  }: SegmentedInputOptions<T, keyof T>,
  ...children: TNode[]
) {
  const optionsList = objectEntries(options).map(([key, label]) => ({
    key,
    label,
  }))

  return WithElement(() => {
    const indexes = Object.fromEntries(
      optionsList.map((o, i) => [o.key, i])
    ) as Record<keyof T, number>
    const rects = prop(
      optionsList.map(() => ({ left: 0, width: 0 })),
      arrEquality
    )
    return html.div(
      attr.class(
        computedOf(
          size,
          disabled,
          variant
        )((size, disabled, variant) =>
          generateSegmentedInputClasses(
            size ?? 'md',
            disabled ?? false,
            variant ?? 'pill'
          )
        )
      ),
      html.div(
        attr.class('bc-segmented-input__container'),
        html.div(
          attr.class('bc-segmented-input__indicator'),
          style.width(
            computedOf(
              value,
              rects
            )((v, s) => {
              const { width } = s[indexes[v as keyof T]! ?? 0]
              return `${width}px`
            })
          ),
          style.left(
            computedOf(
              value,
              rects
            )((v, s) => {
              const { left } = s[indexes[v as keyof T]! ?? 0]
              return `${left}px`
            })
          )
        ),
        // clickable buttons
        optionsList.map(({ label, key }, index) => {
          return html.button(
            attr.type('button'),
            on.click(e => {
              e.preventDefault()
              const isDisabled = Value.get(disabled)
              if (!isDisabled) {
                onChange?.(key as keyof T)
              }
            }),
            attr.disabled(disabled),
            attr.class('bc-segmented-input__segment'),
            attr.class(
              Value.map(value, (v): string => {
                return v === key
                  ? 'bc-segmented-input__segment--active'
                  : 'bc-segmented-input__segment--inactive'
              })
            ),
            ElementRect(rect => {
              function updateRect() {
                rects.update(sizes => {
                  const newSizes = [...sizes]
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
            label
          )
        })
      ),
      ...children
    )
  })
}

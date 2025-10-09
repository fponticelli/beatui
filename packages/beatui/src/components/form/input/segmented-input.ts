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

export interface SegmentedInputOptions<
  T extends Record<string, TNode>,
  K extends keyof T = keyof T,
> {
  options: T
  value: Value<K>
  onChange?: (value: K) => void
  size?: Value<ControlSize>
  disabled?: Value<boolean>
}

function generateSegmentedInputClasses(
  size: ControlSize,
  disabled: boolean
): string {
  const classes = ['bc-segmented-control', `bc-segmented-control--size-${size}`]

  if (disabled) {
    classes.push('bc-segmented-control--disabled')
  }

  return classes.join(' ')
}

export function SegmentedInput<T extends Record<string, TNode>>(
  {
    options,
    value,
    onChange,
    size = 'md',
    disabled = false,
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
          disabled
        )((size, disabled) =>
          generateSegmentedInputClasses(size ?? 'md', disabled ?? false)
        )
      ),
      html.div(
        attr.class('bc-segmented-control__container'),
        html.div(
          attr.class('bc-segmented-control__indicator'),
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
            attr.class('bc-segmented-control__segment'),
            attr.class(
              Value.map(value, (v): string => {
                return v === key
                  ? 'bc-segmented-control__segment--active'
                  : 'bc-segmented-control__segment--inactive'
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

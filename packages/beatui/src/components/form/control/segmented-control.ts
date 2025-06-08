import {
  TNode,
  Value,
  attr,
  html,
  on,
  style,
  prop,
  Use,
  computedOf,
  WithElement,
  OnDispose,
} from '@tempots/dom'
import { ControlSize, Theme } from '../../theme'
import { delayed, objectEntries } from '@tempots/std'
function arrEquality<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export interface SegmentedControlOptions<
  T extends Record<string, TNode>,
  K extends keyof T = keyof T,
> {
  options: T
  value: Value<K>
  onChange?: (value: K) => void
  size?: Value<ControlSize>
  disabled?: Value<boolean>
}

export function SegmentedControl<T extends Record<string, TNode>>({
  options,
  value,
  onChange,
  size = 'md',
  disabled = false,
}: SegmentedControlOptions<T, keyof T>) {
  const optionsList = objectEntries(options).map(([key, label]) => ({
    key,
    label,
  }))
  const indexes = Object.fromEntries(
    optionsList.map((o, i) => [o.key, i])
  ) as Record<keyof T, number>
  const rects = prop(
    optionsList.map(() => ({ left: 0, width: 0 })),
    arrEquality
  )
  return Use(Theme, theme => {
    return html.div(
      attr.class(
        computedOf(
          theme,
          size,
          disabled
        )(({ theme }, size, disabled) =>
          theme.segmentedControl({
            size,
            disabled,
          })
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
            WithElement(el => {
              const cancel = delayed(() => {
                rects.update(sizes => {
                  const newSizes = [...sizes]
                  newSizes[index] = {
                    width: el.offsetWidth,
                    left: el.offsetLeft,
                  }
                  return newSizes
                })
              }, 10)
              return OnDispose(cancel)
            }),
            label
          )
        })
      )
    )
  })
}

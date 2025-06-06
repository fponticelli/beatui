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
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'
import { ControlSize, Theme } from '../../theme'
import { objectEntries } from '@tempots/std'

// export interface SegmentedControlOptions {
//   segments: { label: TNode; onSelect?: () => void }[]
//   activeSegment: Value<number> | Value<number | null>
//   onSegmentChange?: (index?: number) => void
//   size?: Value<ControlSize>
// }

function arrEquality<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

// export function SegmentedControl({
//   segments,
//   activeSegment = null,
//   onSegmentChange,
//   size = 'md',
// }: SegmentedControlOptions) {
//   const currentSegment = Value.toSignal(
//     (activeSegment ?? null) as Value<number | null>
//   ).deriveProp()
//   const sizes = prop(
//     segments.map(() => 0),
//     arrEquality
//   )
//   return Use(Theme, theme => {
//     return html.div(
//       attr.class(
//         computedOf(
//           theme,
//           size
//         )(({ theme }, size) =>
//           theme.segmentedControl({
//             size,
//           })
//         )
//       ),
//       html.div(
//         attr.class('bc-segmented-control__container'),
//         // sliding tab block
//         html.div(
//           attr.class('bc-segmented-control__indicator'),
//           style.display(
//             currentSegment.map((i): string => (i == null ? 'none' : 'block'))
//           ),
//           style.width(
//             computed(() => {
//               const size = sizes.value[currentSegment.value ?? 0]
//               return `${size}px`
//             }, [currentSegment, sizes])
//           ),
//           style.left(
//             computed(() => {
//               const pos = sizes.value
//                 .slice(0, currentSegment.value ?? 0)
//                 .reduce((a, b) => a + b, 0)
//               return `${pos}px`
//             }, [currentSegment, sizes])
//           )
//         ),
//         // clickable buttons
//         segments.map(({ label, onSelect }, index) => {
//           return html.button(
//             // { href: href ?? '' },
//             on.click(e => {
//               e.preventDefault()
//               currentSegment.set(index)
//               onSegmentChange?.(index)
//               onSelect?.()
//             }),
//             attr.class('bc-segmented-control__segment'),
//             attr.class(
//               currentSegment.map((ci): string => {
//                 return ci == null || ci === index
//                   ? 'bc-segmented-control__segment--active'
//                   : 'bc-segmented-control__segment--inactive'
//               })
//             ),
//             ElementRect(s => {
//               s.on(({ width }) => {
//                 sizes.update(sizes => {
//                   const newSizes = sizes.slice(0)
//                   newSizes[index] = width
//                   return newSizes
//                 })
//               })
//               return label
//             })
//           )
//         })
//       )
//     )
//   })
// }

export interface SegmentedControlOptions<
  T extends Record<string, TNode>,
  K extends keyof T = keyof T,
> {
  options: T
  value: Value<K>
  onChange?: (value: K) => void
  size?: Value<ControlSize>
}

export function SegmentedControl<T extends Record<string, TNode>>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlOptions<T, keyof T>) {
  const optionsList = objectEntries(options).map(([key, label]) => ({
    key,
    label,
  }))
  const indexes = Object.fromEntries(
    optionsList.map((o, i) => [o.key, i])
  ) as Record<keyof T, number>
  // const currentSegment = Value.toSignal(
  //   (activeSegment ?? null) as Value<number | null>
  // ).deriveProp()
  const sizes = prop(
    optionsList.map(() => 0),
    arrEquality
  )
  return Use(Theme, theme => {
    return html.div(
      attr.class(
        computedOf(
          theme,
          size
        )(({ theme }, size) =>
          theme.segmentedControl({
            size,
          })
        )
      ),
      html.div(
        attr.class('bc-segmented-control__container'),
        // sliding tab block
        html.div(
          attr.class('bc-segmented-control__indicator'),
          // style.display(
          //   currentSegment.map((i): string => (i == null ? 'none' : 'block'))
          // ),
          style.width(
            computedOf(
              value,
              sizes
            )((v, s) => {
              const size = s[indexes[v as keyof T]! ?? 0] // optionsList.findIndex(o => o.key === v) ?? 0]
              return `${size}px`
            })
          ),
          style.left(
            computedOf(
              value,
              sizes
            )((v, s) => {
              const pos = s
                .slice(0, indexes[v as keyof T]! ?? 0)
                .reduce((a, b) => a + b, 0)
              return `${pos}px`
            })
          )
        ),
        // clickable buttons
        optionsList.map(({ label, key }, index) => {
          return html.button(
            // { href: href ?? '' },
            on.click(e => {
              e.preventDefault()
              onChange?.(key as keyof T)
              // value.set(key as keyof T)
              // currentSegment.set(index)
              // onSegmentChange?.(index)
              // onSelect?.()
            }),
            attr.class('bc-segmented-control__segment'),
            attr.class(
              Value.map(value, (v): string => {
                return v === key
                  ? 'bc-segmented-control__segment--active'
                  : 'bc-segmented-control__segment--inactive'
              })
              // currentSegment.map((ci): string => {
              //   return ci == null || ci === index
              //     ? 'bc-segmented-control__segment--active'
              //     : 'bc-segmented-control__segment--inactive'
              // })
            ),
            ElementRect(s => {
              s.on(({ width }) => {
                sizes.update(sizes => {
                  const newSizes = [...sizes]
                  newSizes[index] = width
                  return newSizes
                })
              })
              return label
            })
          )
        })
      )
    )
  })
}

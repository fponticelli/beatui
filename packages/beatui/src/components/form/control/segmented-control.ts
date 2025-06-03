import {
  TNode,
  Value,
  attr,
  html,
  on,
  style,
  prop,
  computed,
  Use,
  computedOf,
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'
import { ControlSize, Theme } from '../../theme'

export interface SegmentedControlProps {
  segments: { label: TNode; onSelect?: () => void }[]
  activeSegment: Value<number | null>
  onSegmentChange?: (index?: number) => void
  size?: Value<ControlSize>
}

function arrEquality<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

export function SegmentedControl({
  segments,
  activeSegment = null,
  onSegmentChange,
  size = 'sm',
}: SegmentedControlProps) {
  const currentSegment = Value.toSignal(activeSegment ?? null).deriveProp()
  const sizes = prop(
    segments.map(() => 0),
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
          style.display(
            currentSegment.map((i): string => (i == null ? 'none' : 'block'))
          ),
          style.width(
            computed(() => {
              const size = sizes.value[currentSegment.value ?? 0]
              return `${size}px`
            }, [currentSegment, sizes])
          ),
          style.left(
            computed(() => {
              const pos = sizes.value
                .slice(0, currentSegment.value ?? 0)
                .reduce((a, b) => a + b, 0)
              return `${pos}px`
            }, [currentSegment, sizes])
          )
        ),
        // clickable buttons
        segments.map(({ label, onSelect }, index) => {
          return html.button(
            // { href: href ?? '' },
            on.click(e => {
              e.preventDefault()
              currentSegment.set(index)
              onSegmentChange?.(index)
              onSelect?.()
            }),
            attr.class('bc-segmented-control__segment'),
            attr.class(
              currentSegment.map((ci): string => {
                return ci == null || ci === index
                  ? 'bc-segmented-control__segment--active'
                  : 'bc-segmented-control__segment--inactive'
              })
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

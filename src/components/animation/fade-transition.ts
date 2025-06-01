import {
  attr,
  Fragment,
  OnDispose,
  prop,
  Signal,
  TNode,
  Use,
  WithElement,
} from '@tempots/dom'
import { deferred } from '@tempots/std'
import { FadeTranstionState, Theme } from '../theme'

export type FadeTranstionOptions<El extends HTMLElement> = {
  onExit?: () => void
  enter?: (el: El) => Promise<void>
  exit?: (el: El) => Promise<void>
}

export function FadeTranstion<El extends HTMLElement>(
  { onExit, enter, exit }: FadeTranstionOptions<El>,
  onStateChange: (state: Signal<FadeTranstionState>, exit: () => void) => TNode
) {
  return WithElement<El>(el => {
    const state = prop('initial' as FadeTranstionState)
    setTimeout(() => {
      if (state.value === 'initial') {
        state.set('entering')
      }
      if (enter) {
        enter(el).then(() => {
          if (state.value === 'entering') {
            state.set('entered')
          }
        })
      } else {
        state.set('entered')
      }
    }, 0)

    const fnExit = () => {
      if (exit) {
        state.set('exiting')
        exit(el).then(() => state.set('exited'))
      } else {
        state.set('exiting')
        setTimeout(() => state.set('exited'), 0)
      }
    }

    state.on(value => {
      if (value === 'exited' && onExit) {
        setTimeout(onExit, 0)
      }
    })

    return Fragment(OnDispose(state.dispose), onStateChange(state, fnExit))
  })
}

function waitTransition(el: HTMLElement) {
  const { resolve, promise } = deferred<void>()
  const run = () => {
    if (el.getAnimations().length === 0) {
      resolve()
      return
    }
    el.addEventListener('transitionend', () => run(), { once: true })
  }
  setTimeout(run, 10)
  return promise
}

export function CSSFadeTransition<El extends HTMLElement>(
  { onExit }: FadeTranstionOptions<El>,
  onStateChange: (state: Signal<FadeTranstionState>, close: () => void) => TNode
) {
  return FadeTranstion(
    {
      onExit,
      enter: waitTransition,
      exit: waitTransition,
    },
    (state, exit) =>
      Fragment(
        Use(Theme, ({ theme }) =>
          attr.class(state.map(state => theme.fadeInOut({ state })))
        ),
        onStateChange(state, exit)
      )
  )
}

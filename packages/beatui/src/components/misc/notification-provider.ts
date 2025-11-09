import {
  Empty,
  OnDispose,
  Provider,
  Signal,
  TNode,
  Use,
  Value,
  WithBrowserCtx,
  attr,
  html,
  makeProviderMark,
  prop,
  renderWithContext,
} from '@tempots/dom'
import { Notification, NotificationOptions } from './notification'
import { RadiusName, ThemeColorName } from '../../tokens'
import { AnimatedToggle, AnimationConfig } from '../../utils'
import { sleep } from '@tempots/std'

type NotificationEntry = {
  animation: AnimationConfig
  children: TNode[]
  loading: Signal<boolean>
  withCloseButton: Signal<boolean>
  withBorder: Signal<boolean>
  color: Signal<ThemeColorName>
  radius: Signal<RadiusName>
  title: TNode
  icon: Signal<string | undefined>
  class: Signal<string | undefined>
  listenRequestClose: (fn: () => void) => void
  delayedClose?: Promise<void>
}

export type ShowNotificationOptions = NotificationOptions & {
  animation?: AnimationConfig
  dismissAfter?: number | Promise<void>
}

export type NotificationShowFn = (
  options: ShowNotificationOptions,
  ...children: TNode[]
) => void

export type NotificationViewportPosition =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'

export type NotificationProviderOptions = {
  position?: NotificationViewportPosition
}

export type NotificationProviderValue = {
  show: NotificationShowFn
  clear: () => void
  position: NotificationViewportPosition
  listenOnShow: (fn: (entry: NotificationEntry) => void) => () => void
  activeNotifications: Signal<number>
}

type NotificationServiceHandle = Pick<
  NotificationProviderValue,
  'show' | 'clear'
>

class NotificationServiceImpl {
  private handles: NotificationServiceHandle[] = []

  attach(handle: NotificationServiceHandle) {
    this.detach(handle)
    this.handles.push(handle)
    return () => this.detach(handle)
  }

  private detach(handle: NotificationServiceHandle) {
    const index = this.handles.lastIndexOf(handle)
    if (index >= 0) {
      this.handles.splice(index, 1)
    }
  }

  private get current(): NotificationServiceHandle {
    const handle = this.handles[this.handles.length - 1]
    if (!handle) {
      throw new Error(
        'NotificationService: no provider attached. Ensure BeatUI includes notifications or attach the provider manually.'
      )
    }
    return handle
  }

  show(options: ShowNotificationOptions, ...children: TNode[]) {
    return this.current.show(options, ...children)
  }

  clear() {
    this.current.clear()
  }
}

export const NotificationService = new NotificationServiceImpl()

export const NotificationProvider: Provider<
  NotificationProviderValue,
  NotificationProviderOptions
> = {
  mark: makeProviderMark<NotificationProviderValue>('NotificationProvider'),
  create: ({ position = 'bottom-end' }: NotificationProviderOptions = {}) => {
    const activeNotifications = prop(0)
    const onShowListeners: Array<(entry: NotificationEntry) => void> = []
    function listenOnShow(fn: (entry: NotificationEntry) => void) {
      onShowListeners.push(fn)
      return () => {
        const index = onShowListeners.lastIndexOf(fn)
        if (index >= 0) {
          onShowListeners.splice(index, 1)
        }
      }
    }

    const cleanup: Array<() => void> = []
    const show: NotificationShowFn = (
      { dismissAfter, onClose, animation = { fade: true }, ...options },
      ...children
    ) => {
      const localCleanup: Array<() => void> = []
      activeNotifications.update(n => n + 1)

      const delayedClose =
        dismissAfter != null
          ? typeof dismissAfter === 'number'
            ? sleep(dismissAfter * 1000)
            : dismissAfter
          : undefined

      const entry: NotificationEntry = {
        animation,
        class: Value.toSignal(options.class),
        loading: Value.toSignal(options.loading ?? false) as Signal<boolean>,
        withCloseButton: Value.toSignal(
          options.withCloseButton == null && dismissAfter == null
            ? true
            : (options.withCloseButton ?? true)
        ),
        withBorder: Value.toSignal(options.withBorder ?? false),
        color: Value.toSignal(options.color ?? 'primary'),
        radius: Value.toSignal(options.radius ?? 'md'),
        title: options.title ?? Empty,
        icon: Value.toSignal(options.icon),
        children,
        listenRequestClose: (fn: () => void) => {
          localCleanup.push(fn)
          cleanup.push(fn)
          onClose?.()
          return () => {
            const index = localCleanup.lastIndexOf(fn)
            if (index >= 0) {
              localCleanup.splice(index, 1)
            }
          }
        },
        delayedClose,
      }

      onShowListeners.forEach(fn => fn(entry))
    }

    const clear = () => {
      cleanup.forEach(fn => fn())
      cleanup.length = 0
    }

    const detach = NotificationService.attach({ show, clear })

    return {
      value: {
        activeNotifications,
        show,
        clear,
        position,
        listenOnShow,
      },
      dispose: () => {
        detach()
        clear()
      },
    }
  },
}

export function NotificationViewport() {
  return Use(NotificationProvider, ({ listenOnShow, position }) => {
    return html.div(
      attr.class('bc-notification-viewport'),
      attr.class(`bc-notification-viewport--${position}`),
      WithBrowserCtx(ctx =>
        OnDispose(
          listenOnShow(entry => {
            const cleanup: Array<() => void> = []
            const notification = html.div(
              AnimatedToggle(
                {
                  animation: entry.animation,
                  initialStatus: 'start-opening',
                },
                ({ close, listenOnClosed }) => {
                  entry.delayedClose?.finally(close)
                  listenOnClosed(() => {
                    cleanup.forEach(fn => fn())
                  })
                  return Notification(
                    {
                      class: entry.class,
                      loading: entry.loading,
                      withCloseButton: entry.withCloseButton,
                      withBorder: entry.withBorder,
                      color: entry.color,
                      radius: entry.radius,
                      title: entry.title,
                      icon: entry.icon,
                      onClose: close,
                    },
                    ...entry.children
                  )
                }
              )
            )
            cleanup.push(renderWithContext(notification, ctx))
          })
        )
      )
    )
  })
}

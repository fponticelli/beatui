import {
  Empty,
  ForEach,
  Provider,
  Signal,
  TNode,
  Use,
  Value,
  When,
  attr,
  html,
  makeProviderMark,
  prop,
} from '@tempots/dom'
import { Notification, NotificationOptions } from './notification'

type NotificationEntry = {
  id: number
  options: NotificationOptions
  children: TNode[]
  requestClose: () => void
  finalize: () => void
  open: Signal<boolean>
}

export type NotificationShowFn = (
  options: NotificationOptions,
  ...children: TNode[]
) => () => void

export type NotificationProviderValue = {
  notifications: Signal<NotificationEntry[]>
  show: NotificationShowFn
  clear: () => void
}

type NotificationServiceHandle = Pick<NotificationProviderValue, 'show' | 'clear'>

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

  show(options: NotificationOptions, ...children: TNode[]) {
    return this.current.show(options, ...children)
  }

  clear() {
    this.current.clear()
  }
}

export const NotificationService = new NotificationServiceImpl()

export const NotificationProvider: Provider<
  NotificationProviderValue,
  object
> = {
  mark: makeProviderMark<NotificationProviderValue>('NotificationProvider'),
  create: () => {
    const notifications = prop<NotificationEntry[]>([])
    let counter = 0

    const show: NotificationShowFn = (options, ...children) => {
      const id = ++counter
      const open = prop(true)
      let finalized = false
      let pendingFinalizeTimeout: ReturnType<typeof setTimeout> | null = null
      const cleanup: Array<() => void> = []

      const finalize = () => {
        if (finalized) return
        finalized = true
        if (pendingFinalizeTimeout) {
          clearTimeout(pendingFinalizeTimeout)
          pendingFinalizeTimeout = null
        }
        cleanup.forEach(fn => {
          try {
            fn()
          } catch {
            /* ignore cleanup errors */
          }
        })
        notifications.update(entries =>
          entries.filter(entry => entry.id !== id)
        )
        options.onClose?.()
      }

      const requestClose = () => {
        if (!open.value) return
        open.set(false)
        if (!pendingFinalizeTimeout) {
          pendingFinalizeTimeout = setTimeout(() => {
            finalize()
          }, 1000)
        }
      }

      const entry: NotificationEntry = {
        id,
        options,
        children,
        requestClose,
        finalize,
        open,
      }

      const resolvedDismissAfter =
        options.dismissAfter != null
          ? Value.get(options.dismissAfter)
          : undefined
      if (
        resolvedDismissAfter != null &&
        !Number.isNaN(resolvedDismissAfter) &&
        resolvedDismissAfter > 0
      ) {
        const timeout = setTimeout(() => {
          requestClose()
        }, resolvedDismissAfter * 1000)
        cleanup.push(() => clearTimeout(timeout))
      }

      if (options.dismissWhen) {
        let active = true
        options.dismissWhen
          .then(() => {
            if (!active) return
            requestClose()
          })
          .catch(() => {
            // Swallow promise errors; they shouldn't break notifications
          })
        cleanup.push(() => {
          active = false
        })
      }

      notifications.update(entries => [...entries, entry])
      return requestClose
    }

    const clear = () => {
      const snapshot = [...Value.get(notifications)]
      snapshot.forEach(entry => entry.requestClose())
    }

    const detach = NotificationService.attach({ show, clear })

    return {
      value: {
        notifications,
        show,
        clear,
      },
      dispose: () => {
        detach()
        clear()
        notifications.dispose()
      },
    }
  },
}

export function NotificationViewport() {
  return Use(NotificationProvider, ({ notifications }) => {
    const hasNotifications = notifications.map(entries => entries.length > 0)
    return When(
      hasNotifications,
      () =>
        html.div(
          attr.class('bc-notification-viewport'),
          ForEach(notifications, entrySignal => {
            const entry = entrySignal.value
            const normalized =
              entry.options.withCloseButton === undefined
                ? { ...entry.options, withCloseButton: true }
                : entry.options
            return Notification(
              {
                ...normalized,
                open: entry.open,
                onRequestClose: entry.requestClose,
                onClose: entry.finalize,
              },
              ...entry.children
            )
          })
        ),
      () => Empty
    )
  })
}

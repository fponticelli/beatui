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

/**
 * Internal representation of a queued notification within the notification
 * provider. Each entry captures the resolved reactive signals, animation
 * configuration, and lifecycle hooks for a single notification instance.
 */
type NotificationEntry = {
  /** Animation configuration for the notification's enter/exit transitions. */
  animation: AnimationConfig
  /** Child content nodes rendered inside the notification body. */
  children: TNode[]
  /** Reactive signal indicating whether the notification is in a loading state. */
  loading: Signal<boolean>
  /** Reactive signal controlling close button visibility. */
  withCloseButton: Signal<boolean>
  /** Reactive signal controlling border visibility. */
  withBorder: Signal<boolean>
  /** Reactive signal for the notification's theme color. */
  color: Signal<ThemeColorName>
  /** Reactive signal for the notification's border radius. */
  radius: Signal<RadiusName>
  /** Title content rendered above the notification body. */
  title: TNode
  /** Reactive signal for the Iconify icon identifier. */
  icon: Signal<string | undefined>
  /** Reactive signal for additional CSS class(es). */
  class: Signal<string | undefined>
  /** Registers a callback to be invoked when the notification should close. */
  listenRequestClose: (fn: () => void) => void
  /** Optional promise that, when resolved, triggers automatic dismissal. */
  delayedClose?: Promise<void>
}

/**
 * Options for showing a notification via the notification provider.
 * Extends {@link NotificationOptions} with animation and auto-dismiss settings.
 */
export type ShowNotificationOptions = NotificationOptions & {
  /**
   * Animation configuration for the notification's enter/exit transitions.
   * @default { fade: true }
   */
  animation?: AnimationConfig
  /**
   * Auto-dismiss behavior. When a `number` is provided, the notification
   * is dismissed after that many seconds. When a `Promise` is provided,
   * the notification is dismissed when the promise resolves.
   */
  dismissAfter?: number | Promise<void>
}

/**
 * Function signature for showing a notification. Accepts configuration options
 * and child content nodes.
 *
 * @param options - Configuration for the notification appearance and behavior.
 * @param children - Content nodes rendered inside the notification body.
 */
export type NotificationShowFn = (
  options: ShowNotificationOptions,
  ...children: TNode[]
) => void

/**
 * Screen corner position where the notification viewport is anchored.
 *
 * - `'top-start'` - Top-left in LTR layouts, top-right in RTL
 * - `'top-end'` - Top-right in LTR layouts, top-left in RTL
 * - `'bottom-start'` - Bottom-left in LTR layouts, bottom-right in RTL
 * - `'bottom-end'` - Bottom-right in LTR layouts, bottom-left in RTL
 */
export type NotificationViewportPosition =
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'

/**
 * Options for configuring the {@link NotificationProvider}.
 */
export type NotificationProviderOptions = {
  /**
   * Screen corner where notifications are displayed.
   * @default 'bottom-end'
   */
  position?: NotificationViewportPosition
}

/**
 * Value exposed by the {@link NotificationProvider} to its consumers.
 * Provides methods to show and clear notifications, and reactive state
 * about active notification count.
 */
export type NotificationProviderValue = {
  /** Shows a new notification with the given options and content. */
  show: NotificationShowFn
  /** Dismisses all currently active notifications. */
  clear: () => void
  /** The viewport position where notifications are rendered. */
  position: NotificationViewportPosition
  /**
   * Registers a listener invoked whenever a new notification is shown.
   * Returns an unsubscribe function.
   */
  listenOnShow: (fn: (entry: NotificationEntry) => void) => () => void
  /** Reactive signal tracking the number of currently visible notifications. */
  activeNotifications: Signal<number>
}

/**
 * A subset of the notification provider value exposing only the `show` and `clear` methods.
 */
type NotificationServiceHandle = Pick<
  NotificationProviderValue,
  'show' | 'clear'
>

/**
 * Internal implementation of the global notification service. Maintains a
 * stack of attached provider handles so that the most recently attached
 * provider receives show/clear calls. This enables nested providers where
 * inner providers take precedence.
 */
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

/**
 * Global singleton notification service that delegates to the most recently
 * attached {@link NotificationProvider}. Use this to show notifications
 * imperatively from anywhere in the application without needing direct
 * access to the provider context.
 *
 * @example
 * ```typescript
 * // Show a notification imperatively
 * NotificationService.show(
 *   { title: 'Saved', color: 'success', dismissAfter: 3 },
 *   'Your changes have been saved.'
 * )
 *
 * // Clear all active notifications
 * NotificationService.clear()
 * ```
 */
export const NotificationService = new NotificationServiceImpl()

/**
 * Provider that manages the notification system lifecycle. Creates a notification
 * queue, registers with the global {@link NotificationService}, and exposes
 * `show` / `clear` methods to consumers via the Tempo provider pattern.
 *
 * Attach this provider in your application root (or use BeatUI's built-in
 * integration) to enable notification rendering through {@link NotificationViewport}.
 *
 * @example
 * ```typescript
 * import { Provide, Use } from '@tempots/dom'
 *
 * // Provide the notification system
 * Provide(NotificationProvider, { position: 'top-end' },
 *   // Consume from a child component
 *   Use(NotificationProvider, ({ show }) => {
 *     show(
 *       { title: 'Hello', color: 'primary', dismissAfter: 5 },
 *       'Welcome to the app!'
 *     )
 *     return html.div('App content')
 *   })
 * )
 * ```
 */
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

/**
 * Renders the notification viewport container that displays active notifications.
 * Must be placed inside a tree that has a {@link NotificationProvider} ancestor.
 *
 * The viewport listens for new notifications via `listenOnShow` and renders
 * each one with enter/exit animations managed by `AnimatedToggle`. Notifications
 * with `delayedClose` are automatically dismissed when the delay resolves.
 *
 * @returns A renderable viewport element positioned according to the provider's
 *   `position` setting (e.g., `'bottom-end'`).
 *
 * @example
 * ```typescript
 * import { Provide } from '@tempots/dom'
 *
 * // Place the viewport at the app root alongside the provider
 * Provide(NotificationProvider, { position: 'bottom-end' },
 *   html.div(
 *     // ... app content ...
 *   ),
 *   NotificationViewport()
 * )
 * ```
 */
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

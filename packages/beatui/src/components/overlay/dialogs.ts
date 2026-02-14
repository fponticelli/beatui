import {
  attr,
  html,
  TNode,
  Value,
  Fragment,
  coalesce,
  Use,
  Renderable,
  on,
  style,
  Empty,
  prop,
  emitValue,
} from '@tempots/dom'
import { Modal, ModalOptions } from './modal'
import { Button } from '../button'
import { Icon } from '../data/icon'
import { ThemeColorName, getColorVar } from '../../tokens'
import { BeatUII18n } from '../../beatui-i18n'

// --- ConfirmationDialog ---

/**
 * Configuration options for the {@link ConfirmationDialog} component.
 */
export interface ConfirmationDialogOptions {
  /**
   * Dialog title displayed next to the icon.
   */
  title: Value<string>
  /**
   * Descriptive body text explaining what the action does.
   */
  body: Value<string>
  /**
   * Iconify icon identifier displayed in a colored circle.
   * @default 'lucide:alert-triangle'
   */
  icon?: Value<string>
  /**
   * Semantic color applied to the icon background and confirm button.
   * @default 'danger'
   */
  color?: Value<ThemeColorName>
  /**
   * Optional list of consequences displayed as bullet points.
   */
  consequences?: string[]
  /**
   * Custom label for the confirm button. Falls back to i18n `confirm` string.
   */
  confirmText?: Value<string>
  /**
   * Custom label for the cancel button. Falls back to i18n `cancel` string.
   */
  cancelText?: Value<string>
  /**
   * Callback invoked when the user clicks the confirm button.
   */
  onConfirm?: () => void
  /**
   * Callback invoked when the user clicks the cancel button or dismisses the dialog.
   */
  onCancel?: () => void
  /**
   * Whether the dialog can be closed by clicking outside or pressing Escape.
   * @default true
   */
  dismissable?: Value<boolean>
}

/**
 * A confirmation dialog for destructive or warning actions.
 *
 * Displays a title with an icon, a descriptive body, optional consequence list,
 * and confirm/cancel action buttons. Built on top of {@link Modal}.
 *
 * @param options - Configuration options for the dialog content and callbacks
 * @param fn - A render function that receives `open` and `close` callbacks and returns the trigger content.
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * ConfirmationDialog(
 *   {
 *     title: 'Delete collection',
 *     body: 'This will permanently remove all 24 records.',
 *     icon: 'lucide:trash-2',
 *     color: 'danger',
 *     consequences: [
 *       'All records will be moved to trash',
 *       'Shared access will be revoked',
 *     ],
 *     confirmText: 'Delete collection',
 *     cancelText: 'Keep collection',
 *     onConfirm: () => deleteCollection(),
 *   },
 *   (open, close) => Button({ onClick: open }, 'Delete')
 * )
 * ```
 */
export function ConfirmationDialog(
  options: ConfirmationDialogOptions,
  fn: (open: () => void, close: () => void) => TNode
): Renderable {
  const {
    title,
    body,
    icon = 'lucide:alert-triangle',
    color = 'danger',
    consequences,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    dismissable = true,
  } = options

  const modalOptions: ModalOptions = {
    size: 'sm',
    showCloseButton: false,
    dismissable,
    onClose: onCancel,
  }

  return Use(BeatUII18n, t =>
    Modal(modalOptions, (openModal, close) => {
      const handleConfirm = () => {
        onConfirm?.()
        close()
      }

      const handleCancel = () => {
        onCancel?.()
        close()
      }

      const open = () => {
        openModal({
          header: html.div(
            attr.class('bc-dialog__header-row'),
            html.div(
              attr.class('bc-dialog__icon'),
              style.backgroundColor(Value.map(color, c => getColorVar(c, 100))),
              style.color(Value.map(color, c => getColorVar(c, 600))),
              Icon({ icon, size: 'sm' })
            ),
            html.span(attr.class('bc-dialog__title'), title)
          ),
          body: html.div(
            attr.class('bc-dialog__body'),
            html.p(attr.class('bc-dialog__description'), body),
            consequences && consequences.length > 0
              ? html.ul(
                  attr.class('bc-dialog__consequences'),
                  ...consequences.map(c => html.li(c))
                )
              : Empty
          ),
          footer: Fragment(
            attr.class('bc-dialog__actions'),
            Button(
              { variant: 'light', size: 'sm', onClick: handleCancel },
              coalesce(cancelText, t.$.cancel)
            ),
            Button(
              {
                color,
                variant: 'filled',
                size: 'sm',
                onClick: handleConfirm,
              },
              coalesce(confirmText, t.$.confirm)
            )
          ),
        })
      }

      return fn(open, close)
    })
  )
}

// --- AlertDialog ---

/**
 * Visual variant for the {@link AlertDialog}, controlling the default icon and color.
 */
export type AlertDialogVariant = 'info' | 'success' | 'warning' | 'error'

const alertVariantDefaults: Record<
  AlertDialogVariant,
  { icon: string; color: ThemeColorName }
> = {
  info: { icon: 'lucide:info', color: 'info' },
  success: { icon: 'lucide:check-circle', color: 'success' },
  warning: { icon: 'lucide:alert-triangle', color: 'warning' },
  error: { icon: 'lucide:alert-circle', color: 'danger' },
}

/**
 * Configuration options for the {@link AlertDialog} component.
 */
export interface AlertDialogOptions {
  /**
   * Dialog title displayed next to the icon.
   */
  title: Value<string>
  /**
   * Body content of the alert.
   */
  body: TNode
  /**
   * Visual variant controlling the default icon and color.
   * @default 'info'
   */
  variant?: AlertDialogVariant
  /**
   * Override icon. If not provided, a default icon is used based on the variant.
   */
  icon?: Value<string>
  /**
   * Custom label for the OK button.
   * @default 'OK'
   */
  okText?: Value<string>
  /**
   * Callback invoked when the user acknowledges the alert.
   */
  onOk?: () => void
  /**
   * Whether the dialog can be closed by clicking outside or pressing Escape.
   * @default true
   */
  dismissable?: Value<boolean>
}

/**
 * An alert dialog for displaying important messages to the user.
 *
 * Supports info, success, warning, and error variants with appropriate icons and colors.
 * Has a single acknowledge button. Built on top of {@link Modal}.
 *
 * @param options - Configuration options for the alert content
 * @param fn - A render function that receives `open` and `close` callbacks and returns the trigger content.
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * AlertDialog(
 *   {
 *     title: 'Changes saved',
 *     body: html.p('Your settings have been updated successfully.'),
 *     variant: 'success',
 *   },
 *   (open, close) => Button({ onClick: open }, 'Save')
 * )
 * ```
 */
export function AlertDialog(
  options: AlertDialogOptions,
  fn: (open: () => void, close: () => void) => TNode
): Renderable {
  const {
    title,
    body,
    variant = 'info',
    icon,
    okText,
    onOk,
    dismissable = true,
  } = options

  const defaults = alertVariantDefaults[variant]
  const resolvedIcon = icon ?? defaults.icon
  const resolvedColor = defaults.color

  const modalOptions: ModalOptions = {
    size: 'sm',
    showCloseButton: false,
    dismissable,
    onClose: onOk,
  }

  return Use(BeatUII18n, t =>
    Modal(modalOptions, (openModal, close) => {
      const handleOk = () => {
        onOk?.()
        close()
      }

      const open = () => {
        openModal({
          header: html.div(
            attr.class('bc-dialog__header-row'),
            html.div(
              attr.class('bc-dialog__icon'),
              style.backgroundColor(getColorVar(resolvedColor, 100)),
              style.color(getColorVar(resolvedColor, 600)),
              Icon({ icon: resolvedIcon, size: 'sm' })
            ),
            html.span(attr.class('bc-dialog__title'), title)
          ),
          body: html.div(attr.class('bc-dialog__body'), body),
          footer: Fragment(
            attr.class('bc-dialog__actions'),
            Button(
              {
                color: resolvedColor,
                variant: 'filled',
                size: 'sm',
                onClick: handleOk,
              },
              coalesce(okText, t.$.ok)
            )
          ),
        })
      }

      return fn(open, close)
    })
  )
}

// --- PromptDialog ---

/**
 * Configuration options for the {@link PromptDialog} component.
 */
export interface PromptDialogOptions {
  /**
   * Dialog title displayed in the header.
   */
  title: Value<string>
  /**
   * Optional descriptive text above the input field.
   */
  body?: TNode
  /**
   * Placeholder text for the input field.
   */
  placeholder?: Value<string>
  /**
   * Default value pre-filled in the input field.
   * @default ''
   */
  defaultValue?: string
  /**
   * Custom label for the confirm button. Falls back to i18n `confirm` string.
   */
  confirmText?: Value<string>
  /**
   * Custom label for the cancel button. Falls back to i18n `cancel` string.
   */
  cancelText?: Value<string>
  /**
   * Callback invoked with the input value when the user confirms.
   */
  onConfirm?: (value: string) => void
  /**
   * Callback invoked when the user cancels or dismisses the dialog.
   */
  onCancel?: () => void
  /**
   * Whether the dialog can be closed by clicking outside or pressing Escape.
   * @default true
   */
  dismissable?: Value<boolean>
}

/**
 * A prompt dialog for collecting text input from the user.
 *
 * Displays a title, optional description, a text input field, and confirm/cancel buttons.
 * Built on top of {@link Modal}.
 *
 * @param options - Configuration options for the prompt
 * @param fn - A render function that receives `open` and `close` callbacks and returns the trigger content.
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * PromptDialog(
 *   {
 *     title: 'Rename file',
 *     body: html.p('Enter a new name for this file.'),
 *     placeholder: 'File name',
 *     defaultValue: 'untitled.txt',
 *     confirmText: 'Rename',
 *     onConfirm: (name) => renameFile(name),
 *   },
 *   (open, close) => Button({ onClick: open }, 'Rename')
 * )
 * ```
 */
export function PromptDialog(
  options: PromptDialogOptions,
  fn: (open: () => void, close: () => void) => TNode
): Renderable {
  const {
    title,
    body,
    placeholder,
    defaultValue = '',
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    dismissable = true,
  } = options

  const modalOptions: ModalOptions = {
    size: 'sm',
    showCloseButton: false,
    dismissable,
    onClose: onCancel,
  }

  return Use(BeatUII18n, t =>
    Modal(modalOptions, (openModal, close) => {
      const inputValue = prop(defaultValue)

      const handleConfirm = () => {
        onConfirm?.(inputValue.value)
        close()
      }

      const handleCancel = () => {
        onCancel?.()
        close()
      }

      const open = () => {
        inputValue.set(defaultValue)
        openModal({
          header: html.span(attr.class('bc-dialog__title'), title),
          body: html.div(
            attr.class('bc-dialog__body'),
            body ?? Empty,
            html.input(
              attr.class('bc-dialog__input'),
              attr.type('text'),
              attr.value(inputValue),
              attr.placeholder(placeholder ?? ''),
              on.input(emitValue(v => inputValue.set(v))),
              on.keydown(e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleConfirm()
                }
              })
            )
          ),
          footer: Fragment(
            attr.class('bc-dialog__actions'),
            Button(
              { variant: 'light', size: 'sm', onClick: handleCancel },
              coalesce(cancelText, t.$.cancel)
            ),
            Button(
              {
                color: 'primary',
                variant: 'filled',
                size: 'sm',
                onClick: handleConfirm,
              },
              coalesce(confirmText, t.$.confirm)
            )
          ),
        })
      }

      return fn(open, close)
    })
  )
}

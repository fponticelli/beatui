import {
  attr,
  html,
  prop,
  Renderable,
  Use,
  When,
  Unless,
  Ensure,
  ForEach,
} from '@tempots/dom'
import { Button } from '../../components/button'
import { TextInput } from '../../components/form/input'
import { Stack } from '../../components/layout'
import { Notice } from '../../components/misc'
import { PasskeyClient, PasskeyInfo, BetterAuthResult } from '../types'
import { BetterAuthI18n } from '../i18n/translations'

export interface PasskeyManagementOptions {
  passkey: PasskeyClient
}

export function PasskeyManagement({
  passkey,
}: PasskeyManagementOptions): Renderable {
  const passkeys = prop<PasskeyInfo[]>([])
  const error = prop<string | null>(null)
  const loading = prop(false)
  const newPasskeyName = prop('')

  async function withLoading<T>(
    action: () => Promise<BetterAuthResult<T>>,
    onSuccess?: (data: T | null) => void | Promise<void>
  ) {
    loading.set(true)
    error.set(null)

    const result = await action()
    loading.set(false)

    if (result.error) {
      error.set(result.error.message)
      return
    }

    await onSuccess?.(result.data)
  }

  async function loadPasskeys() {
    await withLoading(
      () => passkey.listUserPasskeys(),
      data => passkeys.set(data ?? [])
    )
  }

  async function handleAdd() {
    const name = newPasskeyName.value || undefined
    await withLoading(
      () => passkey.addPasskey({ name }),
      async () => {
        newPasskeyName.set('')
        await loadPasskeys()
      }
    )
  }

  async function handleDelete(id: string) {
    await withLoading(
      () => passkey.deletePasskey({ id }),
      () => loadPasskeys()
    )
  }

  async function handleRename(id: string, name: string) {
    await withLoading(
      () => passkey.updatePasskey({ id, name }),
      () => loadPasskeys()
    )
  }

  // Load passkeys on mount
  loadPasskeys()

  return Use(BetterAuthI18n, t =>
    html.div(
      attr.class('bc-passkey-management'),

      Ensure(error, err =>
        Notice(
          { variant: 'danger', tone: 'prominent', role: 'alert' },
          html.div(err)
        )
      ),

      // Passkey list
      html.div(
        attr.class('bc-passkey-list'),
        ForEach(passkeys, item => {
          const editing = prop(false)
          const editName = prop(item.$.name?.value ?? '')

          return html.div(
            attr.class('bc-passkey-item'),
            Unless(editing, () =>
              html.div(
                attr.class('bc-passkey-item__info'),
                html.span(
                  attr.class('bc-passkey-item__name'),
                  item.$.name?.map(n => n ?? t.$.passkeyUnnamed.value) ??
                    t.$.passkeyUnnamed
                ),
                html.span(attr.class('bc-passkey-item__date'), item.$.createdAt)
              )
            ),
            When(editing, () =>
              html.div(
                attr.class('bc-passkey-item__edit'),
                TextInput({
                  value: editName,
                  onChange: v => editName.set(v),
                })
              )
            ),
            html.div(
              attr.class('bc-passkey-item__actions'),
              Unless(editing, () =>
                html.div(
                  Button(
                    {
                      type: 'button',
                      variant: 'text',
                      size: 'sm',
                      onClick: () => {
                        editName.set(item.$.name?.value ?? '')
                        editing.set(true)
                      },
                    },
                    t.$.passkeyRenameButton
                  ),
                  Button(
                    {
                      type: 'button',
                      variant: 'text',
                      size: 'sm',
                      color: 'danger',
                      onClick: () => handleDelete(item.$.id.value),
                    },
                    t.$.passkeyDeleteButton
                  )
                )
              ),
              When(editing, () =>
                html.div(
                  Button(
                    {
                      type: 'button',
                      variant: 'text',
                      size: 'sm',
                      onClick: async () => {
                        await handleRename(item.$.id.value, editName.value)
                        editing.set(false)
                      },
                    },
                    t.$.passkeySaveButton
                  ),
                  Button(
                    {
                      type: 'button',
                      variant: 'text',
                      size: 'sm',
                      onClick: () => editing.set(false),
                    },
                    t.$.passkeyCancelButton
                  )
                )
              )
            )
          )
        })
      ),

      // Add passkey
      html.div(
        attr.class('bc-passkey-add'),
        Stack(
          TextInput({
            value: newPasskeyName,
            onChange: v => newPasskeyName.set(v),
            placeholder: t.$.passkeyNamePlaceholder,
          }),
          Button(
            {
              type: 'button',
              variant: 'filled',
              color: 'primary',
              onClick: handleAdd,
              loading,
            },
            t.$.passkeyAddButton
          )
        )
      )
    )
  )
}

import { attr, prop, Renderable, Use } from '@tempots/dom'
import { Button } from '../../components/button'
import { BetterAuthClient } from '../types'
import { BetterAuthI18n } from '../i18n/translations'

export interface PasskeySignInOptions {
  client: BetterAuthClient
  autoFill?: boolean
  onSuccess?: () => void
  onError?: (error: { message: string; status: number }) => void
}

export function PasskeySignIn({
  client,
  autoFill,
  onSuccess,
  onError,
}: PasskeySignInOptions): Renderable {
  const loading = prop(false)

  async function handleClick() {
    if (!client.signIn.passkey) return

    loading.set(true)
    const result = await client.signIn.passkey({ autoFill })
    loading.set(false)

    if (result.error) {
      onError?.({ message: result.error.message, status: result.error.status })
      return
    }

    onSuccess?.()
  }

  return Use(BetterAuthI18n, t =>
    Button(
      {
        type: 'button',
        variant: 'outline',
        color: 'primary',
        onClick: handleClick,
        loading,
      },
      attr.class('bc-passkey-signin'),
      t.$.passkeySignInButton
    )
  )
}

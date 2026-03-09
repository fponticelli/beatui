import {
  attr,
  html,
  on,
  prop,
  Renderable,
  Use,
  When,
  Unless,
  Ensure,
} from '@tempots/dom'
import { Button } from '../../components/button'
import { EmailInput } from '../../components/form/input'
import { Stack } from '../../components/layout'
import { Notice } from '../../components/misc'
import { BetterAuthClient } from '../types'
import { BetterAuthI18n } from '../i18n/translations'

export interface MagicLinkFormOptions {
  client: BetterAuthClient
  callbackURL?: string
}

export function MagicLinkForm({
  client,
  callbackURL,
}: MagicLinkFormOptions): Renderable {
  const email = prop('')
  const error = prop<string | null>(null)
  const loading = prop(false)
  const sent = prop(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (!client.signIn.magicLink) {
      error.set('Magic link sign-in is not configured')
      return
    }

    loading.set(true)
    error.set(null)

    const result = await client.signIn.magicLink({
      email: email.value,
      callbackURL,
    })
    loading.set(false)

    if (result.error) {
      error.set(result.error.message)
      return
    }

    sent.set(true)
  }

  return Use(BetterAuthI18n, t =>
    html.div(
      attr.class('bc-auth-form'),

      Ensure(error, err =>
        Notice(
          { variant: 'danger', tone: 'prominent', role: 'alert' },
          html.div(err)
        )
      ),

      Unless(sent, () =>
        html.form(
          attr.class('bc-auth-form__form'),
          on.submit(handleSubmit),
          Stack(
            attr.class('bc-auth-form__fields'),
            html.p(
              attr.class('bc-auth-form__description'),
              t.$.magicLinkDescription
            ),
            EmailInput({
              value: email,
              onChange: v => email.set(v),
            }),
            Button(
              {
                type: 'submit',
                variant: 'filled',
                color: 'primary',
                loading,
              },
              attr.class('bc-auth-form__submit'),
              t.$.magicLinkSendButton
            )
          )
        )
      ),

      When(sent, () =>
        Notice(
          { variant: 'success', tone: 'prominent' },
          html.div(t.$.magicLinkSent)
        )
      )
    )
  )
}

import {
  attr,
  html,
  on,
  prop,
  computedOf,
  Renderable,
  Use,
  When,
  Ensure,
} from '@tempots/dom'
import { Button } from '../../components/button'
import { TextInput } from '../../components/form/input'
import { Stack } from '../../components/layout'
import { Notice } from '../../components/misc'
import { TwoFactorClient } from '../types'
import { BetterAuthI18n } from '../i18n/translations'

export type TwoFactorMethod = 'totp' | 'otp' | 'backup'

export interface TwoFactorVerifyOptions {
  twoFactor: TwoFactorClient
  methods?: TwoFactorMethod[]
  trustDevice?: boolean
  onVerified?: () => void
}

export function TwoFactorVerify({
  twoFactor,
  methods = ['totp', 'backup'],
  trustDevice,
  onVerified,
}: TwoFactorVerifyOptions): Renderable {
  const code = prop('')
  const error = prop<string | null>(null)
  const loading = prop(false)
  const currentMethod = prop<TwoFactorMethod>(methods[0] ?? 'totp')

  async function handleSubmit(e: Event) {
    e.preventDefault()
    loading.set(true)
    error.set(null)

    const method = currentMethod.value
    let result

    if (method === 'totp') {
      result = await twoFactor.verifyTotp({
        code: code.value,
        trustDevice,
      })
    } else if (method === 'otp' && twoFactor.verifyOtp) {
      result = await twoFactor.verifyOtp({
        code: code.value,
        trustDevice,
      })
    } else if (method === 'backup') {
      result = await twoFactor.verifyBackupCode({ code: code.value })
    } else {
      error.set('Unsupported verification method')
      loading.set(false)
      return
    }

    loading.set(false)

    if (result.error) {
      error.set(result.error.message)
      return
    }

    onVerified?.()
  }

  async function handleSendOtp() {
    if (!twoFactor.sendOtp) return
    loading.set(true)
    error.set(null)

    const result = await twoFactor.sendOtp({ trustDevice })
    loading.set(false)

    if (result.error) {
      error.set(result.error.message)
    }
  }

  return Use(BetterAuthI18n, t => {
    // Derive description and placeholder reactively from both currentMethod and i18n
    const description = computedOf(
      currentMethod,
      t
    )((method, messages) => {
      if (method === 'totp') return messages.twoFactorTotpDescription
      if (method === 'otp') return messages.twoFactorOtpDescription
      return messages.twoFactorBackupDescription
    })

    const placeholder = computedOf(
      currentMethod,
      t
    )((method, messages) => {
      if (method === 'backup') return messages.twoFactorBackupCodePlaceholder
      return messages.twoFactorCodePlaceholder
    })

    return html.div(
      attr.class('bc-two-factor'),

      Ensure(error, err =>
        Notice(
          { variant: 'danger', tone: 'prominent', role: 'alert' },
          html.div(err)
        )
      ),

      // Method selector (only if more than one method)
      When(methods.length > 1, () =>
        html.div(
          attr.class('bc-two-factor__methods'),
          ...methods.map(method =>
            html.button(
              attr.type('button'),
              attr.class('bc-two-factor__method-button'),
              attr.class(
                currentMethod.map(m =>
                  m === method ? 'bc-two-factor__method-button--active' : ''
                )
              ),
              on.click(() => {
                currentMethod.set(method)
                code.set('')
                error.set(null)
              }),
              t.$.twoFactorMethodLabel.map(fn => fn(method))
            )
          )
        )
      ),

      html.form(
        attr.class('bc-two-factor__form'),
        on.submit(handleSubmit),
        Stack(
          html.p(attr.class('bc-auth-form__description'), description),

          // Send OTP button (only for OTP method)
          When(
            currentMethod.map(m => m === 'otp' && twoFactor.sendOtp != null),
            () =>
              Button(
                {
                  type: 'button',
                  variant: 'outline',
                  color: 'primary',
                  onClick: handleSendOtp,
                  loading,
                },
                t.$.twoFactorSendOtpButton
              )
          ),

          TextInput({
            value: code,
            onChange: v => code.set(v),
            placeholder,
          }),

          Button(
            {
              type: 'submit',
              variant: 'filled',
              color: 'primary',
              loading,
            },
            attr.class('bc-auth-form__submit'),
            t.$.twoFactorVerifyButton
          )
        )
      )
    )
  })
}

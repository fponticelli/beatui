import {
  attr,
  html,
  on,
  prop,
  Renderable,
  Use,
  Ensure,
  NotEmpty,
  Fragment,
  ForEach,
  OneOfValue,
} from '@tempots/dom'
import { Button } from '../../components/button'
import { PasswordInput, TextInput } from '../../components/form/input'
import { Stack } from '../../components/layout'
import { Notice } from '../../components/misc'
import { TwoFactorClient } from '../types'
import { BetterAuthI18n } from '../i18n/translations'

export interface TwoFactorSetupOptions {
  twoFactor: TwoFactorClient
  issuer?: string
  onComplete?: () => void
}

export function TwoFactorSetup({
  twoFactor,
  issuer,
  onComplete,
}: TwoFactorSetupOptions): Renderable {
  const password = prop('')
  const totpURI = prop<string | null>(null)
  const backupCodes = prop<string[]>([])
  const verifyCode = prop('')
  const error = prop<string | null>(null)
  const loading = prop(false)
  const step = prop<'password' | 'verify' | 'complete'>('password')

  async function handleEnable(e: Event) {
    e.preventDefault()
    loading.set(true)
    error.set(null)

    const result = await twoFactor.enable({
      password: password.value,
      issuer,
    })
    loading.set(false)

    if (result.error) {
      error.set(result.error.message)
      return
    }

    if (result.data) {
      totpURI.set(result.data.totpURI)
      backupCodes.set(result.data.backupCodes)
      step.set('verify')
    }
  }

  async function handleVerify(e: Event) {
    e.preventDefault()
    loading.set(true)
    error.set(null)

    const result = await twoFactor.verifyTotp({ code: verifyCode.value })
    loading.set(false)

    if (result.error) {
      error.set(result.error.message)
      return
    }

    step.set('complete')
    onComplete?.()
  }

  return Use(BetterAuthI18n, t =>
    html.div(
      attr.class('bc-two-factor'),

      Ensure(error, err =>
        Notice(
          { variant: 'danger', tone: 'prominent', role: 'alert' },
          html.div(err)
        )
      ),

      OneOfValue(step, {
        password: () =>
          html.form(
            attr.class('bc-two-factor__form'),
            on.submit(handleEnable),
            Stack(
              html.p(
                attr.class('bc-auth-form__description'),
                t.$.twoFactorSetupDescription
              ),
              PasswordInput({
                value: password,
                onChange: v => password.set(v),
                placeholder: t.$.passwordPlaceholder,
              }),
              Button(
                {
                  type: 'submit',
                  variant: 'filled',
                  color: 'primary',
                  loading,
                },
                attr.class('bc-auth-form__submit'),
                t.$.twoFactorEnableButton
              )
            )
          ),

        verify: () =>
          Fragment(
            Ensure(totpURI, uri =>
              html.div(
                attr.class('bc-two-factor__totp-uri'),
                html.p(t.$.twoFactorScanDescription),
                html.code(attr.class('bc-two-factor__code-display'), uri)
              )
            ),

            NotEmpty(backupCodes, () =>
              html.div(
                attr.class('bc-two-factor__backup-codes'),
                html.p(t.$.twoFactorBackupCodesDescription),
                html.ul(
                  ForEach(backupCodes, code =>
                    html.li(code)
                  )
                )
              )
            ),

            html.form(
              attr.class('bc-two-factor__form'),
              on.submit(handleVerify),
              Stack(
                TextInput({
                  value: verifyCode,
                  onChange: v => verifyCode.set(v),
                  placeholder: t.$.twoFactorCodePlaceholder,
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
          ),

        complete: () =>
          html.div(
            attr.class('bc-two-factor__complete'),
            Notice(
              { variant: 'success', tone: 'prominent' },
              html.div(t.$.twoFactorEnabled)
            )
          ),
      })
    )
  )
}

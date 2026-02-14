import { SegmentedInput } from '@tempots/beatui'
import { Prop } from '@tempots/dom'

const OPTIONS = {
  google: 'Google',
  github: 'GitHub',
  apple: 'Apple',
  facebook: 'Facebook',
  twitter: 'Twitter',
  microsoft: 'Microsoft',
} as const

export type AuthProviderKey = keyof typeof OPTIONS

export function AuthProviderSelector({
  provider,
  onChange,
}: {
  provider: Prop<AuthProviderKey>
  onChange?: (value: AuthProviderKey) => void
}) {
  return SegmentedInput({
    options: OPTIONS,
    value: provider,
    onChange,
  })
}

import { SegmentedInput, AuthProvider } from '@tempots/beatui'
import { Prop } from '@tempots/dom'

export function AuthProviderSelector({
  provider,
  onChange,
}: {
  provider: Prop<AuthProvider>
  onChange?: (value: AuthProvider) => void
}) {
  return SegmentedInput({
    size: 'sm',
    options: {
      google: 'Google',
      github: 'GitHub',
      apple: 'Apple',
      facebook: 'Facebook',
      twitter: 'Twitter',
      microsoft: 'Microsoft',
    },
    value: provider,
    onChange,
  })
}

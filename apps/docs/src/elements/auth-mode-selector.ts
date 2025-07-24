import { SegmentedControl, AuthMode } from '@tempots/beatui'
import { Prop } from '@tempots/dom'

export function AuthModeSelector({
  mode,
  onChange,
}: {
  mode: Prop<AuthMode>
  onChange?: (value: AuthMode) => void
}) {
  return SegmentedControl({
    size: 'sm',
    options: {
      signin: 'Sign In',
      signup: 'Sign Up',
      'reset-password': 'Reset Password',
    },
    value: mode,
    onChange,
  })
}

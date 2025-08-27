import { SegmentedInput } from '@tempots/beatui'
import { AuthMode } from '@tempots/beatui/auth'
import { Prop } from '@tempots/dom'

export function AuthModeSelector({
  mode,
  onChange,
}: {
  mode: Prop<AuthMode>
  onChange?: (value: AuthMode) => void
}) {
  return SegmentedInput({
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

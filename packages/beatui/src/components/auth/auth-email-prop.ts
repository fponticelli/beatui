/**
 * Auth Email Persistence
 *
 * Provides a reactive property backed by `localStorage` that persists the
 * user's email address across sessions. Used by the "remember me" checkbox
 * in sign-in and reset password forms.
 *
 * @module auth/auth-email-prop
 */

import { localStorageProp } from '@tempots/dom'

/**
 * Creates a reactive `localStorage`-backed property for persisting the user's email.
 *
 * When the "remember me" checkbox is checked, the email is stored under the key
 * `'bui_auth_email'`. When unchecked, the value is set to `null`, removing it
 * from storage.
 *
 * @returns A reactive `Prop<string | null>` backed by `localStorage`.
 *
 * @example
 * ```ts
 * const emailProp = useAuthEmailProp()
 * emailProp.value = 'user@example.com' // persists to localStorage
 * emailProp.value = null               // removes from localStorage
 * ```
 */
export const useAuthEmailProp = () =>
  localStorageProp<string | null>({
    key: 'bui_auth_email',
    defaultValue: null,
  })

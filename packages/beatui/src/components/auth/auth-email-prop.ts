/**
 * Auth Email Persistence
 *
 * Provides a reactive property backed by `localStorage` that persists the
 * user's email address across sessions. Used by the "remember me" checkbox
 * in sign-in and reset password forms.
 *
 * SSR-safe: returns a plain in-memory prop when `window` is not available.
 *
 * @module auth/auth-email-prop
 */

import { localStorageProp, prop } from '@tempots/dom'
import { isBrowser } from './utils'

/**
 * Creates a reactive property for persisting the user's email.
 *
 * In browser environments, backed by `localStorage` (key `'bui_auth_email'`).
 * In SSR environments, returns a plain in-memory `Prop<string | null>`.
 *
 * @returns A reactive `Prop<string | null>`.
 */
export const useAuthEmailProp = () =>
  isBrowser()
    ? localStorageProp<string | null>({
        key: 'bui_auth_email',
        defaultValue: null,
      })
    : prop<string | null>(null)

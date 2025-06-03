export type FormFilling = { type: 'filling' }
export type FormSubmitting = { type: 'submitting' }
export type FormError = { type: 'error'; error: string }
export type FormSuccess = { type: 'success' }

export type FormStatus = FormFilling | FormSubmitting | FormError | FormSuccess

export const FormStatus = {
  filling: { type: 'filling' } as FormStatus,
  submitting: { type: 'submitting' } as FormStatus,
  error: (error: string) => ({ type: 'error', error }) as FormStatus,
  success: { type: 'success' } as FormStatus,
}

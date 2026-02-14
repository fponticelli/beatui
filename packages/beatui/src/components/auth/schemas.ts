/**
 * Authentication Validation Schemas
 *
 * Custom validation schemas for validating authentication form data.
 * Provides schema factories for sign-in, sign-up, and reset password forms,
 * as well as utility functions for email and password validation and
 * password strength calculation.
 *
 * @module auth/schemas
 */

import {
  string,
  boolean,
  object,
  StringValidator,
  SafeParseResult,
} from '../form/schema/custom-validation'
import { StandardSchemaV1 } from '../form/schema/standard-schema-v1'
import {
  PasswordRules,
  ResetPasswordData,
  SignInFormData,
  SignUpFormData,
} from './types'
import { defaultPasswordRules } from './utils'
import { defaultMessages as defaultAuthMessages } from '../../auth-i18n'

/**
 * Localizable validation messages for authentication schemas.
 *
 * Pass this to schema factory functions to override the default English messages.
 * Obtain localized values from `AuthI18n` provider messages.
 */
export interface AuthValidationMessages {
  passwordMinLength?: (min: number) => string
  passwordRequireUppercase?: string
  passwordRequireLowercase?: string
  passwordRequireNumber?: string
  passwordRequireSpecialChar?: string
  emailRequired?: string
  invalidEmail?: string
  passwordRequired?: string
  nameRequired?: string
  confirmPasswordRequired?: string
  acceptTermsRequired?: string
  passwordsDoNotMatch?: string
  invalidPassword?: string
  invalidEmailAddress?: string
}

/**
 * Creates a password validation schema based on the provided rules.
 *
 * Builds a `StringValidator` that enforces minimum length, character class
 * requirements, and optional custom validation logic.
 *
 * @param rules - The password validation rules to enforce. Defaults to {@link defaultPasswordRules}.
 * @returns A `StringValidator` that validates passwords against the given rules.
 *
 * @example
 * ```ts
 * const schema = createPasswordSchema({ minLength: 10, requireNumbers: true })
 * const result = schema.validate('hello123')
 * ```
 */
export function createPasswordSchema(
  rules: PasswordRules = defaultPasswordRules,
  messages?: AuthValidationMessages
): StringValidator {
  const m = messages ?? defaultAuthMessages
  let validator = string()

  // Minimum length validation
  if (rules.minLength) {
    validator = validator.min(
      rules.minLength,
      (m.passwordMinLength ?? defaultAuthMessages.passwordMinLength)(
        rules.minLength
      )
    )
  }

  // Uppercase letter validation
  if (rules.requireUppercase) {
    validator = validator.regex(
      /[A-Z]/,
      m.passwordRequireUppercase ?? defaultAuthMessages.passwordRequireUppercase
    )
  }

  // Lowercase letter validation
  if (rules.requireLowercase) {
    validator = validator.regex(
      /[a-z]/,
      m.passwordRequireLowercase ?? defaultAuthMessages.passwordRequireLowercase
    )
  }

  // Number validation
  if (rules.requireNumbers) {
    validator = validator.regex(
      /[0-9]/,
      m.passwordRequireNumber ?? defaultAuthMessages.passwordRequireNumber
    )
  }

  // Symbol validation
  if (rules.requireSymbols) {
    validator = validator.regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      m.passwordRequireSpecialChar ??
        defaultAuthMessages.passwordRequireSpecialChar
    )
  }

  // Custom validation
  if (rules.customValidation) {
    validator = validator.refine(password => rules.customValidation!(password))
  }

  return validator
}

/**
 * Creates an email validation schema with optional localized messages.
 *
 * @param messages - Optional localized validation messages
 * @returns A `StringValidator` that validates email addresses
 */
export function createEmailSchema(
  messages?: AuthValidationMessages
): StringValidator {
  const m = messages ?? defaultAuthMessages
  return string()
    .min(1, m.emailRequired ?? defaultAuthMessages.emailRequired)
    .email(m.invalidEmail ?? defaultAuthMessages.invalidEmail)
}

/**
 * Base email validation schema.
 *
 * Validates that the value is a non-empty string with a valid email format.
 */
export const emailSchema = createEmailSchema()

/**
 * Creates a validation schema for the sign-in form.
 *
 * Validates email (required, valid format) and password fields.
 * When `passwordRules` is provided, the password field is validated
 * against those rules; otherwise, only a non-empty check is applied.
 *
 * @param passwordRules - Optional password validation rules. If omitted, only a "required" check is used.
 * @returns A `StandardSchemaV1<SignInFormData>` with a `safeParse` method.
 *
 * @example
 * ```ts
 * const schema = createSignInSchema({ minLength: 8, requireNumbers: true })
 * const result = schema.safeParse({ email: 'user@test.com', password: 'pass1234' })
 * ```
 */
export function createSignInSchema(
  passwordRules?: PasswordRules,
  messages?: AuthValidationMessages
): StandardSchemaV1<SignInFormData> & {
  safeParse: (value: unknown) => SafeParseResult<SignInFormData>
} {
  const m = messages ?? defaultAuthMessages
  const passwordSchema = passwordRules
    ? createPasswordSchema(passwordRules, messages)
    : string().refine(value =>
        value.length > 0
          ? null
          : (m.passwordRequired ?? defaultAuthMessages.passwordRequired)
      )

  return object({
    email: createEmailSchema(messages),
    password: passwordSchema,
    rememberMe: boolean().default(false),
  }).schema()
}

/**
 * Creates a validation schema for the sign-up form.
 *
 * Validates name (optional), email, password, confirm password, and
 * terms acceptance fields. Password confirmation matching is enforced
 * when `showConfirmPassword` is enabled.
 *
 * @param passwordRules - Password validation rules. Defaults to {@link defaultPasswordRules}.
 * @param options - Optional flags controlling which fields are shown and required.
 * @param options.showNameField - Whether the name field is shown. @default true
 * @param options.showConfirmPassword - Whether the confirm password field is shown. @default true
 * @param options.showAcceptTermsAndConditions - Whether the terms checkbox is shown. @default true
 * @returns A `StandardSchemaV1<SignUpFormData>` with a `safeParse` method.
 *
 * @example
 * ```ts
 * const schema = createSignUpSchema(undefined, { showNameField: false })
 * const result = schema.safeParse({
 *   email: 'user@test.com',
 *   password: 'Pass1234',
 *   confirmPassword: 'Pass1234',
 *   acceptTerms: true,
 * })
 * ```
 */
export function createSignUpSchema(
  passwordRules: PasswordRules = defaultPasswordRules,
  options?: {
    showNameField?: boolean
    showConfirmPassword?: boolean
    showAcceptTermsAndConditions?: boolean
  },
  messages?: AuthValidationMessages
): StandardSchemaV1<SignUpFormData> & {
  safeParse: (value: unknown) => SafeParseResult<SignUpFormData>
} {
  const m = messages ?? defaultAuthMessages
  const passwordSchema = createPasswordSchema(passwordRules, messages)
  const showNameField = options?.showNameField !== false
  const showConfirmPassword = options?.showConfirmPassword !== false
  const showAcceptTermsAndConditions =
    options?.showAcceptTermsAndConditions !== false

  // Create base schema with proper types
  const baseSchema = {
    name: showNameField
      ? string()
          .min(1, m.nameRequired ?? defaultAuthMessages.nameRequired)
          .optional()
      : string().optional(),
    email: createEmailSchema(messages),
    password: passwordSchema,
    // Always require confirmPassword as string to match SignUpData interface
    // When not shown, it should accept any value (including empty string)
    confirmPassword: showConfirmPassword
      ? string().min(
          1,
          m.confirmPasswordRequired ??
            defaultAuthMessages.confirmPasswordRequired
        )
      : string(), // Accept any string value when not shown
    acceptTerms: showAcceptTermsAndConditions
      ? boolean().refine(
          (val: boolean) => val === true,
          m.acceptTermsRequired ?? defaultAuthMessages.acceptTermsRequired
        )
      : boolean().default(true), // Default to true when not shown
  }

  const schema = object(baseSchema)

  // Only add password confirmation validation if confirm password is shown
  if (showConfirmPassword) {
    return schema
      .refine(
        data =>
          data.password === data.confirmPassword
            ? null
            : (m.passwordsDoNotMatch ??
              defaultAuthMessages.passwordsDoNotMatch),
        { path: ['confirmPassword'] }
      )
      .schema()
  }

  return schema.schema()
}

/**
 * Validation schema for the reset password form.
 *
 * Validates that the email field is present and in a valid format.
 */
export const resetPasswordSchema: StandardSchemaV1<ResetPasswordData> & {
  safeParse: (value: unknown) => SafeParseResult<ResetPasswordData>
} = object({
  email: emailSchema,
}).schema()

/**
 * Pre-built sign-in schema using default password rules.
 *
 * Convenience constant equivalent to `createSignInSchema()`.
 */
export const defaultSignInSchema = createSignInSchema()

/**
 * Pre-built sign-up schema using default password rules.
 *
 * Convenience constant equivalent to `createSignUpSchema()`.
 */
export const defaultSignUpSchema = createSignUpSchema()

/**
 * Alias for {@link ResetPasswordData}, used as the form data type for the reset password form.
 */
export type ResetPasswordFormData = ResetPasswordData

/**
 * Collection of schema factory functions for dynamic configuration.
 *
 * Provides convenient access to all auth schema creators.
 *
 * @example
 * ```ts
 * const signInSchema = authSchemas.signIn({ minLength: 12 })
 * const resetSchema = authSchemas.resetPassword()
 * ```
 */
export const authSchemas = {
  signIn: createSignInSchema,
  signUp: createSignUpSchema,
  resetPassword: () => resetPasswordSchema,
}

/**
 * Validates an email address against the email schema.
 *
 * @param email - The email address to validate.
 * @returns An error message string if invalid, or `null` if valid.
 *
 * @example
 * ```ts
 * validateEmail('user@test.com') // null
 * validateEmail('invalid')       // 'Please enter a valid email address'
 * ```
 */
export function validateEmail(
  email: string,
  messages?: AuthValidationMessages
): string | null {
  const m = messages ?? defaultAuthMessages
  const schema = messages ? createEmailSchema(messages) : emailSchema
  const result = schema.validate(email)
  if (result.success) {
    return null
  } else {
    return (
      result.errors[0]?.message ||
      (m.invalidEmailAddress ?? defaultAuthMessages.invalidEmailAddress)
    )
  }
}

/**
 * Validates a password against the provided rules.
 *
 * @param password - The password to validate.
 * @param rules - The password validation rules to check against. Defaults to {@link defaultPasswordRules}.
 * @returns An error message string if invalid, or `null` if valid.
 *
 * @example
 * ```ts
 * validatePassword('weak', { minLength: 8 }) // 'Password must be at least 8 characters'
 * validatePassword('StrongPass1', { minLength: 8, requireUppercase: true, requireNumbers: true }) // null
 * ```
 */
export function validatePassword(
  password: string,
  rules: PasswordRules = defaultPasswordRules,
  messages?: AuthValidationMessages
): string | null {
  const m = messages ?? defaultAuthMessages
  const schema = createPasswordSchema(rules, messages)
  const result = schema.validate(password)
  if (result.success) {
    return null
  } else {
    return (
      result.errors[0]?.message ||
      (m.invalidPassword ?? defaultAuthMessages.invalidPassword)
    )
  }
}

/**
 * Calculates the strength of a password based on the provided rules.
 *
 * Evaluates each enabled rule and produces a strength level, a numerical
 * score (0-100), and a detailed breakdown of which checks passed.
 *
 * @param password - The password to evaluate.
 * @param rules - The password rules to evaluate against. Defaults to {@link defaultPasswordRules}.
 * @returns An object containing:
 *   - `strength` - The qualitative strength level: `'weak'`, `'fair'`, `'good'`, or `'strong'`.
 *   - `score` - A numerical score from 0 to 100.
 *   - `checks` - An object indicating which individual checks passed.
 *
 * @example
 * ```ts
 * const result = calculatePasswordStrength('Hello123', {
 *   minLength: 8,
 *   requireUppercase: true,
 *   requireNumbers: true,
 * })
 * // result.strength === 'good'
 * // result.score === 67
 * ```
 */
export function calculatePasswordStrength(
  password: string,
  rules: PasswordRules = defaultPasswordRules
): {
  strength: 'weak' | 'fair' | 'good' | 'strong'
  score: number
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
    custom: boolean
  }
} {
  const checks = {
    length: password.length >= (rules.minLength || 8),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    custom: rules.customValidation
      ? rules.customValidation(password) === null
      : password.length > 0, // For consistency, fail if password is empty
  }

  // Only count enabled checks for scoring
  const enabledChecks = [
    true, // length is always enabled
    rules.requireUppercase,
    rules.requireLowercase,
    rules.requireNumbers,
    rules.requireSymbols,
    !!rules.customValidation,
  ].filter(Boolean).length

  const passedChecks = [
    checks.length,
    rules.requireUppercase ? checks.uppercase : null,
    rules.requireLowercase ? checks.lowercase : null,
    rules.requireNumbers ? checks.numbers : null,
    rules.requireSymbols ? checks.symbols : null,
    rules.customValidation ? checks.custom : null,
  ].filter(check => check === true).length

  const score =
    enabledChecks > 0 ? Math.round((passedChecks / enabledChecks) * 100) : 0

  let strength: 'weak' | 'fair' | 'good' | 'strong'
  if (score < 40) {
    strength = 'weak'
  } else if (score < 60) {
    strength = 'fair'
  } else if (score < 80) {
    strength = 'good'
  } else {
    strength = 'strong'
  }

  return { strength, score, checks }
}

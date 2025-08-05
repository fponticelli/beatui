// Authentication Validation Schemas
// Custom validation schemas for validating authentication form data

import {
  string,
  boolean,
  object,
  StringValidator,
} from '../form/schema/custom-validation'
import { StandardSchemaV1 } from '../form/schema/standard-schema-v1'
import {
  PasswordRules,
  SignInData,
  SignUpData,
  ResetPasswordData,
} from './types'
import { defaultPasswordRules } from './utils'

// Helper function to create password validation based on rules
export function createPasswordSchema(
  rules: PasswordRules = defaultPasswordRules
): StringValidator {
  let validator = string()

  // Minimum length validation
  if (rules.minLength) {
    validator = validator.min(
      rules.minLength,
      `Password must be at least ${rules.minLength} characters`
    )
  }

  // Uppercase letter validation
  if (rules.requireUppercase) {
    validator = validator.regex(
      /[A-Z]/,
      'Password must contain at least one uppercase letter'
    )
  }

  // Lowercase letter validation
  if (rules.requireLowercase) {
    validator = validator.regex(
      /[a-z]/,
      'Password must contain at least one lowercase letter'
    )
  }

  // Number validation
  if (rules.requireNumbers) {
    validator = validator.regex(
      /[0-9]/,
      'Password must contain at least one number'
    )
  }

  // Symbol validation
  if (rules.requireSymbols) {
    validator = validator.regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Password must contain at least one special character'
    )
  }

  // Custom validation
  if (rules.customValidation) {
    validator = validator.refine(password => rules.customValidation!(password))
  }

  return validator
}

// Base email schema
export const emailSchema = string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Sign in form schema
export function createSignInSchema(
  passwordRules?: PasswordRules
): StandardSchemaV1<SignInData> {
  const passwordSchema = passwordRules
    ? createPasswordSchema(passwordRules)
    : string().refine(value =>
        value.length > 0 ? null : 'Password is required'
      )

  return object({
    email: emailSchema,
    password: passwordSchema,
    rememberMe: boolean().optional().default(false),
  }).schema()
}

// Sign up form schema
export function createSignUpSchema(
  passwordRules: PasswordRules = defaultPasswordRules,
  options?: {
    showNameField?: boolean
    showConfirmPassword?: boolean
    showAcceptTermsAndConditions?: boolean
  }
): StandardSchemaV1<SignUpData> {
  const passwordSchema = createPasswordSchema(passwordRules)
  const showNameField = options?.showNameField !== false
  const showConfirmPassword = options?.showConfirmPassword !== false
  const showAcceptTermsAndConditions =
    options?.showAcceptTermsAndConditions !== false

  const baseSchema = {
    name: showNameField
      ? string().min(1, 'Name is required').optional()
      : string().optional(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: showConfirmPassword
      ? string().min(1, 'Please confirm your password')
      : string().optional(),
    acceptTerms: showAcceptTermsAndConditions
      ? boolean().refine(
          (val: boolean) => val === true,
          'You must accept the terms and conditions'
        )
      : boolean().optional(),
  }

  const schema = object(baseSchema)

  // Only add password confirmation validation if confirm password is shown
  if (showConfirmPassword) {
    return schema
      .refine(
        (data: SignUpData) =>
          data.password === data.confirmPassword
            ? null
            : "Passwords don't match",
        { path: ['confirmPassword'] }
      )
      .schema()
  }

  return schema.schema()
}

// Reset password form schema
export const resetPasswordSchema: StandardSchemaV1<ResetPasswordData> = object({
  email: emailSchema,
}).schema()

// Default schemas with standard password rules
export const defaultSignInSchema = createSignInSchema()
export const defaultSignUpSchema = createSignUpSchema()

// Type inference helpers
export type SignInFormData = SignInData
export type SignUpFormData = SignUpData
export type ResetPasswordFormData = ResetPasswordData

// Schema factory functions for dynamic configuration
export const authSchemas = {
  signIn: createSignInSchema,
  signUp: createSignUpSchema,
  resetPassword: () => resetPasswordSchema,
}

// Validation utilities
export function validateEmail(email: string): string | null {
  const result = emailSchema.validate(email)
  if (result.success) {
    return null
  } else {
    return result.errors[0]?.message || 'Invalid email'
  }
}

export function validatePassword(
  password: string,
  rules: PasswordRules = defaultPasswordRules
): string | null {
  const schema = createPasswordSchema(rules)
  const result = schema.validate(password)
  if (result.success) {
    return null
  } else {
    return result.errors[0]?.message || 'Invalid password'
  }
}

// Password strength calculation
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
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
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

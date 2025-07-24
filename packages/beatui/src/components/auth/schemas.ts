// Authentication Validation Schemas
// Zod schemas for validating authentication form data

import { z } from 'zod'
import { PasswordRules, defaultPasswordRules } from './types'

// Helper function to create password validation based on rules
export function createPasswordSchema(
  rules: PasswordRules = defaultPasswordRules
) {
  let schema = z.string()

  // Minimum length validation
  if (rules.minLength) {
    schema = schema.min(
      rules.minLength,
      `Password must be at least ${rules.minLength} characters`
    )
  }

  // Uppercase letter validation
  if (rules.requireUppercase) {
    schema = schema.regex(
      /[A-Z]/,
      'Password must contain at least one uppercase letter'
    )
  }

  // Lowercase letter validation
  if (rules.requireLowercase) {
    schema = schema.regex(
      /[a-z]/,
      'Password must contain at least one lowercase letter'
    )
  }

  // Number validation
  if (rules.requireNumbers) {
    schema = schema.regex(/[0-9]/, 'Password must contain at least one number')
  }

  // Symbol validation
  if (rules.requireSymbols) {
    schema = schema.regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Password must contain at least one special character'
    )
  }

  // Custom validation
  if (rules.customValidation) {
    schema = schema.refine(password => {
      const error = rules.customValidation!(password)
      return error === null
    })
  }

  return schema
}

// Base email schema
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

// Sign in form schema
export function createSignInSchema(passwordRules?: PasswordRules) {
  return z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
  })
}

// Sign up form schema
export function createSignUpSchema(
  passwordRules: PasswordRules = defaultPasswordRules
) {
  const passwordSchema = createPasswordSchema(passwordRules)

  return z
    .object({
      name: z.string().min(1, 'Name is required').optional(),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, 'Please confirm your password'),
      acceptTerms: z
        .boolean()
        .refine(
          val => val === true,
          'You must accept the terms and conditions'
        ),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    })
}

// Reset password form schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// Default schemas with standard password rules
export const defaultSignInSchema = createSignInSchema()
export const defaultSignUpSchema = createSignUpSchema()

// Type inference helpers
export type SignInFormData = z.infer<typeof defaultSignInSchema>
export type SignUpFormData = z.infer<typeof defaultSignUpSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Schema factory functions for dynamic configuration
export const authSchemas = {
  signIn: createSignInSchema,
  signUp: createSignUpSchema,
  resetPassword: () => resetPasswordSchema,
}

// Validation utilities
export function validateEmail(email: string): string | null {
  try {
    emailSchema.parse(email)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid email'
    }
    return 'Invalid email'
  }
}

export function validatePassword(
  password: string,
  rules: PasswordRules = defaultPasswordRules
): string | null {
  try {
    const schema = createPasswordSchema(rules)
    schema.parse(password)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid password'
    }
    return 'Invalid password'
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
    uppercase: rules.requireUppercase ? /[A-Z]/.test(password) : true,
    lowercase: rules.requireLowercase ? /[a-z]/.test(password) : true,
    numbers: rules.requireNumbers ? /[0-9]/.test(password) : true,
    symbols: rules.requireSymbols
      ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      : true,
    custom: rules.customValidation
      ? rules.customValidation(password) === null
      : true,
  }

  const passedChecks = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.values(checks).length
  const score = Math.round((passedChecks / totalChecks) * 100)

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

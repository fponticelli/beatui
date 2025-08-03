// Custom Validation Library
// A lightweight validation library that complies with standard-schema-v1

import { StandardSchemaV1 } from './standard-schema-v1'

// Base validation result types
export type ValidationError = {
  message: string
  path?: (PropertyKey | StandardSchemaV1.PathSegment)[]
}

export type ValidatorResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] }

// Base validator interface
export interface Validator<Input, Output = Input> {
  validate(value: unknown): ValidatorResult<Output>
  optional(): Validator<Input | undefined, Output | undefined>
  default(defaultValue: Output): Validator<Input | undefined, Output>
}

// Zod-like result types for compatibility
export type SafeParseSuccess<T> = {
  success: true
  data: T
}

export type SafeParseError = {
  success: false
  error: {
    errors: Array<{
      message: string
      path: (string | number)[]
    }>
  }
}

export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError

// Create a standard schema from a validator
function createStandardSchema<Input, Output = Input>(
  validator: Validator<Input, Output>
): StandardSchemaV1<Input, Output> & {
  safeParse: (value: unknown) => SafeParseResult<Output>
} {
  const schema = {
    '~standard': {
      version: 1,
      vendor: 'beatui-custom',
      validate: (value: unknown): StandardSchemaV1.Result<Output> => {
        const result = validator.validate(value)
        if (result.success) {
          return { value: result.data }
        } else {
          return {
            issues: result.errors.map(error => ({
              message: error.message,
              path: error.path,
            })),
          }
        }
      },
      types: undefined as StandardSchemaV1.Types<Input, Output> | undefined,
    },
    safeParse: (value: unknown): SafeParseResult<Output> => {
      const result = validator.validate(value)
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        return {
          success: false,
          error: {
            errors: result.errors.map(error => ({
              message: error.message,
              path:
                error.path?.map(p =>
                  typeof p === 'object' && 'key' in p
                    ? p.key.toString()
                    : p.toString()
                ) || [],
            })),
          },
        }
      }
    },
  }

  return schema as StandardSchemaV1<Input, Output> & {
    safeParse: (value: unknown) => SafeParseResult<Output>
  }
}

// Base validator class
abstract class BaseValidator<Input, Output = Input>
  implements Validator<Input, Output>
{
  abstract validate(value: unknown): ValidatorResult<Output>

  optional(): Validator<Input | undefined, Output | undefined> {
    return new OptionalValidator(this)
  }

  default(defaultValue: Output): Validator<Input | undefined, Output> {
    return new DefaultValidator(this, defaultValue)
  }

  schema(): StandardSchemaV1<Input, Output> & {
    safeParse: (value: unknown) => SafeParseResult<Output>
  } {
    return createStandardSchema(this)
  }
}

// String validator
export class StringValidator extends BaseValidator<string> {
  private minLength?: number
  private maxLength?: number
  private pattern?: RegExp
  private customValidations: ((value: string) => string | null)[] = []

  validate(value: unknown): ValidatorResult<string> {
    if (typeof value !== 'string') {
      return { success: false, errors: [{ message: 'Expected string' }] }
    }

    const errors: ValidationError[] = []

    if (this.minLength !== undefined && value.length < this.minLength) {
      errors.push({ message: `Must be at least ${this.minLength} characters` })
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      errors.push({ message: `Must be at most ${this.maxLength} characters` })
    }

    if (this.pattern && !this.pattern.test(value)) {
      errors.push({ message: 'Invalid format' })
    }

    for (const customValidation of this.customValidations) {
      const error = customValidation(value)
      if (error) {
        errors.push({ message: error })
      }
    }

    if (errors.length > 0) {
      return { success: false, errors }
    }

    return { success: true, data: value }
  }

  min(length: number, message?: string): StringValidator {
    const validator = new StringValidator()
    validator.minLength = length
    validator.maxLength = this.maxLength
    validator.pattern = this.pattern
    validator.customValidations = [...this.customValidations]
    if (message) {
      validator.customValidations.push(value =>
        value.length < length ? message : null
      )
    }
    return validator
  }

  max(length: number, message?: string): StringValidator {
    const validator = new StringValidator()
    validator.minLength = this.minLength
    validator.maxLength = length
    validator.pattern = this.pattern
    validator.customValidations = [...this.customValidations]
    if (message) {
      validator.customValidations.push(value =>
        value.length > length ? message : null
      )
    }
    return validator
  }

  regex(pattern: RegExp, message?: string): StringValidator {
    const validator = new StringValidator()
    validator.minLength = this.minLength
    validator.maxLength = this.maxLength
    validator.pattern = pattern
    validator.customValidations = [...this.customValidations]
    if (message) {
      validator.customValidations.push(value =>
        !pattern.test(value) ? message : null
      )
    } else {
      // Use the pattern for validation but don't add a custom message
      // The default "Invalid format" will be used
    }
    return validator
  }

  email(message = 'Please enter a valid email address'): StringValidator {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validator = new StringValidator()
    validator.minLength = this.minLength
    validator.maxLength = this.maxLength
    validator.pattern = this.pattern
    validator.customValidations = [
      ...this.customValidations,
      value => (!emailRegex.test(value) ? message : null),
    ]
    return validator
  }

  refine(validation: (value: string) => string | null): StringValidator {
    const validator = new StringValidator()
    validator.minLength = this.minLength
    validator.maxLength = this.maxLength
    validator.pattern = this.pattern
    validator.customValidations = [...this.customValidations, validation]
    return validator
  }
}

// Boolean validator
export class BooleanValidator extends BaseValidator<boolean> {
  private mustBeTrue = false
  private trueMessage?: string

  validate(value: unknown): ValidatorResult<boolean> {
    if (typeof value !== 'boolean') {
      return { success: false, errors: [{ message: 'Expected boolean' }] }
    }

    if (this.mustBeTrue && value !== true) {
      return {
        success: false,
        errors: [{ message: this.trueMessage || 'Must be true' }],
      }
    }

    return { success: true, data: value }
  }

  refine(
    condition: (value: boolean) => boolean,
    message: string
  ): BooleanValidator {
    const validator = new BooleanValidator()
    validator.mustBeTrue = this.mustBeTrue
    validator.trueMessage = this.trueMessage

    const originalValidate = validator.validate.bind(validator)
    validator.validate = (value: unknown) => {
      const result = originalValidate(value)
      if (!result.success) return result

      if (!condition(result.data)) {
        return { success: false, errors: [{ message }] }
      }

      return result
    }

    return validator
  }

  literal(value: true, message?: string): BooleanValidator {
    const validator = new BooleanValidator()
    validator.mustBeTrue = true
    validator.trueMessage = message
    return validator
  }
}

// Optional validator wrapper
class OptionalValidator<Input, Output> extends BaseValidator<
  Input | undefined,
  Output | undefined
> {
  constructor(private inner: Validator<Input, Output>) {
    super()
  }

  validate(value: unknown): ValidatorResult<Output | undefined> {
    if (value === undefined) {
      return { success: true, data: undefined }
    }

    const result = this.inner.validate(value)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, errors: result.errors }
    }
  }
}

// Default validator wrapper
class DefaultValidator<Input, Output> extends BaseValidator<
  Input | undefined,
  Output
> {
  constructor(
    private inner: Validator<Input, Output>,
    private defaultValue: Output
  ) {
    super()
  }

  validate(value: unknown): ValidatorResult<Output> {
    if (value === undefined) {
      return { success: true, data: this.defaultValue }
    }

    return this.inner.validate(value)
  }
}

// Object validator
export class ObjectValidator<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
> extends BaseValidator<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private shape: { [K in keyof T]: Validator<any, T[K]> }) {
    super()
  }

  validate(value: unknown): ValidatorResult<T> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { success: false, errors: [{ message: 'Expected object' }] }
    }

    const obj = value as Record<string, unknown>
    const result = {} as T
    const errors: ValidationError[] = []

    for (const [key, validator] of Object.entries(this.shape)) {
      const fieldResult = validator.validate(obj[key])
      if (fieldResult.success) {
        result[key as keyof T] = fieldResult.data
      } else {
        for (const error of fieldResult.errors) {
          errors.push({
            message: error.message,
            path: [key, ...(error.path || [])],
          })
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors }
    }

    return { success: true, data: result }
  }

  refine<R extends T>(
    validation: (value: T) => string | null,
    options?: { path?: (keyof T)[] }
  ): ObjectValidator<R> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validator = new ObjectValidator<R>(this.shape as any)

    const originalValidate = validator.validate.bind(validator)
    validator.validate = (value: unknown) => {
      const result = originalValidate(value)
      if (!result.success) return result

      const error = validation(result.data as T)
      if (error) {
        return {
          success: false,
          errors: [
            {
              message: error,
              path: options?.path as (
                | PropertyKey
                | StandardSchemaV1.PathSegment
              )[],
            },
          ],
        }
      }

      return { success: true, data: result.data as R }
    }

    return validator
  }
}

// Factory functions
export const string = () => new StringValidator()
export const boolean = () => new BooleanValidator()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const object = <T extends Record<string, any>>(shape: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: Validator<any, T[K]>
}) => new ObjectValidator<T>(shape)

// Export the schema creation function
export { createStandardSchema }

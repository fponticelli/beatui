/**
 * The Standard Schema v1 interface for schema validation libraries.
 *
 * This is an implementation of the
 * [Standard Schema](https://github.com/standard-schema/standard-schema) specification (v1),
 * which provides a common interface that schema validation libraries (Zod, Valibot, ArkType, etc.)
 * can implement so they are interchangeable.
 *
 * BeatUI uses this interface to accept any compatible schema library for form validation
 * without coupling to a specific implementation.
 *
 * @typeParam Input - The type accepted as input for validation
 * @typeParam Output - The type produced after successful validation (defaults to `Input`)
 *
 * @example
 * ```typescript
 * import type { StandardSchemaV1 } from '@tempots/beatui'
 * import { z } from 'zod'
 *
 * // Zod schemas already implement StandardSchemaV1
 * const schema: StandardSchemaV1<string, string> = z.string().email()
 *
 * // Validate a value
 * const result = await schema['~standard'].validate('test@example.com')
 * if (!result.issues) {
 *   console.log('Valid:', result.value)
 * }
 * ```
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties, accessed via the `~standard` key to avoid naming conflicts. */
  readonly '~standard': StandardSchemaV1.Props<Input, Output>
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace StandardSchemaV1 {
  /**
   * The Standard Schema properties interface containing version, vendor, validation function, and type info.
   *
   * @typeParam Input - The type accepted as input for validation
   * @typeParam Output - The type produced after successful validation
   */
  export interface Props<Input = unknown, Output = Input> {
    /** The version number of the Standard Schema specification (always `1` for v1). */
    readonly version: 1
    /** The vendor name of the schema library (e.g., `'zod'`, `'valibot'`, `'arktype'`). */
    readonly vendor: string
    /**
     * Validates an unknown input value against the schema.
     *
     * @param value - The value to validate
     * @returns A result indicating success (with typed output) or failure (with issues)
     */
    readonly validate: (
      value: unknown
    ) => Result<Output> | Promise<Result<Output>>
    /** Optional type information for inferring input and output types at the type level. */
    readonly types?: Types<Input, Output> | undefined
  }

  /**
   * Discriminated union representing the result of a validation operation.
   *
   * @typeParam Output - The type of the validated output value
   */
  export type Result<Output> = SuccessResult<Output> | FailureResult

  /**
   * The result when validation succeeds, containing the typed output value.
   *
   * @typeParam Output - The type of the validated output value
   */
  export interface SuccessResult<Output> {
    /** The typed output value after successful validation. */
    readonly value: Output
    /** Always `undefined` for success results, enabling discrimination from failure results. */
    readonly issues?: undefined
  }

  /**
   * The result when validation fails, containing an array of validation issues.
   */
  export interface FailureResult {
    /** The array of validation issues describing what went wrong. */
    readonly issues: ReadonlyArray<Issue>
  }

  /**
   * A single validation issue describing an error found during validation.
   */
  export interface Issue {
    /** The human-readable error message describing the validation failure. */
    readonly message: string
    /** The path to the field that caused the issue, if applicable. Each element is either a `PropertyKey` or a {@link PathSegment}. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined
  }

  /**
   * A path segment identifying a specific location within a nested data structure.
   */
  export interface PathSegment {
    /** The key (property name or array index) representing this path segment. */
    readonly key: PropertyKey
  }

  /**
   * Type information interface for inferring input and output types from a schema.
   *
   * @typeParam Input - The input type of the schema
   * @typeParam Output - The output type of the schema
   */
  export interface Types<Input = unknown, Output = Input> {
    /** The input type that the schema accepts for validation. */
    readonly input: Input
    /** The output type that the schema produces after successful validation. */
    readonly output: Output
  }

  /**
   * Utility type that infers the input type from a Standard Schema.
   *
   * @typeParam Schema - The Standard Schema to extract the input type from
   *
   * @example
   * ```typescript
   * type Input = StandardSchemaV1.InferInput<typeof mySchema>
   * ```
   */
  export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
    Schema['~standard']['types']
  >['input']

  /**
   * Utility type that infers the output type from a Standard Schema.
   *
   * @typeParam Schema - The Standard Schema to extract the output type from
   *
   * @example
   * ```typescript
   * type Output = StandardSchemaV1.InferOutput<typeof mySchema>
   * ```
   */
  export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
    Schema['~standard']['types']
  >['output']
}

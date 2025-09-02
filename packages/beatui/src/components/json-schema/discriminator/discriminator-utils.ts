import type { JSONSchema } from '../schema-context'

/**
 * OpenAPI discriminator configuration
 */
export interface OpenAPIDiscriminator {
  /** The name of the property in the payload that will hold the discriminator value */
  propertyName: string
  /** An object to hold mappings between payload values and schema names or references */
  mapping?: Record<string, string>
}

/**
 * BeatUI discriminator configuration (fallback)
 */
export interface BeatUIDiscriminator {
  /** The property name to use for discrimination */
  key: string
  /** Optional mapping of values to schema indices */
  mapping?: Record<string, number>
}

/**
 * Extract discriminator configuration from a oneOf schema
 */
export function getDiscriminatorConfig(schema: JSONSchema): {
  discriminator: OpenAPIDiscriminator | BeatUIDiscriminator | null
  type: 'openapi' | 'beatui' | null
} {
  if (typeof schema === 'boolean') {
    return { discriminator: null, type: null }
  }

  // Check for OpenAPI discriminator first
  if (schema.discriminator && typeof schema.discriminator === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const disc = schema.discriminator as any
    if (typeof disc.propertyName === 'string') {
      return {
        discriminator: {
          propertyName: disc.propertyName,
          mapping: disc.mapping || {},
        } as OpenAPIDiscriminator,
        type: 'openapi',
      }
    }
  }

  // Check for BeatUI discriminator in x:ui
  const xui = schema['x:ui'] as Record<string, unknown> | undefined
  if (xui?.discriminatorKey && typeof xui.discriminatorKey === 'string') {
    return {
      discriminator: {
        key: xui.discriminatorKey,
        mapping: (xui.discriminatorMapping as Record<string, number>) || {},
      } as BeatUIDiscriminator,
      type: 'beatui',
    }
  }

  return { discriminator: null, type: null }
}

/**
 * Determine which oneOf branch should be selected based on discriminator value
 */
export function selectOneOfBranch(
  oneOfSchemas: JSONSchema[],
  discriminatorConfig: {
    discriminator: OpenAPIDiscriminator | BeatUIDiscriminator | null
    type: 'openapi' | 'beatui' | null
  },
  currentValue: unknown
): number | null {
  if (
    !discriminatorConfig.discriminator ||
    !currentValue ||
    typeof currentValue !== 'object'
  ) {
    return null
  }

  const { discriminator, type } = discriminatorConfig

  if (type === 'openapi') {
    const openApiDisc = discriminator as OpenAPIDiscriminator
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const discriminatorValue = (currentValue as any)[openApiDisc.propertyName]

    if (discriminatorValue == null) {
      return null
    }

    // If there's a mapping, use it
    if (openApiDisc.mapping && openApiDisc.mapping[discriminatorValue]) {
      const mappedRef = openApiDisc.mapping[discriminatorValue]
      // Find the schema index that matches the mapped reference
      return findSchemaByRef(oneOfSchemas, mappedRef)
    }

    // Otherwise, try to match by discriminator value in schema properties
    return findSchemaByDiscriminatorValue(
      oneOfSchemas,
      openApiDisc.propertyName,
      discriminatorValue
    )
  }

  if (type === 'beatui') {
    const beatuiDisc = discriminator as BeatUIDiscriminator
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const discriminatorValue = (currentValue as any)[beatuiDisc.key]

    if (discriminatorValue == null) {
      return null
    }

    // If there's a mapping, use it directly
    if (beatuiDisc.mapping && beatuiDisc.mapping[discriminatorValue] != null) {
      const mappedIndex = beatuiDisc.mapping[discriminatorValue]
      return mappedIndex >= 0 && mappedIndex < oneOfSchemas.length
        ? mappedIndex
        : null
    }

    // Otherwise, try to match by discriminator value in schema properties
    return findSchemaByDiscriminatorValue(
      oneOfSchemas,
      beatuiDisc.key,
      discriminatorValue
    )
  }

  return null
}

/**
 * Find schema index by reference (for OpenAPI mapping)
 */
function findSchemaByRef(schemas: JSONSchema[], ref: string): number | null {
  for (let i = 0; i < schemas.length; i++) {
    const schema = schemas[i]
    if (typeof schema === 'object' && schema.$ref === ref) {
      return i
    }
  }
  return null
}

/**
 * Find schema index by discriminator property value
 */
function findSchemaByDiscriminatorValue(
  schemas: JSONSchema[],
  propertyName: string,
  value: unknown
): number | null {
  for (let i = 0; i < schemas.length; i++) {
    const schema = schemas[i]
    if (typeof schema !== 'object') continue

    // Check if the schema has the discriminator property with a const value
    const properties = schema.properties as
      | Record<string, JSONSchema>
      | undefined
    if (properties && properties[propertyName]) {
      const discriminatorProp = properties[propertyName]
      if (
        typeof discriminatorProp === 'object' &&
        discriminatorProp.const === value
      ) {
        return i
      }

      // Also check enum with single value
      if (
        typeof discriminatorProp === 'object' &&
        Array.isArray(discriminatorProp.enum) &&
        discriminatorProp.enum.length === 1 &&
        discriminatorProp.enum[0] === value
      ) {
        return i
      }
    }

    // Check if the schema itself has a const discriminator at root level
    if (schema.const === value) {
      return i
    }
  }

  return null
}

/**
 * Get the discriminator property name from configuration
 */
export function getDiscriminatorPropertyName(discriminatorConfig: {
  discriminator: OpenAPIDiscriminator | BeatUIDiscriminator | null
  type: 'openapi' | 'beatui' | null
}): string | null {
  if (!discriminatorConfig.discriminator) {
    return null
  }

  if (discriminatorConfig.type === 'openapi') {
    return (discriminatorConfig.discriminator as OpenAPIDiscriminator)
      .propertyName
  }

  if (discriminatorConfig.type === 'beatui') {
    return (discriminatorConfig.discriminator as BeatUIDiscriminator).key
  }

  return null
}

/**
 * Create a discriminator value for a specific oneOf branch
 */
export function createDiscriminatorValue(
  oneOfSchemas: JSONSchema[],
  branchIndex: number,
  discriminatorConfig: {
    discriminator: OpenAPIDiscriminator | BeatUIDiscriminator | null
    type: 'openapi' | 'beatui' | null
  }
): Record<string, unknown> | null {
  if (
    !discriminatorConfig.discriminator ||
    branchIndex < 0 ||
    branchIndex >= oneOfSchemas.length
  ) {
    return null
  }

  const propertyName = getDiscriminatorPropertyName(discriminatorConfig)
  if (!propertyName) {
    return null
  }

  const schema = oneOfSchemas[branchIndex]
  if (typeof schema !== 'object') {
    return null
  }

  // Try to extract the discriminator value from the schema
  const properties = schema.properties as Record<string, JSONSchema> | undefined
  if (properties && properties[propertyName]) {
    const discriminatorProp = properties[propertyName]
    if (typeof discriminatorProp === 'object') {
      if (discriminatorProp.const != null) {
        return { [propertyName]: discriminatorProp.const }
      }
      if (
        Array.isArray(discriminatorProp.enum) &&
        discriminatorProp.enum.length === 1
      ) {
        return { [propertyName]: discriminatorProp.enum[0] }
      }
    }
  }

  // If we can't determine the value from the schema, return null
  return null
}

/**
 * Validate that a oneOf schema is properly configured for discriminator usage
 */
export function validateDiscriminatorConfiguration(
  oneOfSchemas: JSONSchema[],
  discriminatorConfig: {
    discriminator: OpenAPIDiscriminator | BeatUIDiscriminator | null
    type: 'openapi' | 'beatui' | null
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!discriminatorConfig.discriminator) {
    return { valid: true, errors: [] } // No discriminator is valid
  }

  const propertyName = getDiscriminatorPropertyName(discriminatorConfig)
  if (!propertyName) {
    errors.push('Invalid discriminator configuration: no property name')
    return { valid: false, errors }
  }

  // Check that each schema has the discriminator property
  for (let i = 0; i < oneOfSchemas.length; i++) {
    const schema = oneOfSchemas[i]
    if (typeof schema !== 'object') {
      errors.push(`Schema ${i} is not an object`)
      continue
    }

    const properties = schema.properties as
      | Record<string, JSONSchema>
      | undefined
    if (!properties || !properties[propertyName]) {
      errors.push(
        `Schema ${i} missing discriminator property '${propertyName}'`
      )
      continue
    }

    const discriminatorProp = properties[propertyName]
    if (typeof discriminatorProp !== 'object') {
      errors.push(
        `Schema ${i} discriminator property '${propertyName}' is not an object`
      )
      continue
    }

    // Check that the discriminator property has a const or single enum value
    if (
      discriminatorProp.const == null &&
      (!Array.isArray(discriminatorProp.enum) ||
        discriminatorProp.enum.length !== 1)
    ) {
      errors.push(
        `Schema ${i} discriminator property '${propertyName}' must have const or single enum value`
      )
    }
  }

  return { valid: errors.length === 0, errors }
}

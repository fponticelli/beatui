# Research: JSON Structure Form Components

**Date**: 2026-01-13
**Branch**: `001-json-structure-forms`

## Research Topics

### 1. JSON Structure SDK Integration

**Decision**: Use `@json-structure/sdk` npm package for schema parsing and validation

**Rationale**:
- Official TypeScript SDK from JSON Structure specification authors
- Provides both schema validation (verify schema documents) and instance validation (validate data against schemas)
- Full support for Validation extension (minLength, maxLength, pattern, minimum, maximum, etc.)
- Stateless after construction - safe for concurrent use
- Supports external schema sideloading for `$import` references

**Alternatives Considered**:
- Build custom validator from scratch: Rejected due to complexity and maintenance burden
- Adapt AJV: Rejected because JSON Structure differs significantly from JSON Schema (different type system, $extends, choice types)

**API Pattern** (from json-structure.org/sdks/typescript.html):
```typescript
import { SchemaValidator, InstanceValidator } from '@json-structure/sdk'

// Schema validation
const schemaValidator = new SchemaValidator({ extended: true })
const schemaResult = schemaValidator.validate(schemaDocument)

// Instance validation
const instanceValidator = new InstanceValidator(schema, {
  extended: true,
  externalSchemas: [...]
})
const result = instanceValidator.validate(data)

// Result structure
interface ValidationResult {
  isValid: boolean
  errors: Array<{
    path: string
    message: string
    code?: string
  }>
}
```

### 2. Type Mapping: JSON Structure to BeatUI Controls

**Decision**: Map each JSON Structure type to existing or new BeatUI controls

| JSON Structure Type | BeatUI Control | Notes |
|---------------------|----------------|-------|
| `string` | TextInput | Existing, reuse |
| `boolean` | Checkbox/Toggle | Existing, reuse |
| `int8`, `int16`, `int32` | NumberInput | Existing, reuse with step=1 |
| `int64`, `int128` | NumberInput + BigInt | NEW: BigInt conversion |
| `uint8`, `uint16`, `uint32` | NumberInput | Existing, min=0 |
| `uint64`, `uint128` | NumberInput + BigInt | NEW: BigInt conversion, min=0 |
| `float`, `double` | NumberInput | Existing, allow decimals |
| `decimal` | NumberInput | Existing, respect precision/scale |
| `uuid` | TextInput | Existing, with UUID pattern |
| `date` | DateInput | Existing, reuse |
| `datetime` | DateTimeInput | Existing, reuse |
| `time` | TimeInput | Existing, reuse |
| `duration` | TextInput | NEW: Duration format input |
| `uri` | TextInput | Existing, with URL validation |
| `binary` | FileInput | Existing, base64 handling |
| `object` | ObjectControl | Pattern from JSON Schema |
| `array` | ArrayControl | Existing, reuse |
| `set` | SetControl | NEW: Array with uniqueness |
| `map` | MapControl | NEW: Key-value pair control |
| `tuple` | TupleControl | NEW: Fixed-order fields |
| `enum` | Select/RadioGroup | Existing, reuse |
| `const` | ReadOnlyDisplay | Existing, reuse |
| `choice` | ChoiceControl | NEW: Discriminated union |
| `any` | JsonEditor/TextArea | Fallback |

**Rationale**: Maximize reuse of existing components. Only create new controls for types that don't exist in JSON Schema (tuple, choice, set, map, BigInt handling).

### 3. BigInt Handling for Large Integers

**Decision**: Use native BigInt with number input

**Rationale**:
- JavaScript Number.MAX_SAFE_INTEGER is 2^53-1, insufficient for int64/int128
- BigInt is supported in all modern browsers (ES2020+)
- JSON Structure spec requires string serialization for large integers to preserve precision
- Input component uses string internally, converts to BigInt for validation/value

**Implementation Pattern**:
```typescript
// Input handling
const handleBigIntInput = (inputValue: string): bigint | null => {
  try {
    return BigInt(inputValue)
  } catch {
    return null // Invalid format
  }
}

// Serialization (for JSON)
const serializeBigInt = (value: bigint): string => value.toString()
```

**Alternatives Considered**:
- String input with pattern validation: Simpler but loses BigInt type safety
- Polyfill library: Unnecessary given native BigInt support in target browsers

### 4. Context Pattern for Schema Traversal

**Decision**: Create `StructureContext` class following `SchemaContext` pattern

**Rationale**:
- Proven pattern from JSON Schema implementation
- Immutable context threading via `.with()` method
- Tracks current path, schema root, and rendering options
- Caches computed properties for performance

**Key Properties**:
```typescript
class StructureContext {
  schema: JSONStructureSchema        // Root schema
  definition: TypeDefinition         // Current type definition
  path: ReadonlyArray<PropertyKey>   // Current path
  readOnly: boolean                  // Form-level read-only mode
  locale?: string                    // For altnames resolution
  widgetRegistry?: WidgetRegistry    // Custom widgets

  // Computed getters
  get isRequired(): boolean
  get isNullable(): boolean
  get resolvedType(): string | string[]
  get description(): string | undefined
  get label(): string  // From name or altnames
}
```

### 5. Widget Registry System

**Decision**: Implement dual-layer registry (global + form-scoped) following JSON Schema pattern

**Rationale**:
- Enables customization without modifying library code
- Form-scoped registry allows per-instance overrides
- Priority-based resolution supports fallback chains

**API Pattern**:
```typescript
interface WidgetRegistration {
  factory: WidgetFactory
  displayName: string
  supportedTypes?: string[]
  priority?: number
  matcher?: (ctx: StructureContext) => boolean
}

// Registration helpers
forType('decimal', MyDecimalWidget)
forFormat('email', MyEmailWidget)
```

### 6. $ref Resolution Strategy

**Decision**: Implement in-document resolution only (no external URLs)

**Rationale**:
- Spec assumption: external refs out of scope for initial implementation
- Simplifies implementation without async loading
- JSON Pointer (RFC 6901) resolution is well-defined
- Can add external resolution as future enhancement

**Implementation**:
```typescript
function resolveRef(
  ref: string,
  rootSchema: JSONStructureSchema
): TypeDefinition | null {
  // ref format: "#/definitions/Namespace/TypeName"
  const pointer = ref.slice(1) // Remove leading #
  return navigateJsonPointer(rootSchema, pointer)
}
```

### 7. $extends Inheritance Resolution

**Decision**: Resolve inheritance at render time, merge properties

**Rationale**:
- Base types marked `abstract: true` cannot be instantiated directly
- Properties merge with derived type taking precedence on conflicts
- Required arrays union together
- Supports multiple inheritance via array `$extends`

**Implementation Pattern**:
```typescript
function resolveExtends(
  definition: TypeDefinition,
  rootSchema: JSONStructureSchema
): TypeDefinition {
  if (!definition.$extends) return definition

  const bases = Array.isArray(definition.$extends)
    ? definition.$extends
    : [definition.$extends]

  let merged = { ...definition }
  for (const baseRef of bases) {
    const base = resolveRef(baseRef, rootSchema)
    if (base) {
      merged = mergeTypeDefinitions(base, merged)
    }
  }
  return merged
}
```

### 8. Validation Integration

**Decision**: Wrap `@json-structure/sdk` InstanceValidator, transform errors to BeatUI format

**Rationale**:
- SDK provides complete validation with error paths
- Need to transform SDK errors to Controller validation format
- Debounce validation on input for performance

**Error Transformation**:
```typescript
function transformValidationErrors(
  sdkResult: ValidationResult
): ControllerValidation {
  if (sdkResult.isValid) return {}

  // Convert flat errors to nested structure by path
  return sdkResult.errors.reduce((acc, error) => {
    const pathParts = parseJsonPointer(error.path)
    setNestedError(acc, pathParts, error.message)
    return acc
  }, {})
}
```

## Unresolved Items

All technical clarifications resolved during specification phase. No remaining unknowns.

## References

- JSON Structure Core Specification: https://json-structure.org/
- JSON Structure Validation Extension: https://json-structure.github.io/validation/
- JSON Structure TypeScript SDK: https://json-structure.org/sdks/typescript.html
- BeatUI JSON Schema Implementation: `packages/beatui/src/components/json-schema/`

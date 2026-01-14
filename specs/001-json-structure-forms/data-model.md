# Data Model: JSON Structure Form Components

**Date**: 2026-01-13
**Branch**: `001-json-structure-forms`

## Core Entities

### JSONStructureSchema

The root schema document following JSON Structure Core specification.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | `string` | Yes | Meta-schema URI (e.g., "https://json-structure.org/meta/core/v0/#") |
| `$id` | `string` | Yes | Unique absolute URI identifier for this schema |
| `name` | `string` | Yes | Document/root type name |
| `$root` | `string` | No | JSON Pointer to root type (mutually exclusive with `type`) |
| `type` | `TypeKeyword` | No | Inline root type (mutually exclusive with `$root`) |
| `definitions` | `Record<string, TypeDefinition \| Namespace>` | No | Reusable type definitions |
| `$uses` | `string[]` | No | Extensions to activate |

### TypeDefinition

Individual type definitions within the schema.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `TypeKeyword \| TypeKeyword[] \| { $ref: string }` | Yes* | Type specification |
| `name` | `string` | No | Type name (required for objects at definition level) |
| `description` | `string` | No | Human-readable explanation |
| `examples` | `unknown[]` | No | Valid instance examples |
| `deprecated` | `boolean` | No | Mark as deprecated |
| `abstract` | `boolean` | No | Base-only type (cannot instantiate) |
| `$extends` | `string \| string[]` | No | Base type pointer(s) to inherit from |

*Required unless using `$ref`

### TypeKeyword (Union)

```
"string" | "boolean" | "null" |
"int8" | "int16" | "int32" | "int64" | "int128" |
"uint8" | "uint16" | "uint32" | "uint64" | "uint128" |
"float" | "double" | "decimal" |
"date" | "datetime" | "time" | "duration" |
"uuid" | "uri" | "binary" |
"object" | "array" | "set" | "map" | "tuple" | "choice" | "any"
```

## Type-Specific Fields

### Object Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `properties` | `Record<string, TypeDefinition>` | Yes | Property definitions (min 1) |
| `required` | `string[] \| string[][]` | No | Required property names or alternative sets |
| `additionalProperties` | `boolean \| TypeDefinition` | No | Allow/define extra properties |

### Array Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | `TypeDefinition` | Yes | Item type definition |

### Set Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | `TypeDefinition` | Yes | Item type (uniqueness enforced) |

### Map Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `values` | `TypeDefinition` | Yes | Value type (keys are always strings) |

### Tuple Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `properties` | `Record<string, TypeDefinition>` | Yes | Named element definitions |
| `tuple` | `string[]` | Yes | Ordered list of property names |

### Choice Type (Discriminated Union)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `choices` | `Record<string, TypeDefinition>` | Yes | Choice name to type mapping |
| `selector` | `string` | No | Discriminator property name (for inline unions) |
| `$extends` | `string` | No | Base type for inline unions |

### Decimal Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `precision` | `number` | No | Total significant digits |
| `scale` | `number` | No | Fractional digits |

### String Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `maxLength` | `number` | No | Maximum character length |

### Enum/Const

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enum` | `unknown[]` | No | Allowed discrete values |
| `const` | `unknown` | No | Single fixed value |

## Validation Extension Fields

Applied to type definitions when using JSON Structure Validation extension.

### String Validation

| Field | Type | Description |
|-------|------|-------------|
| `minLength` | `number` | Minimum character length |
| `maxLength` | `number` | Maximum character length |
| `pattern` | `string` | ECMA-262 regex pattern |
| `format` | `string` | Standard format (email, uri, ipv4, ipv6, etc.) |

### Numeric Validation

| Field | Type | Description |
|-------|------|-------------|
| `minimum` | `number` | Minimum value (inclusive) |
| `maximum` | `number` | Maximum value (inclusive) |
| `exclusiveMinimum` | `number` | Minimum value (exclusive) |
| `exclusiveMaximum` | `number` | Maximum value (exclusive) |
| `multipleOf` | `number` | Must be divisible by |

### Array/Set Validation

| Field | Type | Description |
|-------|------|-------------|
| `minItems` | `number` | Minimum element count |
| `maxItems` | `number` | Maximum element count |
| `uniqueItems` | `boolean` | All items must be unique (implicit for set) |
| `contains` | `TypeDefinition` | At least one item must match |
| `minContains` | `number` | Minimum matching items |
| `maxContains` | `number` | Maximum matching items |

### Object/Map Validation

| Field | Type | Description |
|-------|------|-------------|
| `minProperties` | `number` | Minimum property count |
| `maxProperties` | `number` | Maximum property count |
| `dependentRequired` | `Record<string, string[]>` | Property dependencies |

### Default Value

| Field | Type | Description |
|-------|------|-------------|
| `default` | `unknown` | Fallback value when absent |

## Metadata Fields

### Altnames (Multilingual Support)

| Field | Type | Description |
|-------|------|-------------|
| `altnames.json` | `string` | JSON serialization name |
| `altnames.lang:XX` | `string` | Localized label (e.g., `lang:en`, `lang:de`) |

### Units and Symbols

| Field | Type | Description |
|-------|------|-------------|
| `unit` | `string` | Scientific unit (e.g., "kg", "m/s") |
| `currency` | `string` | Currency code (e.g., "USD", "EUR") |

## Runtime Entities

### StructureContext

Runtime context for form rendering (not persisted).

| Field | Type | Description |
|-------|------|-------------|
| `schema` | `JSONStructureSchema` | Root schema document |
| `definition` | `TypeDefinition` | Current type being rendered |
| `path` | `PropertyKey[]` | Path from root to current position |
| `readOnly` | `boolean` | Form-level read-only mode |
| `locale` | `string \| undefined` | Current locale for altnames |
| `widgetRegistry` | `WidgetRegistry \| undefined` | Custom widgets |
| `validator` | `InstanceValidator \| undefined` | SDK validator instance |

### WidgetRegistration

Custom widget configuration.

| Field | Type | Description |
|-------|------|-------------|
| `factory` | `WidgetFactory` | Function to create widget |
| `displayName` | `string` | Human-readable name |
| `supportedTypes` | `string[]` | JSON Structure types this handles |
| `priority` | `number` | Resolution priority (higher = preferred) |
| `matcher` | `(ctx: StructureContext) => boolean` | Custom matching logic |

### ValidationResult

Result from SDK validation.

| Field | Type | Description |
|-------|------|-------------|
| `isValid` | `boolean` | Overall validity |
| `errors` | `ValidationError[]` | List of errors |

### ValidationError

Individual validation error.

| Field | Type | Description |
|-------|------|-------------|
| `path` | `string` | JSON Pointer to error location |
| `message` | `string` | Human-readable error message |
| `code` | `string \| undefined` | Error code for programmatic handling |

## Entity Relationships

```
JSONStructureSchema
├── definitions: Record<string, TypeDefinition | Namespace>
│   └── TypeDefinition
│       ├── type → TypeKeyword | $ref
│       ├── properties → Record<string, TypeDefinition>  (for object)
│       ├── items → TypeDefinition  (for array/set)
│       ├── values → TypeDefinition  (for map)
│       ├── choices → Record<string, TypeDefinition>  (for choice)
│       └── $extends → references TypeDefinition
└── type | $root → TypeDefinition

StructureContext
├── schema → JSONStructureSchema
├── definition → TypeDefinition
├── widgetRegistry → WidgetRegistry
│   └── registrations: WidgetRegistration[]
└── validator → InstanceValidator (from @json-structure/sdk)
```

## State Transitions

### Form Value Lifecycle

```
[Initial Value] → [User Edit] → [Validation] → [Valid/Invalid State] → [Submit]
      ↓               ↓              ↓                  ↓
   optional      onChange      debounced         errors shown
   default       handler      SDK call          or cleared
```

### Choice Type Selection

```
[No Selection] → [User Selects Choice] → [Render Choice Fields] → [User Edits]
      ↓                  ↓                        ↓                    ↓
   show all         clear previous           show only            validate
   options          choice data              selected             selected
                                            type fields          type only
```

### Array/Set Item Management

```
[Empty Array] → [Add Item] → [Edit Item] → [Remove Item]
      ↓             ↓             ↓              ↓
   show add      append to     update at     remove from
   button        value array   index         array
                               validate      revalidate
                               uniqueness    min/max
                               (set only)
```

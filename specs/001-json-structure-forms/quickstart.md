# Quickstart: JSON Structure Form Components

**Date**: 2026-01-13
**Branch**: `001-json-structure-forms`

## Installation

```bash
# Install BeatUI with JSON Structure support
npm install @tempots/beatui @json-structure/sdk

# Peer dependencies
npm install @tempots/dom @tempots/ui @tempots/std
```

## Basic Usage

### Simple Form

```typescript
import { JSONStructureForm } from '@tempots/beatui/json-structure'
import { render } from '@tempots/dom'

const schema = {
  $schema: 'https://json-structure.org/meta/core/v0/#',
  $id: 'https://example.com/user',
  name: 'User',
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Full name' },
    email: { type: 'string', format: 'email' },
    age: { type: 'int32', minimum: 0, maximum: 150 }
  },
  required: ['name', 'email']
}

render(
  JSONStructureForm({
    schema,
    initialValue: { name: '', email: '', age: 25 },
    onSubmit: (value) => console.log('Submitted:', value),
    onValidate: (errors) => console.log('Errors:', errors)
  }),
  document.getElementById('app')
)
```

### With Validation Feedback

```typescript
import { JSONStructureForm } from '@tempots/beatui/json-structure'
import { prop } from '@tempots/dom'

const formStatus = prop<'idle' | 'valid' | 'invalid'>('idle')

JSONStructureForm({
  schema,
  initialValue: {},
  validationMode: 'eager', // Validate on every change
  onValidate: (errors) => {
    formStatus.set(errors.length === 0 ? 'valid' : 'invalid')
  },
  onSubmit: async (value) => {
    await saveUser(value)
  }
})
```

## Schema Examples

### Primitive Types

```json
{
  "$schema": "https://json-structure.org/meta/validation/v0/#",
  "$id": "https://example.com/primitives",
  "name": "AllPrimitives",
  "type": "object",
  "properties": {
    "text": { "type": "string", "maxLength": 100 },
    "flag": { "type": "boolean" },
    "count": { "type": "int32", "minimum": 0 },
    "amount": { "type": "decimal", "precision": 10, "scale": 2 },
    "id": { "type": "uuid" },
    "website": { "type": "uri" },
    "birthDate": { "type": "date" },
    "createdAt": { "type": "datetime" }
  }
}
```

### Collections

```json
{
  "type": "object",
  "properties": {
    "tags": {
      "type": "set",
      "items": { "type": "string" },
      "minItems": 1,
      "maxItems": 10
    },
    "scores": {
      "type": "array",
      "items": { "type": "int32", "minimum": 0, "maximum": 100 }
    },
    "metadata": {
      "type": "map",
      "values": { "type": "string" }
    }
  }
}
```

### Tuple Type

```json
{
  "type": "object",
  "properties": {
    "coordinates": {
      "type": "tuple",
      "name": "GeoPoint",
      "properties": {
        "latitude": { "type": "double", "minimum": -90, "maximum": 90 },
        "longitude": { "type": "double", "minimum": -180, "maximum": 180 }
      },
      "tuple": ["latitude", "longitude"]
    }
  }
}
```

### Choice (Discriminated Union)

```json
{
  "type": "object",
  "properties": {
    "payment": {
      "type": "choice",
      "name": "PaymentMethod",
      "choices": {
        "creditCard": {
          "type": "object",
          "properties": {
            "cardNumber": { "type": "string", "pattern": "^[0-9]{16}$" },
            "expiry": { "type": "string", "pattern": "^[0-9]{2}/[0-9]{2}$" }
          },
          "required": ["cardNumber", "expiry"]
        },
        "bankTransfer": {
          "type": "object",
          "properties": {
            "iban": { "type": "string" },
            "bic": { "type": "string" }
          },
          "required": ["iban"]
        }
      }
    }
  }
}
```

### Type Inheritance

```json
{
  "definitions": {
    "Base": {
      "abstract": true,
      "type": "object",
      "properties": {
        "id": { "type": "uuid" },
        "createdAt": { "type": "datetime" }
      },
      "required": ["id"]
    },
    "User": {
      "type": "object",
      "$extends": "#/definitions/Base",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      },
      "required": ["name", "email"]
    }
  },
  "$root": "#/definitions/User"
}
```

### With References

```json
{
  "definitions": {
    "Address": {
      "type": "object",
      "name": "Address",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "country": { "type": "string" }
      },
      "required": ["city", "country"]
    }
  },
  "type": "object",
  "properties": {
    "homeAddress": { "type": { "$ref": "#/definitions/Address" } },
    "workAddress": { "type": { "$ref": "#/definitions/Address" } }
  }
}
```

## Custom Widgets

### Register Global Widget

```typescript
import { registerWidget, forType } from '@tempots/beatui/json-structure'

// Register for a specific type
registerWidget(
  forType('decimal', ({ controller, ctx }) => {
    // Return custom Tempo component
    return MyCurrencyInput({
      value: controller.signal,
      currency: ctx.definition.currency ?? 'USD',
      onChange: controller.set
    })
  }, {
    displayName: 'Currency Input',
    priority: 10
  })
)
```

### Form-Scoped Widgets

```typescript
import { JSONStructureForm, createWidgetRegistry, forFormat } from '@tempots/beatui/json-structure'

const customRegistry = createWidgetRegistry()
customRegistry.register(
  forFormat('email', MyFancyEmailInput)
)

JSONStructureForm({
  schema,
  initialValue: {},
  widgetRegistry: customRegistry
})
```

## Read-Only Mode

```typescript
JSONStructureForm({
  schema,
  initialValue: existingData,
  readOnly: true // All fields non-editable
})
```

## Localization

```typescript
// Schema with altnames
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      altnames: {
        'lang:en': 'Full Name',
        'lang:de': 'Vollständiger Name',
        'lang:es': 'Nombre Completo'
      }
    }
  }
}

// Form with locale
JSONStructureForm({
  schema,
  initialValue: {},
  locale: 'de' // Will show "Vollständiger Name" as label
})
```

## Form Controller Access

```typescript
import { JSONStructureForm, useStructureController } from '@tempots/beatui/json-structure'

// Get controller for programmatic access
const { controller, validate, reset } = useStructureController({
  schema,
  initialValue: {}
})

// Subscribe to value changes
controller.signal.on((value) => {
  console.log('Form value:', value)
})

// Programmatic validation
const errors = await validate()

// Reset to initial value
reset()
```

## Styling

Import the CSS for default styling:

```typescript
import '@tempots/beatui/css'
// Or for JSON Structure specific styles only:
import '@tempots/beatui/dist/json-structure.css'
```

Component classes follow BEM naming:
- `.bc-json-structure-form` - Form wrapper
- `.bc-json-structure-object` - Object container
- `.bc-json-structure-array` - Array container
- `.bc-json-structure-choice` - Choice selector
- `.bc-json-structure-tuple` - Tuple container

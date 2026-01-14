# Feature Specification: JSON Structure Form Components

**Feature Branch**: `001-json-structure-forms`
**Created**: 2026-01-13
**Status**: Draft
**Input**: User description: "fully understand how JSON Structure works by consulting this site: https://json-structure.org/ then similarly to the existing JSONSchema Form Component specify a new set of components (reuse as much as possible from existing components in BeatUI) to generate forms from JSON Structure"

## Clarifications

### Session 2026-01-13

- Q: Should we build a custom validator or use an existing library for JSON Structure validation? → A: Use the official `@json-structure/sdk` npm package which provides schema validation, instance validation, and full support for the Validation extension
- Q: How should large integers (int64, int128, uint64, uint128) be handled given JavaScript number limitations? → A: Number input with BigInt conversion
- Q: Should forms support a read-only/view-only mode for displaying data without editing? → A: Yes, support form-level read-only mode where all fields become non-editable

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Render Primitive Type Fields (Priority: P1)

A developer wants to use a JSON Structure schema to automatically generate form inputs for primitive data types. They provide a schema with string, boolean, integer, double, decimal, uuid, and datetime fields, and the form renders appropriate input controls for each type.

**Why this priority**: Primitive types are the foundation of any form. Without rendering basic inputs, no form can be functional. This delivers immediate value for simple data entry forms.

**Independent Test**: Can be fully tested by providing a JSON Structure schema with primitive properties and verifying each renders with the correct input type (text, number, checkbox, date picker, etc.).

**Acceptance Scenarios**:

1. **Given** a JSON Structure schema with a `string` property, **When** the form renders, **Then** a text input is displayed
2. **Given** a JSON Structure schema with a `boolean` property, **When** the form renders, **Then** a checkbox or toggle input is displayed
3. **Given** a JSON Structure schema with an `integer` property (int8, int16, int32, int64), **When** the form renders, **Then** a number input with integer constraints is displayed
4. **Given** a JSON Structure schema with a `double` or `decimal` property, **When** the form renders, **Then** a number input respecting precision/scale is displayed
5. **Given** a JSON Structure schema with a `uuid` property, **When** the form renders, **Then** a text input with UUID format validation is displayed
6. **Given** a JSON Structure schema with `date`, `datetime`, or `time` properties, **When** the form renders, **Then** appropriate date/time picker controls are displayed
7. **Given** a JSON Structure schema with a `uri` property, **When** the form renders, **Then** a URL input with validation is displayed

---

### User Story 2 - Render Object Structures (Priority: P1)

A developer wants to render a form from a JSON Structure schema containing nested object types with multiple properties. The form should display all properties with appropriate grouping and labels.

**Why this priority**: Object types are core to JSON Structure and most real-world schemas contain nested structures. This is essential for any practical form generation.

**Independent Test**: Can be fully tested by providing a schema with an object type containing multiple properties and verifying all fields render in a logical, grouped layout.

**Acceptance Scenarios**:

1. **Given** a JSON Structure schema with `type: "object"` and defined properties, **When** the form renders, **Then** all properties are displayed as form fields
2. **Given** an object schema with a `required` array, **When** the form renders, **Then** required fields are visually distinguished and validation enforces their presence
3. **Given** an object schema with nested object properties, **When** the form renders, **Then** nested fields are rendered with appropriate visual hierarchy
4. **Given** an object schema with `additionalProperties: true`, **When** the user interacts, **Then** they can add custom key-value pairs
5. **Given** an object schema with `additionalProperties: false`, **When** the form renders, **Then** only defined properties can be entered

---

### User Story 3 - Render Collection Types (Priority: P2)

A developer wants to render forms for array, set, and map collection types. Users can add, remove, and edit items in these collections.

**Why this priority**: Collections are common in data structures but build upon primitive and object rendering. They add significant value for complex data entry.

**Independent Test**: Can be fully tested by providing schemas with array/set/map types and verifying users can add, edit, and remove items.

**Acceptance Scenarios**:

1. **Given** a JSON Structure schema with `type: "array"` and `items` definition, **When** the form renders, **Then** a list control allows adding/removing items
2. **Given** a JSON Structure schema with `type: "set"` and `items` definition, **When** the form renders, **Then** a list control is displayed with uniqueness validation
3. **Given** a JSON Structure schema with `type: "map"` and `values` definition, **When** the form renders, **Then** users can add key-value pairs with string keys
4. **Given** an array with `minItems` and `maxItems` constraints, **When** the user attempts to add/remove items, **Then** the constraints are enforced
5. **Given** a set type, **When** the user adds a duplicate value, **Then** validation indicates the duplicate is not allowed

---

### User Story 4 - Render Tuple Types (Priority: P2)

A developer wants to render forms for tuple types which have fixed-length ordered elements with specific types at each position.

**Why this priority**: Tuples are a unique JSON Structure feature for representing fixed structures like coordinates or pairs. Important for specialized use cases.

**Independent Test**: Can be fully tested by providing a tuple schema and verifying the correct number of fields render with position-specific types.

**Acceptance Scenarios**:

1. **Given** a JSON Structure schema with `type: "tuple"` and named properties with a `tuple` ordering array, **When** the form renders, **Then** fields are displayed in the specified order
2. **Given** a tuple with mixed types (e.g., string and integer), **When** the form renders, **Then** each position shows the correct input type
3. **Given** a tuple schema, **When** the form submits, **Then** the value is serialized as a JSON array in the correct order

---

### User Story 5 - Render Enum and Const Values (Priority: P2)

A developer wants to render selection controls for enum values and display-only fields for const values.

**Why this priority**: Enums provide user-friendly selection from predefined options, essential for many form use cases.

**Independent Test**: Can be fully tested by providing a schema with enum/const keywords and verifying a select control or static display renders.

**Acceptance Scenarios**:

1. **Given** a schema with `enum` array, **When** the form renders, **Then** a selection control (dropdown, radio buttons) displays the enum options
2. **Given** a schema with `const` value, **When** the form renders, **Then** the value is displayed but not editable
3. **Given** an enum with string values, **When** the user selects an option, **Then** the form value reflects the selection

---

### User Story 6 - Render Choice (Discriminated Union) Types (Priority: P2)

A developer wants to render forms for choice types where users select between mutually exclusive options, each with its own schema.

**Why this priority**: Choice types are powerful for polymorphic data but require the foundation of other type rendering.

**Independent Test**: Can be fully tested by providing a choice schema and verifying users can select between options and see appropriate fields for each.

**Acceptance Scenarios**:

1. **Given** a schema with `type: "choice"` and multiple choices, **When** the form renders, **Then** a selector allows choosing between options
2. **Given** a choice selection, **When** the user selects an option, **Then** only fields for that choice are displayed
3. **Given** a choice with a `selector` property, **When** the form renders, **Then** the discriminator field determines which choice fields appear
4. **Given** a tagged union (default choice), **When** the user enters data, **Then** the value is serialized with the choice name as key

---

### User Story 7 - Render Union Types (Priority: P3)

A developer wants to render forms for non-discriminated union types where a field can accept multiple types.

**Why this priority**: Union types add flexibility but are less common than discriminated choices. Lower priority due to complexity.

**Independent Test**: Can be fully tested by providing a union type schema and verifying the form handles multiple possible types.

**Acceptance Scenarios**:

1. **Given** a schema with `type: ["string", "integer"]`, **When** the form renders, **Then** a control allows input that validates against either type
2. **Given** a union with null (e.g., `["string", "null"]`), **When** the form renders, **Then** the field supports nullable input

---

### User Story 8 - Apply Validation Constraints (Priority: P1)

A developer wants form inputs to respect validation constraints from the JSON Structure Validation extension, providing immediate feedback on invalid input.

**Why this priority**: Validation is essential for data integrity and user experience. Users need to know when their input is incorrect.

**Independent Test**: Can be fully tested by providing schemas with validation constraints and verifying errors display for invalid input.

**Acceptance Scenarios**:

1. **Given** a string with `minLength`/`maxLength` constraints, **When** the user enters text outside bounds, **Then** a validation error is displayed
2. **Given** a string with `pattern` constraint, **When** the user enters non-matching text, **Then** a validation error is displayed
3. **Given** a string with `format` (email, uri, etc.), **When** the user enters invalid format, **Then** a validation error is displayed
4. **Given** a number with `minimum`/`maximum` constraints, **When** the user enters out-of-range value, **Then** a validation error is displayed
5. **Given** an array with `minItems`/`maxItems`, **When** the user violates the constraint, **Then** a validation error is displayed
6. **Given** any validated field, **When** validation fails, **Then** the error message is user-friendly and indicates how to fix the issue

---

### User Story 9 - Support Custom Widget Registration (Priority: P2)

A developer wants to register custom widgets for specific types or formats, overriding default rendering behavior.

**Why this priority**: Customization is important for real-world applications but requires the base system to work first.

**Independent Test**: Can be fully tested by registering a custom widget and verifying it renders instead of the default.

**Acceptance Scenarios**:

1. **Given** a custom widget registered for a specific type, **When** a schema uses that type, **Then** the custom widget renders
2. **Given** a custom widget registered for a specific format, **When** a schema uses that format, **Then** the custom widget renders
3. **Given** both global and form-scoped widget registries, **When** both have widgets for the same type, **Then** form-scoped takes precedence

---

### User Story 10 - Display Schema Metadata (Priority: P3)

A developer wants form fields to display helpful metadata from the schema including descriptions, examples, and multilingual labels from `altnames`.

**Why this priority**: Metadata improves user experience but forms are functional without it.

**Independent Test**: Can be fully tested by providing a schema with descriptions/altnames and verifying they display in the form.

**Acceptance Scenarios**:

1. **Given** a property with `description`, **When** the form renders, **Then** the description is displayed as help text
2. **Given** a property with `examples`, **When** the form renders, **Then** examples are shown as placeholder or hint text
3. **Given** a property with `altnames` including `lang:en` label, **When** the form renders in English locale, **Then** the localized label is used
4. **Given** a property marked `deprecated: true`, **When** the form renders, **Then** the field has a visual deprecation indicator

---

### User Story 11 - Handle Type Inheritance (Priority: P3)

A developer wants to use schemas with `$extends` for type inheritance, where extended types include properties from their base types.

**Why this priority**: Inheritance reduces schema duplication but is an advanced feature.

**Independent Test**: Can be fully tested by providing a schema with $extends and verifying all inherited properties render.

**Acceptance Scenarios**:

1. **Given** a schema that `$extends` an abstract base type, **When** the form renders, **Then** all base type properties are included
2. **Given** multiple levels of inheritance, **When** the form renders, **Then** properties from all ancestor types are included
3. **Given** property conflicts in inheritance chain, **When** the form renders, **Then** the most derived property definition takes precedence

---

### User Story 12 - Support Schema References (Priority: P2)

A developer wants to use `$ref` to reference reusable type definitions within the schema.

**Why this priority**: References enable modular, maintainable schemas but require proper resolution infrastructure.

**Independent Test**: Can be fully tested by providing a schema with $ref references and verifying referenced types render correctly.

**Acceptance Scenarios**:

1. **Given** a property with `type: { "$ref": "#/definitions/TypeName" }`, **When** the form renders, **Then** the referenced type definition is used
2. **Given** nested references (ref pointing to type with another ref), **When** the form renders, **Then** all references are resolved
3. **Given** a circular reference, **When** the form renders, **Then** the form handles it gracefully without infinite recursion

---

### Edge Cases

- What happens when a schema contains an unknown type not supported by the form renderer?
- How does the form handle deeply nested structures (e.g., 10+ levels)?
- What happens when required validation conflicts with nullable type?
- How does the form handle `binary` type with various content encodings?
- What happens when a `choice` has no valid option selected?
- How does the form handle empty objects/arrays as initial values?
- What happens when validation constraints are impossible to satisfy (e.g., minLength > maxLength)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse JSON Structure Core schemas and identify all supported types
- **FR-002**: System MUST render appropriate form controls for all primitive types (string, boolean, int8-int128, uint8-uint128, float, double, decimal, uuid, date, datetime, time, duration, uri, binary)
- **FR-003**: System MUST render nested form structures for object types with properties
- **FR-004**: System MUST enforce required field validation based on the `required` array
- **FR-005**: System MUST render list controls for array and set collection types
- **FR-006**: System MUST render key-value pair controls for map collection types
- **FR-007**: System MUST render fixed-position fields for tuple types
- **FR-008**: System MUST render selection controls for enum values
- **FR-009**: System MUST render read-only display for const values
- **FR-010**: System MUST render discriminated union controls for choice types
- **FR-011**: System MUST handle non-discriminated union types with multiple possible types
- **FR-012**: System MUST resolve $ref references within the schema
- **FR-013**: System MUST apply inherited properties from $extends base types
- **FR-014**: System MUST apply validation constraints from JSON Structure Validation extension (minLength, maxLength, pattern, format, minimum, maximum, minItems, maxItems, etc.)
- **FR-015**: System MUST display validation errors with user-friendly messages
- **FR-016**: System MUST support custom widget registration to override default rendering
- **FR-017**: System MUST display schema metadata (description, examples) as form help text
- **FR-018**: System MUST support localized labels via altnames when locale is specified
- **FR-019**: System MUST reuse existing BeatUI form components where applicable (InputWrapper, text inputs, number inputs, date pickers, select, checkbox, array controls, etc.)
- **FR-020**: System MUST provide a form controller for managing form state and validation
- **FR-021**: System MUST handle decimal precision and scale constraints
- **FR-022**: System MUST display deprecation indicators for deprecated properties
- **FR-023**: System MUST use BigInt conversion for large integer types (int64, int128, uint64, uint128) to preserve full precision
- **FR-024**: System MUST support a form-level read-only mode that renders all fields as non-editable for view-only display

### Key Entities

- **JSONStructureSchema**: The root schema definition containing $schema, $id, definitions, and type/root information
- **TypeDefinition**: Individual type definitions with type keyword, constraints, and metadata
- **StructureContext**: Runtime context tracking current path, schema, and configuration during form rendering
- **WidgetRegistry**: Collection of custom widget factories registered for specific types or formats
- **FormController**: State management object tracking form values, validation state, and dirty/touched status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can render a complete form from a JSON Structure schema with less than 10 lines of code
- **SC-002**: All 12 primitive types render with appropriate input controls
- **SC-003**: Forms with 20+ fields render within 500ms
- **SC-004**: 100% of validation constraints from JSON Structure Validation extension are enforced
- **SC-005**: Custom widgets can be registered and override default behavior for any type
- **SC-006**: Nested structures up to 5 levels deep render correctly
- **SC-007**: Users receive validation feedback within 200ms of input
- **SC-008**: 80% or more of existing BeatUI form components are reused (no unnecessary duplication)
- **SC-009**: Form state changes are reflected in real-time without full re-renders

## Assumptions

- The JSON Structure schema provided is valid according to the JSON Structure Core specification
- The official `@json-structure/sdk` npm package is used for schema parsing and validation (provides full Validation extension support)
- Initial form values, when provided, conform to the schema structure
- The application using these components has already set up the BeatUI/Tempo ecosystem
- Localization via altnames requires the application to specify the current locale
- External schema references ($ref to URLs) are not in scope for initial implementation; only in-document references are supported
- The `any` type will render as a generic JSON editor or text area
- Binary type will render as a file upload or base64 text input depending on context

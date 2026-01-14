# Implementation Plan: JSON Structure Form Components

**Branch**: `001-json-structure-forms` | **Date**: 2026-01-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-json-structure-forms/spec.md`

## Summary

Build a set of form components that automatically generate forms from JSON Structure schemas, following the same architectural patterns as the existing JSON Schema form implementation. The implementation will use the official `@json-structure/sdk` for schema parsing and validation, reuse existing BeatUI form components (InputWrapper, text inputs, number inputs, date pickers, select, checkbox, array controls), and introduce new type-specific controls for JSON Structure's unique types (tuple, choice, set, map, BigInt integers).

## Technical Context

**Language/Version**: TypeScript 5.9+ (ES2020 target)
**Primary Dependencies**:
- `@tempots/dom` - Reactive DOM library (core rendering)
- `@tempots/ui` - UI utilities (ElementRect, form utilities)
- `@tempots/std` - Standard utilities
- `@json-structure/sdk` - Official JSON Structure parsing and validation
**Storage**: N/A (client-side form state only)
**Testing**: Vitest with jsdom environment, @testing-library/dom
**Target Platform**: Browser (modern browsers with ES2020 support)
**Project Type**: Library (part of `@tempots/beatui` monorepo package)
**Performance Goals**:
- Forms with 20+ fields render within 500ms
- Validation feedback within 200ms of input
- Real-time state updates without full re-renders
**Constraints**:
- Must reuse 80%+ of existing BeatUI form components
- BigInt required for int64/int128 types
- No external $ref resolution (in-document only)
**Scale/Scope**: Support schemas with 5+ levels of nesting, 50+ fields

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is a template without specific gates defined. Following BeatUI's established patterns:

| Principle | Status | Notes |
|-----------|--------|-------|
| Component Reuse | ✅ PASS | FR-019 explicitly requires 80%+ reuse of existing components |
| Type Safety | ✅ PASS | TypeScript with strict mode, full type definitions |
| Testing | ✅ PASS | Vitest setup exists, test patterns established |
| Documentation | ✅ PASS | Component exports follow existing patterns with JSDoc |

No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-json-structure-forms/
├── plan.md              # This file
├── research.md          # Phase 0 output - SDK API patterns
├── data-model.md        # Phase 1 output - Type mappings and context
├── quickstart.md        # Phase 1 output - Usage examples
├── contracts/           # Phase 1 output - TypeScript interfaces
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
packages/beatui/
├── src/
│   ├── json-structure/           # NEW: Entry point module
│   │   └── index.ts              # Re-exports from components
│   │
│   ├── components/
│   │   └── json-structure/       # NEW: Main component directory
│   │       ├── index.ts                    # Public exports
│   │       ├── json-structure-form.ts      # Main form component
│   │       ├── structure-context.ts        # Context class (like SchemaContext)
│   │       ├── structure-types.ts          # TypeScript types for JSON Structure
│   │       ├── ref-utils.ts                # $ref resolution utilities
│   │       ├── extends-utils.ts            # $extends inheritance utilities
│   │       │
│   │       ├── controls/                   # Type-specific renderers
│   │       │   ├── generic-control.ts      # Type dispatcher
│   │       │   ├── string-control.ts       # String type
│   │       │   ├── boolean-control.ts      # Boolean type
│   │       │   ├── integer-control.ts      # int8-int128, uint8-uint128
│   │       │   ├── decimal-control.ts      # decimal, double, float
│   │       │   ├── temporal-control.ts     # date, datetime, time, duration
│   │       │   ├── uuid-control.ts         # uuid type
│   │       │   ├── uri-control.ts          # uri type
│   │       │   ├── binary-control.ts       # binary type
│   │       │   ├── object-control.ts       # object type
│   │       │   ├── array-control.ts        # array type
│   │       │   ├── set-control.ts          # set type (unique items)
│   │       │   ├── map-control.ts          # map type (key-value)
│   │       │   ├── tuple-control.ts        # tuple type
│   │       │   ├── enum-const-controls.ts  # enum and const
│   │       │   ├── choice-control.ts       # choice (discriminated union)
│   │       │   ├── union-control.ts        # Non-discriminated unions
│   │       │   └── any-control.ts          # any type fallback
│   │       │
│   │       ├── widgets/                    # Widget system
│   │       │   ├── widget-registry.ts      # Custom widget registration
│   │       │   ├── widget-utils.ts         # Widget resolution logic
│   │       │   └── default-widgets.ts      # Default widget mappings
│   │       │
│   │       └── validation/                 # Validation integration
│   │           ├── sdk-validator.ts        # @json-structure/sdk wrapper
│   │           └── error-transform.ts      # Error message formatting
│   │
│   └── styles/
│       └── layers/
│           └── 03.components/
│               └── json-structure.css      # NEW: Component styles
│
└── tests/
    └── json-structure/                     # NEW: Test directory
        ├── primitive-controls.test.ts
        ├── object-control.test.ts
        ├── collection-controls.test.ts
        ├── choice-control.test.ts
        ├── validation.test.ts
        ├── widget-registry.test.ts
        └── ref-resolution.test.ts
```

**Structure Decision**: Follows the established pattern from `components/json-schema/` with parallel structure. New entry point at `src/json-structure/` mirrors `src/json-schema/` for separate package export. All new components go under `src/components/json-structure/` following BeatUI conventions.

## Complexity Tracking

No constitution violations requiring justification. The design follows established patterns from the JSON Schema implementation.

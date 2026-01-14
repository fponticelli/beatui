# Tasks: JSON Structure Form Components

**Input**: Design documents from `/specs/001-json-structure-forms/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec - tests omitted. Add via separate request if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- Source: `packages/beatui/src/`
- Tests: `packages/beatui/tests/`
- Components: `packages/beatui/src/components/json-structure/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types, and foundational module structure

- [ ] T001 Install @json-structure/sdk dependency in packages/beatui/package.json
- [ ] T002 [P] Create TypeScript types in packages/beatui/src/components/json-structure/structure-types.ts
- [ ] T003 [P] Create module entry point in packages/beatui/src/json-structure/index.ts
- [ ] T004 [P] Create component exports in packages/beatui/src/components/json-structure/index.ts
- [ ] T005 Add json-structure entry to package.json exports map in packages/beatui/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Implement StructureContext class in packages/beatui/src/components/json-structure/structure-context.ts
- [ ] T007 [P] Implement $ref resolution utilities in packages/beatui/src/components/json-structure/ref-utils.ts
- [ ] T008 [P] Implement $extends inheritance utilities in packages/beatui/src/components/json-structure/extends-utils.ts
- [ ] T009 Implement SDK validator wrapper in packages/beatui/src/components/json-structure/validation/sdk-validator.ts
- [ ] T010 [P] Implement error transformation in packages/beatui/src/components/json-structure/validation/error-transform.ts
- [ ] T011 Implement generic control dispatcher in packages/beatui/src/components/json-structure/controls/generic-control.ts
- [ ] T012 Create base component styles in packages/beatui/src/styles/layers/03.components/json-structure.css

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Render Primitive Type Fields (Priority: P1) 🎯 MVP

**Goal**: Render appropriate form controls for all primitive types (string, boolean, integers, decimals, uuid, date/time, uri)

**Independent Test**: Provide a JSON Structure schema with primitive properties and verify each renders with the correct input type

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement string control in packages/beatui/src/components/json-structure/controls/string-control.ts
- [ ] T014 [P] [US1] Implement boolean control in packages/beatui/src/components/json-structure/controls/boolean-control.ts
- [ ] T015 [P] [US1] Implement integer control with BigInt support in packages/beatui/src/components/json-structure/controls/integer-control.ts
- [ ] T016 [P] [US1] Implement decimal/double/float control in packages/beatui/src/components/json-structure/controls/decimal-control.ts
- [ ] T017 [P] [US1] Implement uuid control in packages/beatui/src/components/json-structure/controls/uuid-control.ts
- [ ] T018 [P] [US1] Implement temporal controls (date, datetime, time, duration) in packages/beatui/src/components/json-structure/controls/temporal-control.ts
- [ ] T019 [P] [US1] Implement uri control in packages/beatui/src/components/json-structure/controls/uri-control.ts
- [ ] T020 [P] [US1] Implement binary control in packages/beatui/src/components/json-structure/controls/binary-control.ts
- [ ] T021 [US1] Implement any type fallback control in packages/beatui/src/components/json-structure/controls/any-control.ts
- [ ] T022 [US1] Wire all primitive controls into generic-control dispatcher in packages/beatui/src/components/json-structure/controls/generic-control.ts

**Checkpoint**: User Story 1 complete - all primitive types render correctly

---

## Phase 4: User Story 2 - Render Object Structures (Priority: P1)

**Goal**: Render nested object types with properties, required fields, and additionalProperties support

**Independent Test**: Provide schema with object type containing multiple properties and verify all fields render with proper grouping

### Implementation for User Story 2

- [ ] T023 [US2] Implement object control in packages/beatui/src/components/json-structure/controls/object-control.ts
- [ ] T024 [US2] Add required field visual distinction and validation to object-control.ts
- [ ] T025 [US2] Add nested object support with visual hierarchy to object-control.ts
- [ ] T026 [US2] Add additionalProperties support (add custom key-value pairs) to object-control.ts
- [ ] T027 [US2] Wire object control into generic-control dispatcher in packages/beatui/src/components/json-structure/controls/generic-control.ts

**Checkpoint**: User Story 2 complete - objects with nesting render correctly

---

## Phase 5: User Story 8 - Apply Validation Constraints (Priority: P1)

**Goal**: Apply validation constraints from JSON Structure Validation extension with immediate feedback

**Independent Test**: Provide schemas with validation constraints and verify errors display for invalid input

### Implementation for User Story 8

- [ ] T028 [US8] Implement main form component with validation integration in packages/beatui/src/components/json-structure/json-structure-form.ts
- [ ] T029 [US8] Add minLength/maxLength validation display to string-control.ts
- [ ] T030 [US8] Add pattern validation display to string-control.ts
- [ ] T031 [US8] Add format validation display to string-control.ts
- [ ] T032 [US8] Add minimum/maximum validation display to integer-control.ts and decimal-control.ts
- [ ] T033 [US8] Add user-friendly error message formatting in packages/beatui/src/components/json-structure/validation/error-transform.ts
- [ ] T034 [US8] Export JSONStructureForm from module entry points

**Checkpoint**: User Story 8 complete - validation works with user-friendly errors

---

## Phase 6: User Story 3 - Render Collection Types (Priority: P2)

**Goal**: Render array, set, and map collection types with add/remove/edit capabilities

**Independent Test**: Provide schemas with array/set/map types and verify users can add, edit, and remove items

### Implementation for User Story 3

- [ ] T035 [P] [US3] Implement array control in packages/beatui/src/components/json-structure/controls/array-control.ts
- [ ] T036 [P] [US3] Implement set control with uniqueness validation in packages/beatui/src/components/json-structure/controls/set-control.ts
- [ ] T037 [P] [US3] Implement map control (key-value pairs) in packages/beatui/src/components/json-structure/controls/map-control.ts
- [ ] T038 [US3] Add minItems/maxItems constraint enforcement to array-control.ts and set-control.ts
- [ ] T039 [US3] Wire collection controls into generic-control dispatcher

**Checkpoint**: User Story 3 complete - collections work with add/remove/edit

---

## Phase 7: User Story 4 - Render Tuple Types (Priority: P2)

**Goal**: Render tuple types with fixed-length ordered elements

**Independent Test**: Provide tuple schema and verify correct number of fields render with position-specific types

### Implementation for User Story 4

- [ ] T040 [US4] Implement tuple control in packages/beatui/src/components/json-structure/controls/tuple-control.ts
- [ ] T041 [US4] Add tuple serialization to JSON array in correct order
- [ ] T042 [US4] Wire tuple control into generic-control dispatcher

**Checkpoint**: User Story 4 complete - tuples render in specified order

---

## Phase 8: User Story 5 - Render Enum and Const Values (Priority: P2)

**Goal**: Render selection controls for enums and display-only fields for const values

**Independent Test**: Provide schema with enum/const keywords and verify select control or static display renders

### Implementation for User Story 5

- [ ] T043 [US5] Implement enum and const controls in packages/beatui/src/components/json-structure/controls/enum-const-controls.ts
- [ ] T044 [US5] Wire enum/const controls into generic-control dispatcher

**Checkpoint**: User Story 5 complete - enums selectable, const values displayed

---

## Phase 9: User Story 6 - Render Choice Types (Priority: P2)

**Goal**: Render discriminated union controls for choice types

**Independent Test**: Provide choice schema and verify users can select between options and see appropriate fields

### Implementation for User Story 6

- [ ] T045 [US6] Implement choice control in packages/beatui/src/components/json-structure/controls/choice-control.ts
- [ ] T046 [US6] Add selector/discriminator property support to choice-control.ts
- [ ] T047 [US6] Add tagged union serialization (choice name as key)
- [ ] T048 [US6] Wire choice control into generic-control dispatcher

**Checkpoint**: User Story 6 complete - choice types work with discriminated selection

---

## Phase 10: User Story 12 - Support Schema References (Priority: P2)

**Goal**: Resolve $ref references within schemas

**Independent Test**: Provide schema with $ref references and verify referenced types render correctly

### Implementation for User Story 12

- [ ] T049 [US12] Integrate $ref resolution into generic-control dispatcher
- [ ] T050 [US12] Add nested reference resolution support
- [ ] T051 [US12] Add circular reference detection and graceful handling

**Checkpoint**: User Story 12 complete - $ref references resolve correctly

---

## Phase 11: User Story 9 - Support Custom Widget Registration (Priority: P2)

**Goal**: Allow custom widgets to override default rendering

**Independent Test**: Register a custom widget and verify it renders instead of the default

### Implementation for User Story 9

- [ ] T052 [P] [US9] Implement widget registry in packages/beatui/src/components/json-structure/widgets/widget-registry.ts
- [ ] T053 [P] [US9] Implement widget resolution utilities in packages/beatui/src/components/json-structure/widgets/widget-utils.ts
- [ ] T054 [US9] Implement default widget mappings in packages/beatui/src/components/json-structure/widgets/default-widgets.ts
- [ ] T055 [US9] Integrate widget resolution into generic-control dispatcher
- [ ] T056 [US9] Add form-scoped registry precedence over global registry
- [ ] T057 [US9] Export widget registration helpers (forType, forFormat) from module entry points

**Checkpoint**: User Story 9 complete - custom widgets can override defaults

---

## Phase 12: User Story 7 - Render Union Types (Priority: P3)

**Goal**: Handle non-discriminated union types

**Independent Test**: Provide union type schema and verify form handles multiple possible types

### Implementation for User Story 7

- [ ] T058 [US7] Implement union control in packages/beatui/src/components/json-structure/controls/union-control.ts
- [ ] T059 [US7] Add nullable union support (["string", "null"])
- [ ] T060 [US7] Wire union control into generic-control dispatcher

**Checkpoint**: User Story 7 complete - union types handled

---

## Phase 13: User Story 10 - Display Schema Metadata (Priority: P3)

**Goal**: Display descriptions, examples, altnames, and deprecation indicators

**Independent Test**: Provide schema with metadata and verify it displays in the form

### Implementation for User Story 10

- [ ] T061 [US10] Add description display as help text to all controls
- [ ] T062 [US10] Add examples display as placeholder/hint text to applicable controls
- [ ] T063 [US10] Add altnames/locale support to StructureContext label resolution
- [ ] T064 [US10] Add deprecation indicator styling to deprecated fields

**Checkpoint**: User Story 10 complete - metadata displays correctly

---

## Phase 14: User Story 11 - Handle Type Inheritance (Priority: P3)

**Goal**: Resolve $extends inheritance and merge base type properties

**Independent Test**: Provide schema with $extends and verify all inherited properties render

### Implementation for User Story 11

- [ ] T065 [US11] Integrate $extends resolution into generic-control for objects
- [ ] T066 [US11] Add multi-level inheritance support
- [ ] T067 [US11] Add property conflict resolution (derived takes precedence)

**Checkpoint**: User Story 11 complete - inheritance works correctly

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T068 [P] Add read-only mode support to all controls (FR-024)
- [ ] T069 [P] Add component CSS refinements in packages/beatui/src/styles/layers/03.components/json-structure.css
- [ ] T070 Verify all exports in packages/beatui/src/json-structure/index.ts
- [ ] T071 Verify all exports in packages/beatui/src/components/json-structure/index.ts
- [ ] T072 Run quickstart.md validation - verify code examples work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Primitives), US2 (Objects), US8 (Validation) are P1 - do first
  - US3, US4, US5, US6, US9, US12 are P2 - do after P1 stories
  - US7, US10, US11 are P3 - do last
- **Polish (Phase 15)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Priority | Can Start After | Dependencies |
|-------|----------|-----------------|--------------|
| US1 (Primitives) | P1 | Foundational | None |
| US2 (Objects) | P1 | Foundational | None |
| US8 (Validation) | P1 | US1, US2 | Needs controls to validate |
| US3 (Collections) | P2 | US1 | Uses primitive controls |
| US4 (Tuple) | P2 | US1 | Uses primitive controls |
| US5 (Enum/Const) | P2 | Foundational | None |
| US6 (Choice) | P2 | US1, US2 | Uses primitive/object controls |
| US12 ($ref) | P2 | Foundational | $ref utils already done |
| US9 (Widgets) | P2 | US1 | Needs controls to customize |
| US7 (Union) | P3 | US1 | Uses primitive controls |
| US10 (Metadata) | P3 | US1 | Needs controls for decoration |
| US11 ($extends) | P3 | US2 | Needs object control |

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:
- **Phase 1**: T002, T003, T004 in parallel
- **Phase 2**: T007, T008, T010 in parallel
- **US1**: T013-T020 all in parallel (different primitive controls)
- **US3**: T035, T036, T037 in parallel (different collection types)
- **US9**: T052, T053 in parallel (registry and utils)

---

## Parallel Example: User Story 1 (Primitives)

```bash
# Launch all primitive controls in parallel:
Task: "Implement string control in packages/beatui/src/components/json-structure/controls/string-control.ts"
Task: "Implement boolean control in packages/beatui/src/components/json-structure/controls/boolean-control.ts"
Task: "Implement integer control with BigInt support in packages/beatui/src/components/json-structure/controls/integer-control.ts"
Task: "Implement decimal/double/float control in packages/beatui/src/components/json-structure/controls/decimal-control.ts"
Task: "Implement uuid control in packages/beatui/src/components/json-structure/controls/uuid-control.ts"
Task: "Implement temporal controls in packages/beatui/src/components/json-structure/controls/temporal-control.ts"
Task: "Implement uri control in packages/beatui/src/components/json-structure/controls/uri-control.ts"
Task: "Implement binary control in packages/beatui/src/components/json-structure/controls/binary-control.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 8 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Primitives)
4. Complete Phase 4: User Story 2 (Objects)
5. Complete Phase 5: User Story 8 (Validation)
6. **STOP and VALIDATE**: Forms render primitives + objects with validation
7. Deploy/demo if ready - this is a working MVP!

### Incremental Delivery

1. **MVP**: Setup + Foundational + US1 + US2 + US8 → Basic forms work
2. **+Collections**: US3 + US4 → Arrays, sets, maps, tuples
3. **+Selection**: US5 + US6 → Enums, const, choice types
4. **+Schema Features**: US12 + US9 → $ref, custom widgets
5. **+Polish**: US7 + US10 + US11 → Union types, metadata, inheritance
6. **Final**: Phase 15 → Read-only mode, final polish

---

## Notes

- [P] tasks = different files, no dependencies within that group
- [Story] label maps task to specific user story for traceability
- Reuse existing BeatUI components: InputWrapper, TextInput, NumberInput, DateInput, Select, Checkbox, etc.
- Follow patterns from existing JSON Schema implementation in packages/beatui/src/components/json-schema/
- All new controls go in packages/beatui/src/components/json-structure/controls/
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

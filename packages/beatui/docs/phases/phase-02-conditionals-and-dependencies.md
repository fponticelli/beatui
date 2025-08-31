# Phase 2 — Conditionals and Dependencies

Actionable TODOs to implement `if/then/else`, dependentRequired, and dependentSchemas behavior in both rendering and validation hints.

- [x] Implement schema overlays for `if/then/else`
  - Add a function in `packages/beatui/src/components/json-schema/schema-context.ts` that evaluates the `if` subschema against the current node value (using AJV) and produces an overlay schema from `then` or `else` without mutating the base schema.
  - Compose overlays just-in-time for rendering and required markers; ensure disposal when conditions change to avoid stale controllers.

- [x] Render dynamic required markers and UI from overlays
  - Update object/field controls in `packages/beatui/src/components/json-schema/controls.ts` to read required fields from the composed base+overlay effective schema and show the required asterisk, as well as disable submit when unmet.

- [x] Support `dependentRequired`
  - When key K is present on an object, mark the listed dependent keys as required in the effective schema and surface UI feedback accordingly.
  - Ensure this composes with conditionals and allOf merges.

- [x] Support `dependentSchemas` (and Draft-07 `dependencies`)
  - When key K is present on an object, merge the corresponding dependent subschema into the effective schema (using the same deep-merge rules as `allOf`).
  - Provide backward-compatibility for Draft-07 `dependencies` by translating it into `dependentRequired`/`dependentSchemas` behavior at runtime.

- [x] Add tests for conditionals and dependencies
  - Create unit tests under `packages/beatui/tests/unit/` covering: toggling values that flip `if/then/else`, dependentRequired activation/deactivation, and dependentSchemas overlay effects on required, properties, and constraints.


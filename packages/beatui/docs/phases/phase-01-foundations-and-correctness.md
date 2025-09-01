# Phase 1 — Foundations and Correctness

Actionable TODOs for implementing robust baseline behavior across primitives, unions, enums/const, and nullability.

- [x] Implement `JSONSchemaUnion` control to handle `type: [...]` unions
  - Add a dedicated union resolver in `packages/beatui/src/components/json-schema/controls.ts` that, given a schema with `type: [ ... ]`, selects an active variant based on the current value’s type or `x:ui.unionDefault` when unset.
  - Render a branch selector UI (segmented/radio/select depending on option count) to allow users to switch variants when multiple are valid; persist the last manual selection per JSON Pointer path.
  - On branch change, attempt value conversion (e.g., `"1"` → `1` for number) and validate; if not convertible, clear with a confirmation gate when `x:ui.confirmBranchChange` is true.
  - Ensure union behavior composes with `$ref` by resolving the referenced schema before union detection (use `packages/beatui/src/components/json-schema/ref-utils.ts`).

- [x] Wire oneOf/anyOf selection mechanics (initial baseline)
  - In `controls.ts` and/or `schema-context.ts`, add helpers to validate the current value against each `oneOf`/`anyOf` branch using AJV (via `packages/beatui/src/components/json-schema/ajv-utils.ts`).
  - Auto-select a single matching `oneOf` branch; when none or multiple match, require explicit selection and label options using `title` or `x:ui.oneOfLabels`.
  - For `anyOf`, allow manual selection when multiple branches validate; preserve stability of the chosen branch across edits.

- [x] Implement `allOf` merge strategy for effective rendering schema
  - Add a pure function in `packages/beatui/src/components/json-schema/schema-context.ts` to deep-merge `allOf` branches: intersect types, union `required`, deep-merge `properties`, and detect conflicts; surface conflicts as non-blocking schema errors exposed to the UI.
  - Ensure the merged view is used by the control resolver prior to rendering.

- [x] Visualize `not` violations in the UI
  - Evaluate the `not` subschema for the current node; when the value matches, render a contextual error banner “Value matches disallowed schema” near the control.

- [x] Extend AJV initialization to accept `x:ui` vendor extension
  - Update `packages/beatui/src/components/json-schema/json-schema-form.ts` (or `ajv-utils.ts`) to register a no-op keyword for `x:ui` or disable strict schema for unknown keywords; ensure both string and object shapes are accepted.
  - Document `x:ui` shape in code comments: string for canonical widget, or object `{ format: string, ...options }` including container layouts.

- [x] Map `enum`/`const` to appropriate widgets with labels
  - In `controls.ts` and `widgets/string-controls.ts`, implement generic mapping for scalar enums to radio/segmented/select depending on option count, and for arrays of enums to multi-select/tags.
  - Support optional label mapping from `x:ui.labels` (array aligned to `enum` or key/value map) and fall back to stringification.
  - Render `const` as a non-editable display field with the const value; optionally hide the input chrome.

- [x] Establish optionality and nullability behavior across inputs
  - For object properties, treat “optional” as “key absent” rather than `null`; add a presence toggle or clear action that removes the key for optional fields.
  - Only render a null toggle when the schema allows `null` (union includes `"null"`, OpenAPI `nullable: true`, or `enum` includes `null`).
  - Update string/number/boolean widgets to use non-nullable controls by default; add explicit null/presence toggles where applicable.

- [x] Add unit coverage for unions, enums/const, and nullability
  - Write focused tests under `packages/beatui/tests/unit/` covering: union branch selection and persistence, enum label mapping, const display, and required vs optional presence toggles.

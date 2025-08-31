# Phase 3 — Objects and Properties Breadth

Actionable TODOs to implement additional/pattern properties, evaluated property semantics, and readOnly/writeOnly/deprecated behaviors.

- [x] Implement add/remove UI for `additionalProperties`
  - In `packages/beatui/src/components/json-schema/controls.ts`, add affordances on object controls to add arbitrary properties when `additionalProperties` is true.
  - When `additionalProperties` is a schema, use it to render newly added keys; allow deleting these keys; enforce `minProperties`/`maxProperties` in controls state.

- [x] Implement `patternProperties` and `propertyNames` enforcement
  - Provide a key editor with inline validation against declared patterns and `propertyNames` constraints; block save while invalid.
  - Show allowed pattern hints and examples; support `x:ui.lockKeyAfterSet` to prevent accidental key renames after a value is entered.

- [x] Implement 2019-09/2020-12 `unevaluatedProperties` semantics
  - Track evaluated properties using AJV evaluation results (combine effects of `properties`, `patternProperties`, `additionalProperties`, `allOf`, `if/then/else`, `dependentSchemas`).
  - If `unevaluatedProperties: false`, hide or disable the “add property” affordance for keys not covered by evaluated keywords and show an explanatory tooltip.
  - If `unevaluatedProperties` is a schema, apply it to unevaluated keys only.

- [x] Support readOnly / writeOnly / deprecated annotations
  - When `readOnly` is true, render inputs disabled (unless overridden by `x:ui.ignoreReadOnly`).
  - When `writeOnly` is true, hide in display/read modes; optionally show with warning when `x:ui.showWriteOnly`.
  - When `deprecated` is true, show a visual badge and optionally disable input; document behavior in inline help.

- [x] Tests for object/property breadth
  - Add unit tests under `packages/beatui/tests/unit/` for: adding/removing additional properties, pattern validation of keys, `unevaluatedProperties` behavior, and readOnly/writeOnly/deprecated rendering changes.


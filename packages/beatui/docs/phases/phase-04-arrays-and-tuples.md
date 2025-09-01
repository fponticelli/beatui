# Phase 4 — Arrays and Tuples Breadth

Actionable TODOs to implement tuple arrays, contains semantics, and array constraints in the UI.

- [x] Implement tuple array rendering for Draft-07 and 2020-12
  - Detect Draft-07 tuple form via `items: [ ... ]` with `additionalItems`; detect 2020-12 via `prefixItems: [ ... ]` with `items` tail.
  - Render per-index widgets based on each tuple schema; show optional per-index headers from `title` or `x:ui.tupleLabels`.
  - For overflow items, use `additionalItems` (D7) or tail `items` (2020-12); disable add when overflow disallowed.

- [x] Enforce `minItems`, `maxItems`, and `uniqueItems`
  - Enable/disable add/remove/move buttons based on `minItems`/`maxItems`.
  - For `uniqueItems: true`, block duplicate entries or surface clear errors with duplicate indicators.

- [x] Implement `contains` + `minContains`/`maxContains`
  - Validate and highlight items that match the `contains` subschema; show a count and helper text “Must contain at least N item(s) matching X”.
  - Prevent submit until `minContains` is satisfied; flag `maxContains` violations with clear guidance.

- [x] Tests for arrays/tuples/contains
  - Add unit tests under `packages/beatui/tests/unit/` for: tuple indexing, tail handling, min/max items enforcement, uniqueItems detection, contains counts and highlighting.

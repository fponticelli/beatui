# Phase 6 — References and Composition Depth

Actionable TODOs to extend `$ref` support beyond in-document references and ensure composition across refs is correct.

- [x] Provide a strategy for external `$ref` resolution
  - Add an optional `refResolver` input to the JSON Schema form API (e.g., in `packages/beatui/src/components/json-schema/json-schema-form.ts`) that accepts pre-loaded external schemas and registers them with AJV via `addSchema`.
  - Support both usage modes: callers pass already-bundled schemas, or pass a resolver that preloads and registers all external `$id`s before rendering.

- [x] Cache compiled validators and resolved refs
  - In `packages/beatui/src/components/json-schema/ajv-utils.ts` and `ref-utils.ts`, cache compiled validators by JSON Pointer / `$id` and memoize `$ref` resolutions; include cycle detection and clear error messaging on resolution failures.

- [x] Preserve sibling keyword semantics when a node uses `$ref`
  - Ensure the current in-document `$ref` merge behavior (sibling keywords merged with the referenced schema) is used uniformly, including within unions and combinators, before branching on `type`.

- [ ] Validate `allOf`/`oneOf` across referenced schemas
  - Verify deep-merge behavior for `allOf` where branches reference external schemas; surface conflicts with actionable error text.
  - For `oneOf` across refs, ensure branch detection and selection behave identically to inlined schemas.

- [x] Tests for external refs and composition
  - Add unit tests under `packages/beatui/tests/unit/` that load small external schemas to verify: `$ref` resolution, sibling keyword merges, allOf deep merge across refs, and oneOf branch detection with referenced branches.

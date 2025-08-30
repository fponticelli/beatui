# Phase 8 — Testing, Performance, Polish

Actionable TODOs to harden quality via tests, improve performance, and complete documentation.

- [ ] Build a comprehensive unit test suite
  - Add per-keyword family tests under `packages/beatui/tests/unit/` for enums/const, unions, composition (allOf/anyOf/oneOf/not), conditionals, additional/pattern/unevaluated properties, arrays (tuple/contains), formats, and annotations.
  - Verify AJV→Controller error path mapping for common errors (required, additionalProperties, contains, oneOf mismatch).

- [ ] Add integration tests for representative complex schemas
  - Create deeply nested schemas exercising oneOf + dependencies + arrays; snapshot rendered tree and validate interactions: switching branches, adding/removing items/properties, toggling nullable.

- [ ] Caching and performance improvements
  - Cache compiled AJV validators per subschema and memoize `$ref` resolutions by pointer/`$id` in `ajv-utils.ts`/`ref-utils.ts`.
  - Memoize widget resolution per `SchemaContext` key; debounce validations while typing and batch recomputations to animation frames.

- [ ] Documentation pass
  - Author or update README/docs explaining configuration, `x:ui` options (including container layouts), extension points, and advanced usage with examples.
  - Ensure accessibility notes and internationalization hooks are documented and reflected in examples.


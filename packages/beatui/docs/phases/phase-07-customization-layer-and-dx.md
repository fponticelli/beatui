# Phase 7 — Customization Layer and DX

Actionable TODOs to finalize the `x:ui` customization API, add container layouts, and expose extension points.

- [ ] Do not allow invalid content in the data payload
  - When the payload contains value that are not allowed by the schema, automatically remove the invalid data from the payload. For example additional properties when `additionalProperties` is false should be removed immediately (or ignored if preferable).

- [ ] Implement unified `x:ui` parsing and precedence
  - Update the widget resolver (in `packages/beatui/src/components/json-schema/controls.ts` and `widgets/utils.ts`) to accept `x:ui` as either a string or object `{ format, ...options }` and compute the effective widget selection.
  - Apply precedence: explicit `x:ui` > schema annotations/format/media cues > constraints > heuristics > type fallback.

- [ ] Add container layouts via object-level `x:ui`
  - Support container formats: `fieldset`, `tabs`, `accordion`, `group`, `grid` by setting `x:ui.format` at object nodes.
  - Implement layout options: `order` (array or keyed object), `groups` (array of `{ label, fields }`), and responsive `cols` (e.g., `{ base, sm, md, lg }`).
  - Ensure container layout does not override each child’s own `x:ui` selection; only organizes children.

- [ ] Visibility and discriminator options without extra keywords
  - Add `x:ui.visibleIf` evaluation for simple visibility rules referencing sibling fields; hide/unmount nodes accordingly.
  - Prefer OpenAPI `discriminator` when present; otherwise support `x:ui.discriminatorKey` on combinator nodes for `oneOf` selection.

- [ ] Public plugin/registry API
  - Expose a registry for custom widget resolvers and component mappings (e.g., export from `packages/beatui/src/components/json-schema/index.ts`).
  - Allow a resolver hook signature like `(ctx) => ({ name, options })` to override widget selection; document types and examples.

- [ ] Developer documentation and examples
  - Create documentation pages/examples demonstrating `x:ui` string vs object usage, container layouts, visibility rules, discriminator key, and custom widget registration.


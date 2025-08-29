# JSON Schema Control — End‑to‑End Implementation Plan (Draft-07 → 2020‑12)

This document lays out a detailed, sequenced plan to complete `JSONSchemaControl` so it can render and validate forms for JSON Schema definitions from Draft-07 onward (including 2019‑09 and 2020‑12), with robust UI heuristics and a powerful `ui:widget` customization layer. It is based on a deep read of the current implementation.

Key files reviewed:

- packages/beatui/src/components/json-schema/json-schema-form.ts:1
- packages/beatui/src/components/json-schema/controls.ts:1
- packages/beatui/src/components/json-schema/schema-context.ts:1
- packages/beatui/src/components/json-schema/ref-utils.ts:1
- packages/beatui/src/components/json-schema/widgets/string-controls.ts:1
- packages/beatui/src/components/json-schema/widgets/string-detection.ts:1
- packages/beatui/src/components/json-schema/widgets/utils.ts:1
- packages/beatui/src/components/json-schema/ajv-utils.ts:1
- packages/beatui/src/components/json-schema/validator.ts:1

## 1) Current State Assessment (What Works / What’s Missing)

Working now (verified in code):

- Core setup
  - AJV integration with `ajv-formats`, and registering `ui:widget` as vendor keyword for acceptance. json-schema-form.ts:1
  - Controllers and wrappers to render inputs with consistent label/description/error. form/control and form/input
- Primitive types
  - string: Format detection with heuristics and `ui:widget` override. widgets/string-controls.ts:1, string-detection.ts:1
  - number, integer: Basic constraints wired (min/max/multipleOf → step). controls.ts:102
  - boolean: Checkbox rendered. controls.ts:146
  - null: Writes `null` immediately. controls.ts:166
- Containers
  - object: Renders properties; respects `required`; shows label/title; basic nesting. controls.ts:185
  - array: Renders list with add/remove/move; supports tuple vs single schema via `items` union check; hooks into object/any generics per item. controls.ts:126
- Reference resolution
  - In‑document `$ref` resolution with sibling keyword merge and cycle guard. ref-utils.ts:1
- Validation plumbing
  - Per‑field error mapping and Ajv issue → controller path mapping. ajv-utils.ts:1, validator.ts:1

Missing or incomplete:

- Union/any: `JSONSchemaUnion` is not implemented; `JSONSchemaAny` only defaults to a weak union. controls.ts:211
- Composition keywords: `oneOf`, `anyOf`, `allOf`, `not` not handled in UI (no selection, no merging). schema-context.ts defines getters, but `oneOf` incorrectly returns `anyOf`. schema-context.ts:41
- Conditional keywords: `if`/`then`/`else`, `dependentSchemas`, `dependentRequired` not wired to dynamic UI.
- 2019‑09/2020‑12 semantics: `unevaluatedProperties`, `unevaluatedItems`, `contains` + `minContains`/`maxContains`, `prefixItems` vs `items` not reflected in rendering logic.
- Enumerations/const: No generic enum→select/radio mapping; no multi‑select for arrays of enums; no enum label mapping.
- Additional/pattern properties: No UI for creating arbitrary properties when allowed; no `propertyNames` enforcement in UI.
- Formats/annotations: Many formats not mapped to widgets (uri/url, hostname, ipv4/ipv6, regex, duration, color, etc.). Some inputs exist in BeatUI but are not hooked up yet.
- Read-only/write-only/deprecated: Not surfaced to UI visibility/disabled logic.
- `$ref` scope: Only in‑document refs; no external/remote/bundled ref strategy.
- Vendor `ui:*` keywords: Only `ui:widget` added to AJV; no broader allowance for `ui:options`, `ui:order`, etc. Strict AJV may warn.
- Array tuple controls: No explicit support for 2020‑12 `prefixItems` and `items` interplay; minimal affordances for minItems/maxItems/uniqueItems beyond ListControl behavior.

## 2) Target Coverage Scope (Draft‑07 → 2020‑12)

We aim to support across drafts:

- Validation keywords: type, enum, const, multipleOf, maximum/minimum (+ exclusive), maxLength/minLength, pattern, items/additionalItems (D7), prefixItems/items (2020‑12), contains/minContains/maxContains, maxItems/minItems/uniqueItems, maxProperties/minProperties, required, propertyNames, additionalProperties, patternProperties.
- Composition: allOf, anyOf, oneOf, not.
- Conditionals: if, then, else; dependentRequired; dependentSchemas.
- Annotations: title, description, default, examples, deprecated, readOnly/writeOnly; contentEncoding/contentMediaType.
- References: $ref (in‑document; plan a strategy for external).
- 2019‑09/2020‑12: unevaluatedProperties/unevaluatedItems semantics; format refinements.

Note: OpenAPI extensions used in repo (e.g., `nullable`) are respected as a convenience.

## 3) Phased Roadmap (Sequenced Tasks)

Phase 1 — Foundations and correctness:

1. Fix existing context/composition bugs and wire baselines
   - Implement `JSONSchemaUnion` to handle `type: [..]` and general union display.
   - Extend AJV instance to accept planned `ui:*` vendors (`ui:options`, `ui:order`, etc.), or configure strictness appropriately.
2. Enum and const handling
   - Map enum/const to proper widgets for strings/numbers/booleans and arrays of enums (single/multi select, radio, segmented).
   - Add label mapping capability (e.g., `ui:enumLabels` or `ui:options.enumLabels`).
3. Basic composition support
   - AnyOf/OneOf branch selection UI with AJV‑driven auto‑match and manual override when ambiguous.
   - AllOf merge strategy for annotations and constraints; detect conflicts and surface errors.
   - Not: visualize disallowed branch feedback.

Phase 2 — Conditionals and dependencies:

4. `if`/`then`/`else`
   - Live evaluate condition per current value; apply `then`/`else` schema overlays to active branch of the UI.
5. Dependencies
   - `dependentRequired`: dynamically mark fields required; show errors inline.
   - `dependentSchemas`: apply extra subschema when the key is present.

Phase 3 — Objects and properties breadth:

6. Additional/pattern properties
   - UI affordances to add arbitrary properties when allowed; guided by `additionalProperties` schema.
   - Respect `patternProperties` and `propertyNames` constraints; show inline validation for key names.
7. Unevaluated properties (2019‑09/2020‑12)
   - Track evaluated properties via AJV; disable or visually flag unevaluated property creation as needed.

Phase 4 — Arrays and tuples breadth:

8. Arrays
   - Explicit support for tuple validation: Draft‑07 `items: []` + `additionalItems`; 2020‑12 `prefixItems` + `items`.
   - `contains` + `minContains`/`maxContains`: validate and visually indicate requirements; assistive hints.
   - Enforce minItems/maxItems/uniqueItems in add/move/remove affordances.

Phase 5 — Formats and advanced widgets:

9. Formats and media
   - Map remaining common formats: uri/url, uri‑reference, regex, hostname, ipv4/ipv6, duration, color, country‑code, language‑tag, etc.
   - Use `contentMediaType` + `contentEncoding` to select binary/file widgets.
10. Accessibility & annotations

- Support readOnly/writeOnly, deprecated; surface through disabled/hidden state with overrides.
- Titles/descriptions/placeholders/examples consistently rendered; placeholder heuristics existing in controls.ts extended across types.

Phase 6 — References and composition depth:

11. `$ref` enhancement

- Strategy for external refs: bundle or provide a resolver; caching compiled subschemas; cycle and resolution errors surfaced.

12. AllOf/oneOf across refs

- Ensure sibling keywords vs $ref merge semantics are preserved (already partly done for in‑doc refs).

Phase 7 — Customization layer and DX:

13. `ui:widget` schema and options

- Define canonical widget names per type and support `ui:widget` object inline options via `{ format, ... }`; document precedence and merge behavior with `ui:options`.
- Add layout and grouping extensions: `ui:order`, `ui:group`, `ui:fieldset`, `ui:tabs`, `ui:accordion`, `ui:cols`.

14. Plugin/registry

- Allow registering custom widget resolvers and components; expose extension points.

Phase 8 — Testing, performance, polish:

15. Test suite

- Unit tests per keyword family; integration tests for composition/conditionals; snapshot tests of rendered trees.

16. Perf & caching

- Cache compiled AJV validators per subschema; memoize branch detection; debounce expensive re‑eval.

17. Documentation

- Author comprehensive README covering configuration, examples, and extension APIs.

## 4) Detailed Implementation Tasks and Requirements

Below are actionable checklists for each area. No code included; this lists requirements and acceptance criteria.

### 4.1 Unions and Composition

- Type unions (`type: ["string", "null", ...]`)
  - Implement `JSONSchemaUnion` to choose a variant:
    - Auto‑select on current value type; if ambiguous (empty/undefined), pick a default branch (via `ui:options.unionDefault` or first non‑null type).
    - Render a branch selector when more than one viable variant exists; selector widgets: segmented/radio/select depending on count; allow `ui:widget: 'segmented'|'radio'|'select'` override.
    - Preserve value on branch switch if convertible and valid; otherwise, clear with confirmation if `ui:options.confirmBranchChange`.
- anyOf/oneOf
  - Detection: Use AJV to validate the current value against each subschema; count matches.
  - anyOf: render as a list of matching candidates; allow manual selection when multiple match; prefer a stable choice across edits; optionally skip selection UI if only one matches.
  - oneOf: if exactly one matches, auto‑select; if none or multiple match, show explicit selection required with per‑option label (use `title`, `discriminator`, or `ui:options.oneOfLabels`).
  - Option labelling: Prefer `title`; fall back to a compact schema summary; allow `ui:options.labels` keyed by index.
  - Option rendering: Defer nested form rendering to selected branch; keep hidden branches unmounted or parked depending on `ui:options.preserveUnmounted`.
- allOf
  - Merge strategy: Deep merge constraints; intersect validations; merge annotations carefully:
    - `type`: intersect or reduce; detect conflicts (e.g., string ∧ number) → show schema error banner.
    - `properties`, `required`: union `required`, deep merge `properties` (conflicts resolved by later schemas or fail with error based on `ui:options.allOfConflict` policy: 'lastWins'|'error').
  - Render: One integrated form reflecting merged schema; rely on AJV runtime validation for edge cases and show errors.
- not
  - Evaluate with AJV; if violated, show error “Value matches disallowed schema” near offending node; optionally show hint from `title` of the `not` branch.
- Composition UX
  - Change events recompute branch selection in a debounced manner.
  - Persist last user selection per widget path to avoid flicker when multiple branches validate.

### 4.2 Conditionals and Dependencies

- if/then/else
  - Evaluate `if` against current value via AJV; apply an overlay of `then` or `else` subschema to the active branch (for both rendering and validation hints such as required fields).
  - UI overlay precedence: overlays do not mutate the base schema; rendering context composes overlays just‑in‑time.
  - Ensure disposal when switching branches (controllers are already disposable).
- dependentRequired
  - When key K is present, mark the listed dependent keys as required; update labels (required asterisk) and disable submit until resolved.
- dependentSchemas
  - When key K is present, apply the dependent subschema overlay (merge like `allOf` rules) to the active branch.
- property dependencies (Draft‑07 `dependencies`)
  - Back‑compat: support both `dependencies` and the 2019‑09 split (`dependentRequired`/`dependentSchemas`).

### 4.3 Objects and Properties

- Required/optional
  - Already supported via `SchemaContext.hasRequiredProperty`; ensure it respects overlays from `if/then/else`, `allOf`, and `dependentRequired`.
- Additional properties
  - If `additionalProperties: true`, allow adding arbitrary keys with a simple key/value editor; value widget defaults to `JSONSchemaAny`.
  - If `additionalProperties` is a schema, render new keys with that schema; store keys in the object value; allow deleting additional keys.
  - Respect `maxProperties`/`minProperties` in add/remove affordances.
- Pattern properties
  - Provide UI to add keys that match a pattern; show hints of allowed patterns; validate keys live against `patternProperties` and `propertyNames`.
  - Key editor: inline editable key with validation; lock once value entered if `ui:options.lockKeyAfterSet`.
- Unevaluated properties (2019‑09/2020‑12)
  - If `unevaluatedProperties: false`, hide “add property” affordance for keys not covered by evaluated keywords; show explanation tooltip.
  - If it’s a schema, treat like `additionalProperties` but only for unevaluated keys.
- ReadOnly/writeOnly/deprecated
  - `readOnly`: disable input and style as read‑only unless `ui:options.ignoreReadOnly`.
  - `writeOnly`: hide in display modes; optionally render with warning if `ui:options.showWriteOnly`.
  - `deprecated`: add visual badge; optional disable.

### 4.4 Arrays and Tuples

- Homogeneous arrays
  - Use `items: { ... }` to render a uniform element widget.
  - Enforce `minItems`/`maxItems` via add/remove buttons enabled state.
  - Enforce `uniqueItems` client‑side by disabling duplicates or surfacing error.
- Tuple validation
  - Draft‑07: `items: [s1, s2, ...]`, with `additionalItems` for overflow.
  - 2020‑12: `prefixItems: [s1, s2, ...]`, with `items` for tail.
  - Render per‑index schema; optional headers for tuple positions from `title` or `ui:options.tupleLabels`.
- contains/minContains/maxContains
  - Provide helper text “Must contain at least N item(s) matching X”; summarize X via `title` or compact description.
  - Highlight matching items; show count indicator; prevent submit until satisfied.

### 4.5 Strings, Numbers, Booleans, Nulls

- Strings
  - Formats to map: `email`, `uri`/`url`, `uri-reference`, `hostname`, `ipv4`, `ipv6`, `uuid` (already), `regex` (editor with validation), `date`, `date-time`, `time`, `duration` (use existing `nullable-duration-input`), `color` (use `ColorInput`), and binary via `contentEncoding`/`contentMediaType`.
  - Heuristic: long fields → textarea; names matching `description|comment|notes|text` already used; expand keyword list via `ui:options.textAreaTriggers`.
  - Nullability: use non-nullable string inputs by default; only use a nullable wrapper when the schema is truly nullable (see Optionality & Nullability Strategy).
- Numbers/Integers
  - Support sliders (`ui:widget: 'slider'`) when bounded and continuous; step from `multipleOf`; integer coerces step to 1.
  - Support steppers (`ui:widget: 'stepper'`), rating (`ui:widget: 'rating'`) when 1..N and small range; currency/percent masks via `ui:options.format`.
- Booleans
  - Map to checkbox by default; allow `ui:widget: 'switch'`.
- Nulls
  - Only render nullable affordances when `null` is permitted (type includes `'null'`, `nullable: true`, `enum`/`const` includes `null`, or via composition). Prefer a presence toggle/null switch rather than overloading empty values.

### 4.6 Enums and Const

- Single‑select for scalars
  - Small set (≤5): radio/segmented based on `ui:widget` or heuristic; else select/combobox.
- Multi‑select arrays of enums
  - Use tags input for strings (chips); use multi‑select for other scalars.
- Labels
  - Support `ui:enumLabels` (array aligned to `enum`) or object map; fall back to stringification.
- Const
  - Render read‑only display with the const value; optionally hide control and show as static text.

### 4.7 `$ref` and Schema Resolution

- In‑document `$ref` is already supported with sibling merge. Ensure this path is used everywhere (including within unions/combinators) before branching on `type`.
- External refs
  - Strategy A: require callers to provide bundled/flattened schemas (recommended).
  - Strategy B: accept a `$refResolver` option that pre‑loads external schemas and registers them in AJV; use `ajv.getSchema` where applicable.
- Caching
  - Cache resolved definitions per `$id`/pointer; detect cycles and surface as schema errors.

### 4.8 2019‑09 and 2020‑12 Additions

- `unevaluatedProperties`/`unevaluatedItems`: reflect in add affordances and hints (see 4.3/4.4).
- `prefixItems` vs `items`: choose tuple vs homogeneous flow accordingly.
- Format refinements: ensure `ajv-formats` is enabled; allow opt‑in strict format validation.

### 4.9 Validation, Errors, and UX

- Keep current AJV→Controller error mapping for path precision; extend for `contains` and branch selection errors with clearer messages.
- Surface schema conflicts (e.g., impossible allOf) as static banner on the form section.
- Debounce revalidation when typing; avoid thrashing branch selection.

### 4.10 Customization Layer: `ui:*` Keywords

Define a conventional set of vendor keys. All should be inert for AJV (ignored by validation). Ensure AJV accepts them by either registering no‑op keywords or relaxing strict mode.

- `ui:widget` (string | object)
  - String: canonical widget name (see per‑type lists below).
  - Object: `{ format: string, ...widgetSpecificOptions }` where `format` is required and the rest are widget‑specific options. Example: `{ format: 'rating', max: 5 }`.
  - If both `ui:widget` (object) and `ui:options` are present, options are merged with `ui:widget` fields taking precedence.
- `ui:options` (object)
  - Generic options and layout preferences. May also include widget options for backward compatibility; merged with `ui:widget` when provided.
    - Common: `placeholder`, `help`, `autofocus`, `disabled`, `readonly`, `hideLabel`, `cols`, `rows`, `variant`, `size`.
    - Layout: `horizontal`, `order` (array of property keys), `group`, `fieldset`, `tabs`, `accordion`, `collapsible`, `collapsibleInitiallyOpen`, `cols` (grid columns per breakpoint).
    - Validation UX: `showRequiredAsterisk`, `showHelperIcons`, `preserveUnmounted`, `confirmBranchChange`.
- `ui:enumLabels` (array|string->label map)
  - Human labels for enums; array parallel to `enum` or object map.
- `ui:visibleIf` (expression or rules)
  - Simple visibility rules referencing sibling fields; evaluated client‑side.
- `ui:discriminator`
  - For oneOf: key path that acts as discriminator; maps discriminator value to branch index.
- `ui:order` (object | array)
  - Objects: order property keys; arrays: explicit ordering with `'*'` wildcard for the rest.

Per‑type `ui:widget` formats and notable inline options (also allowed under `ui:options`):

- string
  - text (default), textarea, password, email, url, uri, regex, uuid, date, date-time, time, duration, color, markdown, binary (file/base64), combobox, tags.
  - Options: `rows`, `mask`, `pattern`, `mediaType`, `accept` (MIME), `maxBytes`, `textAreaTriggers`.
- number/integer
  - number (default), stepper, slider, rating, segmented, currency, percent.
  - Options: `min`, `max`, `step`, `precision`, `prefix`, `suffix`.
- boolean
  - checkbox (default), switch, segmented (Yes/No).
  - Options: `labels` ({ true, false }).
- array
  - list (default), table, tags (for strings), chips, dual-listbox, checklist.
  - Options: `controlsLayout` ('aside'|'below'), `addLabel`, `reorderable`, `uniqueBy`, `minItems`, `maxItems`.
- object
  - group (default), fieldset, accordion, tabs.
  - Options: `order`, `cols`, `groups` (map of key→group), `collapsible`, `collapsibleInitiallyOpen`.
- enum/const
  - radio, segmented, select, combobox, checklist (multi).
  - Options: `enumLabels`, `inline`, `searchable`, `maxInlineOptions`.

Precedence order for widget resolution:

1. Explicit `ui:widget` (object.format or string)
2. Schema annotations/format/media cues (`format`, `contentMediaType`, `contentEncoding`)
3. Schema constraints (enum/const, min/max/step, array uniqueness, tuple vs homogeneous)
4. Heuristics (name/title matches, length bounds)
5. Type fallback

### 4.11 Internationalization and Accessibility

- Use `BeatUII18n` strings for add/move/remove/tooltips (already used in ListControl).
- Ensure radios, segmented, and branch selectors have proper `aria` roles and `aria-describedby` ties to error/help text through InputWrapper.
- Keyboard support for union/oneOf switching, array item movement, and property add dialogs.

### 4.12 Developer Experience

- Public API: export a factory `JSONSchemaForm` that accepts `ajv` instance and widget registry overrides.
- Widget registry: allow registering a resolver `(ctx) => { name, options }` and component mapping for custom names.
- Diagnostics: development mode banners when encountering unsupported keywords; link to docs.

### 4.13 Optionality & Nullability Strategy

Purpose: prevent over‑nullable controls and clearly differentiate “missing” vs “null”.

- Determine optional vs required (object properties)
  - Required properties are listed in `required`. Optional properties are any properties not listed (including those introduced by `allOf`/`if`/`dependent*` overlays).
  - Rendering policy:
    - Required: always present; no “remove/clear” affordance that drops the property.
    - Optional: provide a way to omit the property entirely (unset/undefined), distinct from setting a value.
      - Scalars: show a “Clear” action that removes the key from the parent object (not set to `null` unless nullable).
      - Objects/arrays: show a presence toggle. When off, the property key is absent; when on, insert default or empty value per schema.
- Determine nullability (value may be `null`)
  - A field is nullable if any of the following holds: `type` includes `'null'`; `nullable: true` (OpenAPI extension); `enum` or `const` includes `null`; relevant branch of `anyOf`/`oneOf` permits `null`.
  - Rendering policy:
    - Non‑nullable: inputs must never produce `null`. For scalars, empty UI state maps to “unset” (removed property) when optional, not to `null`.
    - Nullable: show an explicit null affordance (e.g., a “Set to null” switch or a nullable input variant). Toggling to null should disable the nested control and set the value to `null`.
- Mapping rules by type
  - Strings: empty string should map to `undefined` (unset) for optional non‑nullable fields; use nullable text inputs only when nullable.
  - Numbers/integers: no `null` for non‑nullable; provide clear/unset; nullable adds explicit null toggle.
  - Booleans: optional, non‑nullable booleans may use a tri‑state UI (true/false/unset) or a clear button to remove the property; avoid using `null` unless nullable.
  - Arrays/objects: optional properties differentiate “missing” vs empty (`[]`/`{}`). Presence toggle controls the key; within present state, empty value is a valid state distinct from missing.
- Defaults and examples
  - When a user turns on an optional property, seed with `default` if available; otherwise use sensible empty value (e.g., `''`, `0`, `[]`, `{}`) unless it would violate constraints.
  - Do not auto‑seed with `null` unless nullable and explicitly configured.
- Validation & UX
  - Controllers should reflect “unset” via absence in parent object; avoid storing `undefined` for required fields.
  - Error messages must distinguish “missing required property” from invalid null assignment.
  - Clearing a required field should surface a required error rather than silently setting `null`.

## 5) AJV Configuration Strategy

- Base instance
  - `allErrors: true` for rich feedback; keep `ajv-formats` installed. json-schema-form.ts:1
  - Register no‑op vendor keywords: at least `ui:widget`, `ui:options`, `ui:order`, `ui:enumLabels`, `ui:visibleIf`, `ui:discriminator`. For `ui:widget`, accept either a string or an object with a required `format` field (and arbitrary additional option fields). Alternatively, set `strictSchema: false` if acceptable.
- Subschema compilation
  - Pre‑compile validators for each combinator branch (anyOf/oneOf/allOf/if/then/else/dependentSchemas) and cache by pointer.
  - Expose a small helper to test “does value validate against subschema X?” without re‑compiling.

## 6) Testing Plan

- Unit tests
  - Per keyword family with minimal schemas and value cases: enums, composition, conditionals, additional/pattern properties, arrays (tuple/contains), unevaluated\*, formats.
  - Path mapping correctness for typical AJV errors (required, additionalProperties, contains, oneOf mismatch).
- Integration tests
  - Rendered tree snapshot for representative complex schemas (deep nested + oneOf + dependencies).
  - Interaction tests: switching branches, adding/removing items/properties, toggling nullable.
- Compatibility tests
  - Draft‑07 vs 2020‑12 artifacts (items vs prefixItems); unevaluated\* behaviors and AJV options.

## 7) Performance and Caching

- Memoize widget resolution per `SchemaContext` key (path + resolved def) with invalidation on value changes only where necessary (branch selection).
- Cache `$ref` resolutions and compiled validators by JSON Pointer and `$id`.
- Debounce validations when typing; batch recomputations to animation frames.

## 8) Milestones and Acceptance Criteria

Milestone A: Core completeness

- Union rendering, enum/const widgets, anyOf/oneOf UI, allOf merge, not handling, and basic formats.
- Acceptance: Complex schema with nested oneOf renders without errors; selection persists; AJV shows correct errors.

Milestone B: Dependencies and properties

- if/then/else overlays, dependentRequired/Schemas, additional/pattern properties, propertyNames, min/max properties; array tuple and contains; unevaluated\*.
- Acceptance: Dynamic required and overlays update; additional property editor respects constraints; tuple arrays render per‑index; contains hints show.

Milestone C: Customization and polish

- Comprehensive `ui:*` support, widget registry, readOnly/writeOnly/deprecated; i18n and a11y checks; performance pass.
- Acceptance: Documentation examples cover all listed widgets and keywords; tests stable; large form performs well.

## 9) Open Questions / Decisions

- External `$ref` support: bundle requirement vs built‑in fetcher; repo‑wide guidance.
- Conflict policy for `allOf` merges: configuration default ('lastWins' vs 'error').
- Visibility rules: standardize `ui:visibleIf` expression language (simple JSONPath equality vs function hook).
- Discriminator support: adopt OpenAPI `discriminator` or `ui:discriminator` only.
- Strict AJV: prefer no‑op vendor keywords vs `strictSchema: false`.

## 10) Immediate Next Actions

1. Fix `SchemaContext.oneOf` bug and implement `JSONSchemaUnion` stub to unblock composition flows.
2. Add enum/const mapping with basic widgets (radio/select/segmented, multi‑select/tags).
3. Implement oneOf/anyOf branch selection with AJV auto‑detection and manual override; persist selection per path.
4. Update AJV to allow `ui:widget` object shape (`{ format, ... }`) and merge with `ui:options`.
5. Adjust widget resolution to use non‑nullable inputs by default; add explicit null/presence toggles per Optionality & Nullability Strategy.
6. Add tests for the above and wire missing common string formats to existing inputs (email, url, uuid, date/time, color, duration, binary).

Once these land, proceed with dependencies and properties (Phases 2–4).

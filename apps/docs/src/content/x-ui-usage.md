# x:ui Vendor Extension — Quick Guide

This guide shows the most useful `x:ui` keys, what they do, and where they are handled in code. Use it as a quick reference, then jump to the deeper usage map below.

## Quick Reference

- Force widget: `x:ui: 'email'` or `{ widget: 'slider' }`
- Pick layout for an object: `{ format: 'fieldset' | 'tabs' | 'accordion' | 'group' | 'grid', order, groups, cols }`
- Conditional show/hide: `{ visibleIf: 'field' | complex-expression }`
- oneOf discriminator (fallback to OpenAPI): `{ discriminatorKey: 'type', discriminatorMapping?: { value: index } }`
- File/binary options: `{ preferFileUpload: true, maxFileSize: 1_000_000, maxBytes: 1_000_000 }`
- Read/write overrides: `{ ignoreReadOnly: true, showWriteOnly: true }`
- Tuple labels: `{ tupleLabels: ['First', 'Last', 'Age'] }`
- Union (type: [...]) UX: `{ unionDefault: 'string', selector: 'segmented'|'select', confirmBranchChange: true }`
- Validation helpers: `{ when: [...], crossField: [...], crossFieldRules: [...], async: [...] }`
- Composition (advanced multi‑widget layouts): `{ composition: { layout, widgets, layoutOptions, conditions } }`

## Examples

```jsonc
// Force widget (string form)
{ "type": "string", "x:ui": "markdown" }

// Force widget (object form) + file controls
{ "type": "string", "format": "binary", "x:ui": { "preferFileUpload": true, "maxFileSize": 1048576 } }

// Object layout
{
  "type": "object",
  "x:ui": { "format": "tabs", "order": ["title", "details"], "cols": { "md": 2 } }
}

// Visibility
{ "type": "string", "x:ui": { "visibleIf": "enabled" } }

// oneOf discriminator fallback
{
  "oneOf": [ { "properties": { "type": { "const": "circle" } } }, { "properties": { "type": { "const": "square" } } } ],
  "x:ui": { "discriminatorKey": "type" }
}

// Union control options
{ "type": ["string", "number"], "x:ui": { "unionDefault": "string", "selector": "segmented" } }

// Cross‑field validation (modern)
{ "x:ui": { "crossFieldRules": [{ "id": "range", "fields": ["min", "max"], "validate": "min <= max" }] } }
```

---

# Detailed Usage Map

Paths are repository‑relative for quick navigation.

## AJV Integration

- Accept keyword: `packages/beatui/src/components/json-schema/ajv-utils.ts:73`
  - Registers `x:ui` as a no‑op AJV keyword so schemas validate while carrying UI hints.

## Widget Resolution and Heuristics

- Config extraction and precedence: `packages/beatui/src/components/json-schema/widgets/utils.ts`
  - `getXUIConfig(...)`: reads `x:ui` (string or object).
  - `resolveWidget(...)`: precedence — `x:ui.widget` → `x:ui.format`/string → `schema.format` → media (`contentMediaType`/`contentEncoding`) → constraints → heuristics → type fallback.
  - Textarea heuristics via `x:ui.textAreaTriggers`.
- String controls binary/media options: `packages/beatui/src/components/json-schema/widgets/string-controls.ts`
  - Uses `x:ui.preferFileUpload`, `x:ui.maxBytes` / `x:ui.maxFileSize` for `binary` widgets.
- Number controls display options: `packages/beatui/src/components/json-schema/controls/number-controls.ts`
  - `x:ui.displayFormat` (`currency`/`percent`) and `x:ui.currency`.

## Widget Customization and Composition

- Customization (styling/attributes/wrapper/conditional): `packages/beatui/src/components/json-schema/widgets/widget-customization.ts`
  - `getWidgetCustomization(...)` reads `x:ui.widget`, `config`, `className`, `style`, `attributes`, `wrapper`, `conditional`.
  - `WidgetRegistry` integrates with `resolveWidget(...)` for overrides.
- Composition (multi‑widget layouts): `packages/beatui/src/components/json-schema/widgets/widget-composition.ts`
  - `getWidgetComposition(...)` reads `x:ui.composition` (layout, widgets, layoutOptions, conditions).

## Containers (Object‑level Layout)

- Container layouts: `packages/beatui/src/components/json-schema/containers/container-layouts.ts`
  - `getContainerLayout(...)` reads `x:ui.format` (`fieldset`|`tabs`|`accordion`|`group`|`grid`), `order`, `groups`, `cols`.
  - Applied by object control to arrange child fields.

## Visibility

- Config and evaluation: `packages/beatui/src/components/json-schema/visibility/visibility-evaluation.ts`
  - `getVisibilityConfig(...)` reads `x:ui.visibleIf` (string condition or structured condition/expression).
- Wrapper: `packages/beatui/src/components/json-schema/visibility/visibility-wrapper.ts`
  - `WithVisibility` uses the above to hide/unmount controls.

## Discriminator (oneOf selection)

- BeatUI fallback when OpenAPI discriminator absent: `packages/beatui/src/components/json-schema/discriminator/discriminator-utils.ts`
  - `x:ui.discriminatorKey` and optional `x:ui.discriminatorMapping`.

## Object/Array Helpers

- Object key behavior: `packages/beatui/src/components/json-schema/controls/object-control.ts`
  - `x:ui.lockKeyAfterSet` prevents renaming keys after a value is entered.
- Tuple array labels: `packages/beatui/src/components/json-schema/controls/array-control.ts`
  - `x:ui.tupleLabels` provides per‑index labels for tuple prefix items.

## Schema Annotations (readOnly/writeOnly)

- Read/write handling: `packages/beatui/src/components/json-schema/schema-context.ts`
  - `x:ui.ignoreReadOnly` to enable editing readOnly fields.
  - `x:ui.showWriteOnly` to show writeOnly fields in UI.

## Unions (type: [...])

- Union control options: `packages/beatui/src/components/json-schema/controls/type-utils.ts`
  - `x:ui.unionDefault`, `x:ui.confirmBranchChange`, `x:ui.selector`.

## Validation (Conditional, Cross‑field, Async)

- Conditional validation: `packages/beatui/src/components/json-schema/validation/conditional-validation.ts`
  - Reads `x:ui.when` rules; error mapping under `#/x:ui/when`.
- Modern cross‑field rules: `packages/beatui/src/components/json-schema/validation/cross-field-validation.ts`
  - Reads `x:ui.crossFieldRules` and maps errors under `#/x:ui/crossField/...`.
- Legacy cross‑field and async: `packages/beatui/src/components/json-schema/validation/conditional-validation.ts`
  - Reads `x:ui.crossField` and `x:ui.async`.

## Example Schemas Using x:ui (Docs)

- `apps/docs/src/pages/json-samples/x-ui-schema.ts` — container + per‑field usage.
- `apps/docs/src/pages/json-samples/sample-schema.ts` — `x:ui: 'markdown'`.
- `apps/docs/src/pages/json-samples/formats-media-schema.ts` — `x:ui: 'color'`.

## Supported Widgets

| Widget         | Applies To            | Selected By                                                               | x:ui Options                                  | Notes                                                  |
| -------------- | --------------------- | ------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| text (default) | string                | fallback when no other mapping                                            | placeholder via InputWrapper                  | Single‑line text input                                 |
| textarea       | string                | `x:ui: 'textarea'`, heuristics on name/length, or `x:ui.textAreaTriggers` | `textAreaTriggers` (array of triggers)        | Multi‑line text                                        |
| password       | string                | `x:ui: 'password'` or field name heuristic                                | —                                             | Concealed input                                        |
| email          | string                | `format: 'email'` or heuristic                                            | —                                             | Validated by AJV                                       |
| url            | string                | `x:ui: 'url'` or heuristic                                                | —                                             | Alias of `uri` UI                                      |
| uri            | string                | `format: 'uri'`                                                           | —                                             |                                                        |
| uri-reference  | string                | `format: 'uri-reference'`                                                 | —                                             |                                                        |
| hostname       | string                | `format: 'hostname'`                                                      | —                                             |                                                        |
| ipv4           | string                | `format: 'ipv4'`                                                          | —                                             |                                                        |
| ipv6           | string                | `format: 'ipv6'`                                                          | —                                             |                                                        |
| regex          | string                | `format: 'regex'`                                                         | —                                             | Renders as textarea with regex hint                    |
| uuid           | string                | `format: 'uuid'`                                                          | —                                             | UUID input                                             |
| date           | string                | `format: 'date'`                                                          | —                                             | Calendar date                                          |
| date-time      | string                | `format: 'date-time'`                                                     | —                                             | ISO datetime                                           |
| time           | string                | `format: 'time'`                                                          | —                                             | Basic time input                                       |
| duration       | string                | `format: 'duration'`                                                      | —                                             | Uses Temporal Duration                                 |
| color          | string                | `x:ui: 'color'` or heuristic                                              | —                                             | Color picker, shows display value                      |
| markdown       | string                | `x:ui: 'markdown'` or `contentMediaType: 'text/markdown'`                 | —                                             | Rich text editor                                       |
| binary         | string                | `format: 'binary'`, `contentEncoding: 'base64'`, or `contentMediaType`    | `preferFileUpload`, `maxFileSize`, `maxBytes` | File picker (base64) or text area depending on options |
| enum           | any with `enum`       | presence of `enum`                                                        | —                                             | Native select with stringified labels                  |
| const          | any with `const`      | presence of `const`                                                       | —                                             | Read‑only display; value enforced                      |
| number         | number/integer        | `type: 'number'`/`'integer'`                                              | —                                             | Standard numeric input (nullable supported)            |
| slider         | number/integer        | `x:ui.widget: 'slider'` or numeric constraints with min+max               | inherits `min`, `max`, `step` from schema     | Range slider                                           |
| rating         | integer (small range) | auto when small integer range, or `x:ui.widget: 'rating'`                 | `max` (via options or schema maximum)         | Star rating control                                    |
| currency       | number/integer        | `x:ui.displayFormat: 'currency'`                                          | `currency` (e.g., `USD`)                      | Masked input for currency                              |
| percent        | number/integer        | `x:ui.displayFormat: 'percent'`                                           | —                                             | Masked input for percent                               |

Notes on selection precedence: explicit `x:ui.widget` → `x:ui.format` (or string form) → schema `format` → media (`contentMediaType`/`contentEncoding`) → constraints → heuristics → type fallback.

### Container Formats (Object Layout)

| Format    | Applies To | x:ui Keys                                | Notes                                    |
| --------- | ---------- | ---------------------------------------- | ---------------------------------------- |
| fieldset  | object     | `format: 'fieldset'`                     | Wraps children in a fieldset with legend |
| tabs      | object     | `format: 'tabs'`, `order`, `groups`      | Renders groups/fields as tabs            |
| accordion | object     | `format: 'accordion'`, `order`, `groups` | Expand/collapse sections                 |
| group     | object     | `format: 'group'`                        | Card‑like grouped block                  |
| grid      | object     | `format: 'grid'`, `cols`                 | Responsive grid of children              |

### Union and Discriminator Options

| Area                | Applies To                  | x:ui Keys                                   | Notes                                            |
| ------------------- | --------------------------- | ------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| Union selector      | type unions (`type: [...]`) | `unionDefault`, `selector: 'segmented'      | 'select'`, `confirmBranchChange`                 | Controls initial branch and UI selector |
| oneOf discriminator | oneOf schemas               | `discriminatorKey`, `discriminatorMapping?` | Fallback when OpenAPI discriminator not provided |

_Last updated: kept in sync with code as of this commit._

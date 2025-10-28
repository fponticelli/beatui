# Phase 5 — Formats and Advanced Widgets

Actionable TODOs to wire remaining JSON Schema formats, media handling, and annotations to concrete BeatUI inputs.

- [x] Map common string formats to existing inputs
  - In `packages/beatui/src/components/json-schema/widgets/string-detection.ts`, add detection rules mapping `format` values to inputs: `email`, `uri`/`url`, `uri-reference`, `hostname`, `ipv4`, `ipv6`, `uuid`, `regex`, `date`, `date-time`, `time`, `duration`, `color`.
  - Reuse existing components where available (e.g., `nullable-duration-input`, `ColorSwatchInput`); add new inputs if missing and wire them in `string-controls.ts`.
  - Use `x:ui.textAreaTriggers` and field name heuristics to switch to multiline for long text.

- [x] Support binary/media content via `contentMediaType` + `contentEncoding`
  - When `contentEncoding` is present (e.g., `base64`) and/or `contentMediaType` indicates a file type, render an upload/file picker input; enforce `accept` and byte-size limits from `x:ui` when provided.
  - Provide a clear/display mode for previously uploaded binary content.

- [x] Advanced numeric widgets and formatting
  - For bounded continuous ranges, support a slider widget; compute `step` from `multipleOf` and coerce to 1 for integers.
  - Add steppers and rating widget support (e.g., `x:ui.format: 'rating'`); implement display masks for currency/percent via `x:ui.displayFormat`.

- [x] Annotations and accessibility
  - Ensure titles/descriptions/placeholders/examples render consistently through `InputWrapper` across all widgets.
  - Add support for `readOnly`/`writeOnly` and `deprecated` wiring (disabled/hidden/badged) if not already implemented in Phase 3.

- [x] Tests for formats and widgets
  - Add unit tests under `packages/beatui/tests/unit/` covering format detection → widget selection and basic input behaviors for email/url/uuid/date/time/duration/color and binary media.

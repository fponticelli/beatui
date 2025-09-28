# BeatUI CSS Layer Audit

This document catalogs the current BeatUI styling layers and utility families ahead of the Tailwind migration.

## Layer Overview

### 01.reset (retired)
- Former bespoke reset that zeroed margins, enforced `box-sizing: border-box`, normalised typography, and stripped default focus outlines.
- Rules now live inside the Tailwind-driven base layer: `tailwindcss/preflight` plus `layers/02.base/foundation.css` retain the smoothing, overflow-wrap, and cursor treatments we still need.

### 02.base
- `variables.css` defines the design token surface (OKLCH palettes for 20+ color families, semantic aliases such as `--color-primary-500`, surface/background text tokens, focus colors, spacing scale, typography scale, radius, shadows, z-index tiers).
- `base.css` applies tokens to the document root (`html`, `body`) and sets up `.b-light`/`.b-dark` wrappers, direction helpers (`.b-ltr`, `.b-rtl`), and blockquote/list/table adjustments.
- `focus.css` lays down global `*:focus-visible` behaviour and component-specific focus treatments (`.bc-switch`, `.bc-checkbox-input__checkbox`, etc.) plus reduced-motion/high-contrast tweaks.
- Many rules will map to Tailwind theme configuration (`theme.extend`) while structural selectors (e.g. `.b-dark *:focus-visible`) will need custom layers/plugins.

### 03.components
- Contains 40+ component-specific styles scoped to `.bc-*` BEM-like classes (buttons, inputs, layout primitives, overlays, JSON schema widgets, etc.).
- Rules mix layout, spacing, and state handling; many embed legacy utility tokens (e.g. `.bu-` classes) and rely on CSS variables defined in `02.base`.
- Several files note directional (`.b-rtl`, `.b-ltr`) variants and dark-mode overrides.
- Migration will likely replace many declarations with Tailwind utility classes or `@apply`, but components with complex interactive states (flyouts, drawers) may still require bespoke CSS.

### 04.variants (retired)
- Directory removed; Tailwind component layering now handled via `tailwind/components.css` and the component-level `@layer` rules.

### 05.utilities (retired)
- Legacy `.bu-*` utility bundle removed from the library; notes below are retained for historical reference while the Tailwind preset fully replaces these helpers.
- Large bundle of class-based utilities prefixed with `.bu-` (and `hover:bu-` etc.) acting as BeatUI's Tailwind analogue.
- Structure:
  - `utilities.css`: layout (`display`, flex/grid helpers), flex alignment/justification, gap, intrinsic sizing, text alignment, floats, font weight/size, border radius, positioning, z-index, overflow, spacing (`bu-p*`, `bu-px*`, etc.), cursor states.
  - `logical-properties.css`: logical margin/padding (`bu-ms-*`, `bu-pt-*`), auto values, direction-aware spacing using CSS logical properties.
  - `logical-breakpoint-utilities.css`: responsive variants (`sm:bu-ms-*`, `md:bu-ps-*`, border inline utilities tied to breakpoint tokens).
  - `direction-utilities.css`: directional overrides (`.bu-dir-ltr`, `.bu-text-align-start`, unicode-bidi helpers, list/table utilities, inline/block border helpers).
  - `bg.css` / `bg-hover.css`: background colour families (solid/light/lighter) with dark-mode overrides, derived from tokens.
  - `text-color.css` / `fg.css`: text/foreground colour utilities with dark-mode adjustments.
  - `border.css`: semantic & raw colour border utilities with dark-mode variants.
  - `text.css`: type scale (`.bu-text-{size}`), underline helper, overflow behaviours.
  - `transition.css`, `transform.css`: animation/transformation helpers including RTL-aware transforms and `bu-toggle` state classes.
  - `focus.css`: focus outlines for specific usage contexts (primary/error/success states, button vs input handling, forced removal).
  - `prose.css`: typography defaults for `.bu-prose` blocks (headings, lists, tables, inline elements) akin to Tailwind Typography plugin.
  - `animation.css`: stateful toggle/flyout animation classes (`.bu-toggle--slide-right`, `.bu-toggle--flyout-top`, etc.) not readily represented by Tailwind utilities.

### 06.overrides
- Contains prefers-contrast adjustments, reduced-motion treatment, global focus transition smoothing, and toolbar edge-case styling.
- Acts as final layer for consumer-specific tweaks; likely to shrink once Tailwind handles utilities and component layering.

## Utility Family Inventory (legacy)

The table below captures the former `.bu-*` utility sources for archival purposes; these files have been removed from the active codebase.

| File | Prefix/Pattern | Responsibility |
| --- | --- | --- |
| `utilities.css` | `.bu-{display/flex/gap/size/...}` | Core layout, sizing, typography, spacing, cursor helpers.
| `logical-properties.css` | `.bu-m{s,e,t,b}-*`, `.bu-p{...}-*` | Logical spacing for RTL/LTR compatibility using CSS logical props.
| `logical-breakpoint-utilities.css` | `.sm:` `.md:` `.lg:` prefixes | Responsive logical spacing/border utilities tied to custom breakpoints.
| `direction-utilities.css` | `.bu-dir-*`, `.bu-text-align-*` | Direction + unicode-bidi helpers, direction-aware borders/lists/tables.
| `bg.css` / `bg-hover.css` | `.bu-bg-*`, `.hover:bu-bg-*` | Background colour tokens and hover states with dark-mode overrides.
| `fg.css` | `.bu-fg-*` | Foreground colour tokens with dark-mode overrides.
| `text-color.css` | `.bu-text-*` | Text colour palette (semantic & raw swatches).
| `border.css` | `.bu-border--*` | Border colour tokens, including dark-mode variants.
| `text.css` | `.bu-text-*`, `.bu-underline` | Type scale, underline, overflow helpers.
| `transition.css` | `.bu-transition-*` | Shorthand transition utilities (none/all/color/bg/etc.).
| `transform.css` | `.bu-rotate-*`, `.bu-translate-*` | Transform helpers including RTL-aware variants.
| `focus.css` | `.bu-focus*` | Focus outline presets for different component contexts.
| `prose.css` | `.bu-prose` | Rich text defaults akin to Tailwind Typography plugin.
| `animation.css` | `.bu-toggle--*` | Stateful show/hide animations for toggles/flyouts.

## Tailwind Utility Mapping

### `utilities.css`
- Display helpers map 1:1 (`.bu-block` → `block`, `.bu-inline-block` → `inline-block`, `.bu-grid` → `grid`, `.bu-hidden` → `hidden`).
- Flexbox helpers translate directly: `.bu-flex-row` → `flex flex-row`, `.bu-flex-inline-col` → `inline-flex flex-col`, wrap variants → `flex-wrap`, `flex-nowrap`, etc.
- Alignment/justification utilities align with Tailwind's `items-*` and `justify-*`; "safe" variants (`safe center/end/start`) will need custom utilities or inline styles because Tailwind lacks the `safe` keyword.
- Gap/spacing values correspond to Tailwind's default spacing scale (`--spacing-base` = `0.25rem`): e.g. `.bu-gap-3` → `gap-3`, `.bu-p-1.5` → `p-1.5`, `.bu-px-2.5` → `px-2.5`.
- Width/height/intrinsic sizing map to `w-auto`, `w-full`, `w-screen`, `w-fit`, `w-min`, `w-max`, and the matching `h-*` classes.
- Text alignment/float utilities map to `text-left/center/right/justify` and `float-left/right/none`; logical variants map to Tailwind 3.3+ logical utilities (`text-start`, `float-start`, etc.).
- Typography scale and weight map directly (`.bu-text-xl` → `text-xl`, `.bu-font-semibold` → `font-semibold`, etc.).
- Border radius classes align with Tailwind's rounded scale after confirming token equivalence (`rounded-none`, `rounded-sm`, `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`).
- Positioning, z-index, overflow, visibility, and `sr-only` utilities all have direct Tailwind counterparts.
- Cursor utilities largely exist in Tailwind (`cursor-progress`, `cursor-ew-resize`, etc.); verify rarer values (`cursor-context-menu`, `cursor-cell`) are enabled in the `cursor` core plugin.

### `logical-properties.css`
- Inline spacing utilities map to Tailwind's logical spacing (`.bu-ms-2` → `ms-2`, `.bu-me-auto` → `me-auto`).
- Block spacing aligns with standard `mt`, `mb`, `pt`, `pb` classes because Tailwind already respects document writing mode.
- Logical padding utilities translate to `ps-*`/`pe-*` (`.bu-ps-4` → `ps-4`).
- Border helpers (`.bu-border-is`, `.bu-border-ie`) require Tailwind's logical border utilities (`border-s`, `border-e`) introduced in 3.3.

### `logical-breakpoint-utilities.css`
- Responsive variants follow the same mapping with breakpoint prefixes (`.sm:bu-ms-2` → `sm:ms-2`, `.lg:bu-border-ie-0` → `lg:border-e-0`).

### `direction-utilities.css`
- Text alignment helpers match Tailwind logical classes (`.bu-text-align-start` → `text-start`).
- Forced direction utilities (`.bu-dir-ltr`, `.bu-dir-rtl`, `.bu-context-*`, unicode-bidi helpers) do not have native Tailwind equivalents; retain as custom classes or implement via a small plugin.
- Direction-aware border/padding shortcuts (`.bu-border-inline`, `.bu-padding-inline-0`) may be expressed with combinations of logical Tailwind classes; consider writing component-level `@apply` helpers.
- Writing-mode utilities (`.bu-writing-mode-vertical-rl`) require bespoke utilities (`writing-mode` is not a core Tailwind plugin); add custom plugin entries.

### Colour Utilities (`bg.css`, `bg-hover.css`, `fg.css`, `text-color.css`, `border.css`)
- Solid variants correspond to Tailwind colour utilities once tokens are registered (`.bu-bg-primary` → `bg-primary-500`, `.bu-text-success` → `text-success-800`, `.bu-border--error` → `border-error-500`).
- Light/lighter variants map to adjacent shades (`bg-primary-200`, `bg-primary-50`) with matching text colours; ensure semantic aliases (`primary`, `secondary`, etc.) exist in `theme.extend.colors`.
- Hover-prefixed classes become `hover:bg-*` / `hover:text-*` utilities with the same palette indices.
- Dark-mode overrides currently rely on the `.b-dark` wrapper; replicate via Tailwind's `dark:` variant tied to `.b-dark` (`darkMode: ['class', '.b-dark']`).

### `text.css`
- Type scale utilities map directly (`.bu-text-2xs` → `text-2xs` once enabled). Tailwind lacks `text-3xs` out of the box; add custom sizes inside `theme.extend.fontSize`.
- `hover:bu-underline` → `hover:underline`, `bu-nowrap` → `whitespace-nowrap`, `bu-overflow-ellipsis` → `truncate`, `bu-overflow-clip` → `overflow-hidden`.

### `transition.css`
- Map to built-ins (`.bu-transition-all` → `transition-all`, `.bu-transition-color` → `transition-colors`). Ensure the default duration/easing (`0.2s ease-in-out`) matches Tailwind's defaults or override via config if necessary.

### `transform.css`
- Rotation classes align with Tailwind's rotate scale (`.bu-rotate-45` → `rotate-45`). Values like `rotate-1`/`rotate-3` require enabling the fine-grained `rotate` scale in `theme.extend.rotate`.
- RTL-aware helpers (`.bu-translate-x-start` / `.bu-translate-x-end`) can be reproduced with `translate-x-*` combined with `rtl:` variants (e.g. `translate-x-1 rtl:-translate-x-1`).
- `.bu-scale-x-flip` → `-scale-x-100`.

### `focus.css`
- Base focus outlines can be recreated using Tailwind's ring utilities (`focus:ring`, `focus:ring-offset`), while variant classes (primary/error/success) become ring colour utilities controlled by state classes or `data-*` attributes.
- `.bu-focus--none` translates to `focus:outline-none focus:ring-0`.
- Maintain custom selectors targeting component internals (`.bc-switch`) via component CSS or `@apply` since Tailwind cannot target descendant elements without plugins.

### `prose.css`
- Replace with Tailwind Typography plugin (`@tailwindcss/typography`) and extend the theme to use BeatUI token colours for headings, links, code, etc. Custom selectors (e.g. table striping) can be set via the plugin's `typography` configuration.

### `animation.css`
- Toggle/flyout state machines have no direct Tailwind analogue. Keep them as component-scoped CSS modules, or consider generating Tailwind utilities via a dedicated plugin if reuse is required.

## Reset vs Tailwind Preflight

| Rule Group | Covered by Tailwind preflight? | Action |
| --- | --- | --- |
| `*, *::before, *::after { box-sizing: border-box; }` | ✅ identical rule emitted | Drop from custom reset. |
| `* { margin: 0; }` | ⚠️ preflight only clears margins on `body` + headings | Replace with targeted spacing resets where needed (e.g. components that assumed zero margins). |
| `html`/`body` font smoothing + background defaults | ⚠️ only `-webkit-text-size-adjust` provided; smoothing not included | Keep smoothing + theme background initialisers inside `@layer base`. |
| Media elements (`img`, `picture`, `video`, `canvas`, `svg`) block display + max-width | ✅ equivalent preflight rules | Drop from reset. |
| Form controls inherit font (`input`, `button`, `textarea`, `select`) | ✅ preflight sets `font: inherit` plus additional normalisation | Drop from reset. |
| Typography override `p, h1…h6 { font-size: 1rem; line-height: 1.5rem; font-weight: 400; }` | ❌ preflight leaves native scales | Do not carry forward globally; move `overflow-wrap: break-word` into base layer and let Tailwind typography utilities govern sizing. |
| `button` stripping (border/background/padding) | ✅ preflight removes border/background and normalises appearance | Drop; rely on Tailwind utilities per component. |
| `button { cursor: pointer; }` / `button:disabled { cursor: not-allowed; }` | ⚠️ pointer defaults vary | Keep as focused base rule (possibly at component scope) to preserve affordance/disabled behaviour. |
| `a { color: inherit; text-decoration: none; }` | ⚠️ preflight inherits colour but not remove underline | Keep `text-decoration` reset in base layer (or convert to `@apply no-underline`). |
| `ul, ol { list-style: none; padding: 0; }` | ❌ preflight retains list markers | Only apply within components that expect marker-less lists; remove from global reset to avoid surprising prose. |
| `*:focus { outline: none; }` | ❌ preflight leaves focus outlines intact | Remove (accessibility); rely on the base `*:focus-visible` rules in `02.base/focus.css` and Tailwind `focus-visible` utilities. |

Additional notes:
- Move the surviving reset snippets (smoothing, button cursor, link underline override) into a Tailwind `@layer base` module so they are co-located with other base utilities.
- Review `02.base/focus.css` while adopting Tailwind rings to ensure the new focus styles pair correctly with the restored native outline fallback.

## Notes & Gaps
- Several utilities reference `var(--spacing-0)` which is not defined in `variables.css`; likely intended to map to `--spacing-none`.
- Dark-mode support is implemented via `.b-dark` wrappers rather than data attributes or media queries; Tailwind config must reproduce the wrapper strategy or migrate components to `class="dark"` semantics.
- Animation/toggle utilities encode complex state combinations that may be better served by component-scoped styles or dedicated Tailwind plugin utilities.
- Existing focus utilities remove browser outlines globally; consider aligning with Tailwind's focus ring strategy to avoid accessibility regressions.

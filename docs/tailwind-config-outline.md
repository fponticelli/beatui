# BeatUI Shared Tailwind Config Outline

This outline captures the shape of the shared Tailwind configuration that both the BeatUI component library and the docs/examples will consume.

## Goals
- Centralise BeatUI's design tokens so Tailwind utilities mirror the existing CSS variable palette.
- Keep `.b-dark`/`.b-light` and `.b-rtl` wrappers functional by exposing matching `dark:` and `rtl:` variants.
- Preserve logical property helpers and direction-aware abstractions so existing layout logic migrates cleanly.

## Base Configuration Skeleton

```ts
// tailwind.config.ts (shared preset)
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import { beatuiColors, beatuiSpacing, beatuiShadows, beatuiRadii, beatuiTypography, beatuiBreakpoints } from './plugins/tokens'
import { logicalPropertyPlugin, rtlVariantPlugin, beatuiFocusRingPlugin } from './plugins/beatui-plugins'

export default <Config>{
  darkMode: ['class', '.b-dark'],
  content: [
    './packages/**/*.{ts,tsx,js,jsx,mdx}',
    './apps/**/*.{ts,tsx,js,jsx,mdx}',
    './docs/**/*.{md,mdx}',
  ],
  theme: {
    screens: beatuiBreakpoints,
    extend: {
      colors: beatuiColors,
      spacing: beatuiSpacing,
      borderRadius: beatuiRadii,
      boxShadow: beatuiShadows,
      fontFamily: beatuiTypography.fontFamily,
      fontSize: beatuiTypography.fontSize,
      lineHeight: beatuiTypography.lineHeight,
      letterSpacing: beatuiTypography.letterSpacing,
      zIndex: {
        base: 'var(--z-index-base)',
        raised: 'var(--z-index-raised)',
        navigation: 'var(--z-index-navigation)',
        sidebar: 'var(--z-index-sidebar)',
        overlay: 'var(--z-index-overlay)',
        modal: 'var(--z-index-modal)',
        tooltip: 'var(--z-index-tooltip)',
        popover: 'var(--z-index-popover)',
        notification: 'var(--z-index-notification)',
        max: 'var(--z-index-maximum)',
      },
      transitionDuration: {
        beatui: '200ms',
      },
      transitionTimingFunction: {
        beatui: 'ease-in-out',
      },
    },
  },
  plugins: [
    typography,
    forms,
    logicalPropertyPlugin(),
    rtlVariantPlugin({ selector: '.b-rtl' }),
    beatuiFocusRingPlugin(),
  ],
  safelist: [
    // dynamic state classes emitted by JSON Schema forms, e.g. `.bu-toggle--*`
  ],
}
```

## Token Mapping Notes
- **Colors**: expose semantic palette (`primary`, `secondary`, `success`, etc.) plus raw OKLCH families by reading from `packages/beatui/src/tokens/colors.ts`. Use a helper that returns CSS variable references (e.g. `var(--color-primary-500)`), with an opacity-aware wrapper for Tailwind's color utilities.
- **Background/Text/Border tokens**: surface semantic aliases (`bg-surface`, `text-muted`, `border-divider`) by mapping to the same variables used in `02.base/variables.css`.
- **Spacing**: map the spacing scale to `var(--spacing-*)`. Replace the legacy `--spacing-0` usages with `--spacing-none` when mirroring values.
- **Typography**: reuse `fontFamily`/`fontSize`/`lineHeight` tokens so `text-2xs`/`text-3xs` remain available.
- **Shadows & Radii**: convert `--shadow-*` and `--radius-*` variables into Tailwind tokens so `shadow-beatui-lg` and `rounded-beatui-lg` equivalents exist.
- **Breakpoints**: import `packages/beatui/src/tokens/breakpoints.ts` to generate the `screens` map (`{ sm: '40rem', md: '48rem', ... }`).

## Variant & Wrapper Strategy
- Configure Tailwind `darkMode` to trigger on `.b-dark` to match existing wrappers. Provide a `light:` sibling variant via plugin if conditionals need explicit light-only styles.
- Introduce an `rtl:` variant that scopes rules beneath `.b-rtl` to replicate the current direction wrappers without reintroducing bespoke utilities.
- Preserve `focus-visible` behaviours with either Tailwind's `ring` utilities or a thin plugin that applies BeatUI's colour tokens to `focus:ring` values.

## Plugins & Automation
- **logicalPropertyPlugin**: optional. Tailwind 3.3+ ships logical variants (`ms-*`, `me-*`, `ps-*`, `pe-*`) that now cover BeatUI's needs; retain a thin plugin only if we decide to generate additional shorthands (inline border helpers, writing-mode utilities, etc.).
- **rtlVariantPlugin**: produce `rtl:` and `ltr:` variants that wrap selectors in `.b-rtl` / `.b-ltr`, mirroring the class-based wrappers used today.
- **focus ring**: define CSS custom properties for focus ring colour/offset (`--interactive-focus-light/dark`) and provide utilities (`focus-ring-primary`, etc.) that map to Tailwind's ring API.
- Evaluate whether to keep bespoke animation classes (`.bu-toggle--*`) as part of the preset (plugin generating groups) or rewrite components to use `transition` + `data-*` driven utilities.

## Safelist & Dynamic Class Handling
- Inventory any runtime-generated class names from the JSON Schema renderer (e.g. conditional visibility toggles) and add wildcards to the Tailwind safelist (`/^data-state-.+/`, `/^bu-toggle--/`).
- Provide guidance for consumers embedding BeatUI in SSR/ISR setups so they include BeatUI's classnames in their own Tailwind `content` globs.

## Deliverables
- Shared preset package (`packages/beatui/tailwind-preset.ts`) exporting the config above.
- Consuming Tailwind configs (`apps/docs/tailwind.config.ts`, consumer examples) that simply `import preset from '@beatui/tailwind-preset'` and spread/override as needed.
- CI smoke test that renders library components in both `.b-light` and `.b-dark .b-rtl` contexts to ensure variants compile correctly.

# BeatUI

A modern TypeScript UI component library built with [@tempots/dom](https://tempo-ts.com).

## Features

- Built with @tempots/dom for lightweight and efficient DOM manipulation
- TypeScript for type safety and better developer experience
- Vite for fast development and optimized builds
- Vitest for unit testing
- Playwright for browser testing

- ESLint and Prettier for code quality and consistent formatting
- Layered CSS architecture with design tokens
- Iconify integration for icons
- Container queries for responsive components

## Migration note (breaking)

- Controller<T> property `value: Signal<T>` has been renamed to `signal: Signal<T>`.
- Replace usages as follows:
  - `controller.value.value` → `controller.signal.value`
  - `controller.value.map(fn)` → `controller.signal.map(fn)`
- Applies to all controller types (Controller, ObjectController, ArrayController, UnionController, ColorController, etc.).
- Rationale: avoid confusion between the controller property `value` and the signal’s `.value`.

## Installation

```bash
npm install @tempots/beatui
# or
pnpm add @tempots/beatui
# or
yarn add @tempots/beatui
```

You'll also need to install the peer dependencies:

```bash
npm install @tempots/dom @tempots/std @tempots/ui
# or
pnpm add @tempots/dom @tempots/std @tempots/ui
# or
yarn add @tempots/dom @tempots/std @tempots/ui
```

## CSS – Zero‑config by default

BeatUI injects its base layered CSS automatically when you use the `BeatUI(...)` root provider. No extra configuration or imports are needed in typical apps.

- Recommended: wrap your app with `BeatUI(...)` and you’re done.
- Advanced: if you don’t use the root provider and still want global styles, you can explicitly import the CSS subpath.

```typescript
import { BeatUI } from '@tempots/beatui'
// ...use BeatUI(...) at the top of your app
```

Optional explicit CSS import (not required when using BeatUI(...) root provider):

```css
@import '@tempots/beatui/css';
```

Or in TypeScript:

```ts
import '@tempots/beatui/css'
```

### Using BeatUI alongside Tailwind v4

If your project already ships Tailwind v4, pull in the slimmer Tailwind bundle and preset so the design tokens come from Tailwind instead of the standalone reset.

```css
/* apps/main.css */
@import '@tempots/beatui/tailwind.css';
```

```ts
// tailwind.config.ts
import { defineConfig } from 'tailwindcss'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'
import { createBeatuiPreset } from '@tempots/beatui/tailwind/preset'

export default defineConfig({
  plugins: [
    beatuiTailwindPlugin({
      darkClass: 'dark',
      rtlAttribute: 'dir',
    }),
  ],
  presets: [
    createBeatuiPreset({
      semanticColors: {
        primary: 'emerald',
        secondary: 'slate',
      },
    }),
  ],
})
```

Need to self-host Google Fonts? Provide `googleFonts` entries and update your font tokens in one place:

```ts
beatuiTailwindPlugin({
  googleFonts: [{ family: 'Inter', weights: [400, 600], styles: ['normal', 'italic'] }],
  fontFamilies: { sans: ['"Inter"', 'system-ui'] },
})
```

The preset registers BeatUI tokens through Tailwind’s `@theme`/`addBase` pipeline, provides semantic color overrides, and exposes `beatui-dark`, `beatui-light`, `beatui-rtl`, and `beatui-ltr` variants that target BeatUI’s layout wrappers. See `docs/tailwind-preset-usage.md` for the full option list. The Vite plugin synchronises Tailwind’s dark/RTL selectors with BeatUI’s `.b-dark` / `.b-rtl` helpers and injects the slim CSS bundle automatically—additional options are documented in `docs/tailwind-plugin-usage.md`.

## Usage

```typescript
import { createButton, createCard } from '@tempots/beatui'

// Create a button
const button = createButton({
  text: 'Click me',
  variant: 'filled',
  onClick: () => console.log('Button clicked'),
})

// Create a card with the button
const card = createCard({
  title: 'My Card',
  content: 'This is a card component from BeatUI Library',
  children: [button],
})

// Add the card to the DOM
document.body.appendChild(card)
```

## Available Components

### Form Components

- Button - Interactive buttons with multiple variants
- Input - Text input fields with validation
- Checkbox - Checkbox inputs with custom styling
- Color Swatch Input - Color picker input with validation and format conversion
- Tags Input - Multi-tag input field

### Layout Components

- App Shell - Application layout structure
- Overlay - Modal and overlay components

### Data Components

- Tag - Individual tag component

## CSS Architecture

BeatUI uses a layered CSS architecture:

- `@layer base` - Reset + foundational styles and design tokens
- `@layer components` - Component styles and modifiers (the `bc-` namespace)

## Design Tokens

The library includes comprehensive design tokens for:

- Colors (semantic and base colors)
- Typography (font families, sizes, weights)
- Spacing (consistent spacing scale)
- Border radius (consistent radius scale)
- Breakpoints (responsive design)

## Development

See the [monorepo README](../../README.md) for development instructions.

## Publishing

The package includes convenient scripts for publishing different types of releases:

```bash
# Patch release (0.0.1 → 0.0.2) - for bug fixes
pnpm run release:patch

# Minor release (0.0.1 → 0.1.0) - for new features
pnpm run release:minor

# Major release (0.0.1 → 1.0.0) - for breaking changes
pnpm run release:major

# Prerelease (0.0.1 → 0.0.2-0) - for beta/alpha versions
pnpm run release:prerelease

# Release without automatic git commit (manual git handling)
pnpm run release:patch:no-commit
pnpm run release:minor:no-commit
pnpm run release:major:no-commit
pnpm run release:prerelease:no-commit

# Test publishing without actually publishing
pnpm run release:dry

# Show current version
pnpm run version:show

# Preview what the next version would be for each release type
pnpm run version:next:patch      # Shows next patch version
pnpm run version:next:minor      # Shows next minor version
pnpm run version:next:major      # Shows next major version
pnpm run version:next:prerelease # Shows next prerelease version

# Prepare package for release (clean, build, test) without publishing
pnpm run release:prepare

# Test what commit message would be created
pnpm run release:commit:dry
```

### Release Process

Each release script follows this workflow:

1. **Prepare**: Clean previous builds, build package, run all tests
2. **Version**: Update the version number in package.json and create git tag
3. **Publish**: Publish to npm (bypassing git checks since version step creates changes)
4. **Commit**: Add package.json changes and commit with release message

The workflow ensures that:

- All tests pass before any version changes
- Package builds successfully before publishing
- Git tags are created for version tracking
- Git check conflicts are avoided by using `--no-git-checks` after versioning
- Release commits are automatically created with descriptive messages

### Release Guidelines

- **Patch releases** (0.0.1 → 0.0.2): Bug fixes, documentation updates, internal refactoring
- **Minor releases** (0.0.1 → 0.1.0): New features, new components, non-breaking API additions
- **Major releases** (0.0.1 → 1.0.0): Breaking changes, API changes, major architectural updates
- **Prerelease** (0.0.1 → 0.0.2-0): Beta/alpha versions for testing

**Note**: Prerelease versions are published with the `next` tag, so they won't be installed by default with `npm install @tempots/beatui`.

### Git Integration

**Automatic Git Commits (Default)**

The main release scripts automatically commit version changes after successful publish:

- Add the updated `package.json` to git staging
- Create a commit with the message: `chore: release @tempots/beatui@{version}`
- This keeps your git history in sync with published versions

Example commit messages:

- `chore: release @tempots/beatui@1.0.0`
- `chore: release @tempots/beatui@1.1.0`
- `chore: release @tempots/beatui@1.0.1`

**Manual Git Handling**

If you prefer to handle git commits manually, use the `:no-commit` variants:

- `pnpm run release:patch:no-commit`
- `pnpm run release:minor:no-commit`
- `pnpm run release:major:no-commit`
- `pnpm run release:prerelease:no-commit`

These scripts will publish successfully but leave git operations to you.

## Color Swatch Input Component

The Color Swatch Input component provides an intuitive interface for color selection with comprehensive validation and format conversion capabilities.

### Basic Usage

```typescript
import { ColorSwatchInput, prop } from '@tempots/beatui'

const color = prop('#3b82f6')

const colorPicker = ColorSwatchInput({
  value: color,
  onChange: newColor => console.log('Color changed:', newColor),
  id: 'my-color-picker',
})
```

### With Form Controller

```typescript
import {
  ColorSwatchInput,
  createColorController,
  colorInputOptionsFromController,
  useForm,
  isValidHexColor,
} from '@tempots/beatui'
import { z } from 'zod'

const { controller } = useForm({
  schema: z.object({
    primaryColor: z
      .string()
      .refine(isValidHexColor, 'Must be a valid hex color'),
    secondaryColor: z
      .string()
      .refine(isValidHexColor, 'Must be a valid hex color'),
  }),
  initialValue: {
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
  },
})

const primaryColorController = createColorController(
  controller.field('primaryColor')
)
const secondaryColorController = createColorController(
  controller.field('secondaryColor')
)

// Use with input options
const primaryColorInput = ColorSwatchInput(
  colorInputOptionsFromController(primaryColorController)
)
const secondaryColorInput = ColorSwatchInput(
  colorInputOptionsFromController(secondaryColorController)
)
```

### Color Controller Features

The `ColorController` extends the base `Controller` with color-specific functionality:

```typescript
// Validation
controller.isValidColor.value // boolean - validates any supported color format
controller.isValidHex.value // boolean - validates hex colors specifically

// Normalization
controller.normalizedHex.value // string - always returns 6-character hex with #

// Color manipulation
controller.setColor('#f00') // Sets and normalizes hex colors
controller.setHex('#ff0000') // Sets hex color specifically
controller.setRgb(255, 0, 0) // Sets color from RGB values

// Format conversion
controller.getRgb() // Returns { r: 255, g: 0, b: 0 } or null
controller.withFormat('rgb') // Returns controller with RGB format transformation
```

### Color Validation Utilities

BeatUI includes comprehensive color validation utilities:

```typescript
import {
  isValidHexColor,
  isValidRgbColor,
  isValidRgbaColor,
  isValidHslColor,
  isValidColor,
  normalizeHexColor,
  rgbToHex,
  hexToRgb,
  getContrastRatio,
} from '@tempots/beatui'

// Validation
isValidHexColor('#ff0000') // true
isValidRgbColor('rgb(255, 0, 0)') // true
isValidColor('#invalid') // false

// Normalization and conversion
normalizeHexColor('#f00') // '#ff0000'
rgbToHex(255, 0, 0) // '#ff0000'
hexToRgb('#ff0000') // { r: 255, g: 0, b: 0 }

// Accessibility
getContrastRatio('#000000', '#ffffff') // 21 (maximum contrast)
```

### Supported Color Formats

- **Hex Colors**: `#fff`, `#ffffff`, `fff`, `ffffff`
- **RGB Colors**: `rgb(255, 0, 0)`
- **RGBA Colors**: `rgba(255, 0, 0, 0.5)`
- **HSL Colors**: `hsl(0, 100%, 50%)`

### Features

- **Native HTML5 Color Input**: Uses the browser's native color picker
- **Automatic Normalization**: Hex colors are automatically normalized to 6-character format
- **Format Conversion**: Convert between hex, RGB, and other color formats
- **Validation**: Comprehensive validation for all supported color formats
- **Accessibility**: WCAG contrast ratio calculation for accessibility compliance
- **Form Integration**: Seamless integration with BeatUI's form system
- **TypeScript Support**: Full type safety with TypeScript
- **Responsive Design**: Works across all device sizes
- **Dark Mode**: Full dark mode support

### CSS Classes

The Color Swatch Input uses the following CSS classes:

- `.bc-color-swatch-input` - Main color input styling
- `.bc-input-container` - Container wrapper (inherited from InputContainer)
- `.bc-input-container--error` - Error state styling

### Browser Support

The Color Swatch Input component uses the HTML5 `<input type="color">` element, which is supported in:

- Chrome 20+
- Firefox 29+
- Safari 12.1+
- Edge 14+

For older browsers, the input will gracefully degrade to a text input.

## License

MIT

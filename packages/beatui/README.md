# BeatUI

A modern TypeScript UI component library built with [@tempots/dom](https://tempo-ts.com).

## Features

- Built with @tempots/dom for lightweight and efficient DOM manipulation
- TypeScript for type safety and better developer experience
- Vite for fast development and optimized builds
- Vitest for unit testing
- Playwright for browser testing
- Storybook for component documentation and showcasing
- ESLint and Prettier for code quality and consistent formatting
- Layered CSS architecture with design tokens
- Iconify integration for icons
- Container queries for responsive components

## Installation

```bash
npm install @beatui/core
# or
pnpm add @beatui/core
# or
yarn add @beatui/core
```

You'll also need to install the peer dependencies:

```bash
npm install @tempots/dom @tempots/std @tempots/ui
# or
pnpm add @tempots/dom @tempots/std @tempots/ui
# or
yarn add @tempots/dom @tempots/std @tempots/ui
```

## CSS Import

Import the CSS in your main CSS file or entry point:

```css
@import '@beatui/core/css';
```

Or import it in your JavaScript/TypeScript entry point:

```typescript
import '@beatui/core/css';
```

## Usage

```typescript
import { createButton, createCard } from '@beatui/core';

// Create a button
const button = createButton({
  text: 'Click me',
  variant: 'primary',
  onClick: () => console.log('Button clicked'),
});

// Create a card with the button
const card = createCard({
  title: 'My Card',
  content: 'This is a card component from BeatUI Library',
  children: [button],
});

// Add the card to the DOM
document.body.appendChild(card);
```

## Available Components

### Form Components
- Button - Interactive buttons with multiple variants
- Input - Text input fields with validation
- Checkbox - Checkbox inputs with custom styling
- Tags Input - Multi-tag input field

### Layout Components
- App Shell - Application layout structure
- Overlay - Modal and overlay components

### Data Components
- Tag - Individual tag component

## CSS Architecture

BeatUI uses a layered CSS architecture:

- `@layer reset` - CSS resets and normalizations
- `@layer base` - Base styles and design tokens
- `@layer components` - Component styles with `bc-` prefix
- `@layer variants` - Component variants and modifiers
- `@layer utilities` - Utility classes with `bu-` prefix
- `@layer overrides` - Custom overrides and exceptions

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

# Test publishing without actually publishing
pnpm run release:dry

# Show current version
pnpm run version:show
```

### Release Process

Each release script will:
1. Update the version number in package.json
2. Create a git tag for the new version
3. Run the `prepublishOnly` script (clean, build, test)
4. Publish to npm

### Release Guidelines

- **Patch releases** (0.0.1 → 0.0.2): Bug fixes, documentation updates, internal refactoring
- **Minor releases** (0.0.1 → 0.1.0): New features, new components, non-breaking API additions
- **Major releases** (0.0.1 → 1.0.0): Breaking changes, API changes, major architectural updates
- **Prerelease** (0.0.1 → 0.0.2-0): Beta/alpha versions for testing

**Note**: Prerelease versions are published with the `next` tag, so they won't be installed by default with `npm install @beatui/core`.

## License

MIT

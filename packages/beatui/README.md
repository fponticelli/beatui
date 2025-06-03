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
npm install beatui
# or
pnpm add beatui
# or
yarn add beatui
```

## Usage

```typescript
import { createButton, createCard } from 'beatui';

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

## License

MIT

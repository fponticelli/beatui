# Introduction

BeatUI is a modern TypeScript UI component library built with a focus on developer experience, accessibility, and maintainability.

## Key Features

- **TypeScript First**: Full TypeScript support with excellent type safety
- **Design Tokens**: Comprehensive token system for consistent theming
- **Layered CSS**: Modern CSS architecture using `@layer` for predictable styling
- **Accessible**: WCAG-compliant components with built-in accessibility features
- **Iconify Integration**: Seamless integration with thousands of icons
- **Container Queries**: Component-level responsive design

## Architecture

BeatUI follows a layered CSS architecture:

- `@layer reset` - CSS resets and normalizations
- `@layer base` - Base styles and design tokens
- `@layer components` - Component styles with `bc-` prefix
- `@layer variants` - Component variants and modifiers
- `@layer utilities` - Utility classes with `bu-` prefix
- `@layer overrides` - Custom overrides and exceptions

## Design Philosophy

BeatUI is designed around the principle of **progressive enhancement**:

1. Start with semantic HTML
2. Add TypeScript for behavior
3. Apply consistent design tokens
4. Use layered CSS for styling
5. Enhance with accessibility features

This approach ensures that components are robust, maintainable, and accessible by default.

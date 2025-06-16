# BeatUI Monorepo

A modern TypeScript UI component library with design tokens and layered CSS architecture.

## 📦 Packages

This monorepo contains the following packages:

- **[`@tempots/beatui`](./packages/beatui/)** - The main UI component library
- **[`@beatui/docs`](./apps/docs/)** - Documentation site built with VitePress

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd beatui

# Install dependencies
pnpm install
```

### Development

```bash
# Build all packages
pnpm build

# Run development servers
pnpm dev                    # Run all dev servers
pnpm --filter @tempots/beatui dev    # Run only BeatUI dev server
pnpm --filter @beatui/docs dev  # Run only docs dev server

# Run Storybook
pnpm --filter @tempots/beatui storybook

# Run tests
pnpm test
pnpm test:e2e
pnpm test:all

# Lint and format
pnpm lint
pnpm format
```

## 🏗️ Monorepo Structure

```
beatui/
├── packages/
│   └── beatui/              # Main UI component library
│       ├── src/             # Source code
│       ├── stories/         # Storybook stories
│       ├── tests/           # Unit and E2E tests
│       └── package.json
├── apps/
│   └── docs/                # Documentation site
│       ├── .vitepress/      # VitePress configuration
│       ├── guide/           # Documentation guides
│       ├── components/      # Component documentation
│       └── package.json
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspace configuration
└── package.json             # Root package.json
```

## 🛠️ Technology Stack

- **Build System**: Turborepo for monorepo management
- **Package Manager**: pnpm with workspaces
- **UI Library**: TypeScript + Vite + Tempo DOM
- **Documentation**: VitePress
- **Testing**: Vitest + Playwright
- **Styling**: Layered CSS with design tokens
- **Icons**: Iconify integration

## 📚 Documentation

Visit the [documentation site](./apps/docs/) for:

- Getting started guide
- Component documentation
- Design system guidelines
- API reference

## 🎨 Design System

BeatUI follows a layered CSS architecture:

- `@layer reset` - CSS resets and normalizations
- `@layer base` - Base styles and design tokens
- `@layer components` - Component styles (bc- prefix)
- `@layer variants` - Component variants and modifiers
- `@layer utilities` - Utility classes (bu- prefix)
- `@layer overrides` - Custom overrides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

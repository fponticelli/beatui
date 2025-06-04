# Installation

## Package Manager

Install BeatUI using your preferred package manager:

::: code-group

```bash [pnpm]
pnpm add @tempots/beatui
```

```bash [npm]
npm install @tempots/beatui
```

```bash [yarn]
yarn add @tempots/beatui
```

:::

## Dependencies

BeatUI has the following peer dependencies:

- `@tempots/dom` - DOM utilities and reactive framework
- `@tempots/ui` - Base UI utilities
- `@tempots/std` - Standard library utilities

These will be automatically installed when you install BeatUI.

## CSS Import

Import the BeatUI CSS in your main CSS file or entry point:

```css
@import '@tempots/beatui/css';
```

Or import it in your JavaScript/TypeScript entry point:

```typescript
import '@tempots/beatui/css';
```

## TypeScript Configuration

If you're using TypeScript, make sure your `tsconfig.json` includes the necessary configuration:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

## Vite Configuration

For Vite projects, you may want to add the following to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

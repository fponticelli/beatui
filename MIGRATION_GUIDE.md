# Migration Guide: Tailwind to BEM + CSS Variables

This guide outlines the migration from Tailwind CSS 4 to a BEM (Block Element Modifier) methodology with CSS variables for the Tempo UI Library.

## Overview

The migration replaces Tailwind's utility-first approach with:
- **Pure BEM methodology** - Single, consistent class naming strategy
- **CSS variables** for dynamic theming and runtime customization
- **TypeScript-generated CSS** for type safety and build-time optimization
- **All 22 color variants** with complete shade support
- **Maintained component APIs** to minimize breaking changes
- **Simplified architecture** - No hybrid strategies, just clean BEM

## Key Changes

### 1. Theme System Architecture

**Before (Tailwind):**
```typescript
// Generated Tailwind classes like 'bg-sky-600 text-white border-transparent'
const classes = [
  'transition',
  'font-semibold',
  'border',
  bgColors[color][mainShade].normal,
  textColors[color][shade].normal
].join(' ')
```

**After (Pure BEM + CSS Variables):**
```typescript
// Clean BEM classes with CSS variables
const color = getColor(colorName) // 'sky', 'purple', 'green', etc.
const className = buttonBEMClass(variant, size, color, roundedness, disabled, fill)
// Results in: 'tempo-button tempo-button--size-medium tempo-button--variant-filled tempo-button--color-sky tempo-button--rounded-medium'
```

### 2. CSS Variable System

**CSS Variables Definition:**
```typescript
// src/components/theme/css-variables.ts
export const colorScales = {
  sky: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    600: '#0284c7',
    // ...
  }
}
```

**Generated CSS:**
```css
:root {
  --color-sky-50: #f0f9ff;
  --color-sky-500: #0ea5e9;
  --color-sky-600: #0284c7;
}

.tempo-button--variant-filled--color-sky {
  background-color: var(--color-sky-600);
  color: white;
}
```

### 3. BEM Class Structure

**Component Structure:**
- **Block**: `.tempo-button` (base component)
- **Element**: `.tempo-button__icon` (sub-component)
- **Modifier**: `.tempo-button--size-large` (variations)

**Examples:**
```css
/* Block */
.tempo-button { /* base styles */ }

/* Element */
.tempo-button__icon { /* icon styles */ }

/* Modifiers */
.tempo-button--size-small { /* small size */ }
.tempo-button--variant-filled { /* filled variant */ }
.tempo-button--color-sky { /* sky color */ }
.tempo-button--disabled { /* disabled state */ }
```

## Migration Steps

### Phase 1: Infrastructure Setup ✅

1. **Created CSS Variable System**
   - `src/components/theme/css-variables.ts` - Variable definitions
   - `src/components/theme/css-generator.ts` - CSS generation logic
   - `src/components/theme/bem-classes.ts` - BEM utilities

2. **Updated Build System**
   - Removed Tailwind dependencies from `package.json`
   - Added Vite plugin for CSS generation with file watching
   - Updated build scripts

3. **Created New Theme Provider**
   - `src/components/theme/theme-system.ts` - Pure BEM theme system
   - Maintains API compatibility with existing theme

4. **Development File Watching** ✅
   - Automatic CSS regeneration when theme files change
   - Debounced updates (300ms) to prevent excessive rebuilds
   - Browser auto-reload on CSS changes
   - Integrated with Vite's file watcher for optimal performance

### Phase 2: Component Migration

#### Button Component Migration

**Before:**
```typescript
// Tailwind classes generated dynamically
classes.push(bgColors[color][mainShade].normal)
classes.push(textColors[color][shade].normal)
```

**After:**
```typescript
// BEM classes with modifiers
const modifiers = [
  commonModifiers.size(size),
  commonModifiers.variant(variant),
  commonModifiers.color(color),
  getRoundedness(roundedness),
  ...conditionalModifiers({ disabled, fill })
]
return buttonBEM.block(modifiers)
```

#### Icon Component Migration

**Before:**
```typescript
// Tailwind utility classes
attr.class('w-4 h-4 inline-block')
```

**After:**
```typescript
// BEM classes
const modifiers = [
  commonModifiers.size(size),
  ...(color ? [commonModifiers.color(color)] : [])
]
return iconBEM.block(modifiers)
```

### Phase 3: Advanced Features

#### Runtime Theming

**CSS Variable Updates:**
```typescript
// Update theme colors at runtime
document.documentElement.style.setProperty('--color-primary-500', '#custom-color')

// Or use the theme utilities
const theme = useTheme()
theme.updateColors({
  primary: '#custom-color'
})
```

#### Dynamic CSS Generation

**Build-time Generation:**
```bash
npm run generate:css  # Generates CSS from TypeScript
```

**Runtime Generation:**
```typescript
import { generateCompleteCSS } from './theme/css-generator'

const { complete } = generateCompleteCSS()
// Inject CSS into page or save to file
```

## API Compatibility

### Maintained APIs

The following component APIs remain unchanged:

```typescript
// Button - same API
Button({
  variant: 'filled',
  size: 'medium',
  color: 'primary',
  disabled: false,
  onClick: () => {}
})

// Icon - same API
Icon({
  icon: 'icon-[line-md--close]',
  size: 'medium'
})
```

### Theme Provider

```typescript
// Same provider usage
Use(ThemeProvider, ({ theme }) => {
  return html.button(
    attr.class(theme.button({
      variant: 'filled',
      size: 'medium',
      color: 'primary',
      disabled: false
    }))
  )
})
```

## Benefits

### 1. **Better Performance**
- Smaller CSS bundle (no unused Tailwind utilities)
- CSS variables enable efficient runtime theming
- Build-time CSS generation

### 2. **Improved Developer Experience**
- Type-safe theme definitions
- Better component organization with BEM
- Easier debugging with semantic class names

### 3. **Enhanced Theming**
- Runtime color scheme switching
- CSS variable-based customization
- Consistent design tokens

### 4. **Maintainability**
- Clear component boundaries
- Predictable class naming
- Easier style overrides

## Breaking Changes

### Minimal Breaking Changes

1. **CSS Class Names**: Internal class names changed from Tailwind utilities to BEM classes
2. **Build Process**: New CSS generation step required
3. **Dependencies**: Tailwind packages removed

### Non-Breaking

- Component APIs remain the same
- Theme provider interface unchanged
- Existing component usage works without changes

## Development Workflow

### File Watching in Development

When running `npm run dev`, the system automatically:

1. **Generates initial CSS** from TypeScript definitions
2. **Watches theme files** for changes:
   - `src/components/theme/css-variables.ts`
   - `src/components/theme/css-generator.ts`
   - `src/components/theme/bem-classes.ts`
   - `src/components/theme/theme-system.ts`
3. **Regenerates CSS** when files change (debounced to 300ms)
4. **Reloads browser** automatically to show changes

### Console Output Example

```bash
🎨 Generating initial CSS for development...
✅ Generated: dist/tempo-ui-lib.css (32.33 KB)
✅ Generated: dist/variables.css (8.40 KB)
👀 Watching theme files for changes...
   - src/components/theme/css-variables.ts
   - src/components/theme/css-generator.ts
   - src/components/theme/bem-classes.ts
   - src/components/theme/theme-system.ts

🔄 Theme file changed: src/components/theme/css-variables.ts
🎨 Regenerating CSS...
✅ CSS regenerated and browser notified
```

### Making Theme Changes

1. **Edit any theme file** (variables, generator, BEM classes, etc.)
2. **Save the file** - CSS regenerates automatically
3. **Browser reloads** - Changes are visible immediately
4. **No manual build step** required during development

## Next Steps

1. **Test the migration** with existing components
2. **Update documentation** to reflect new architecture
3. **Add runtime theming utilities** for advanced customization
4. **Optimize CSS generation** for production builds
5. **Add component-specific CSS** for remaining components

## Rollback Plan

If issues arise, rollback is possible by:
1. Reverting `package.json` dependencies
2. Restoring `vite.config.ts` Tailwind configuration
3. Switching theme provider back to `default-theme.ts`
4. Keeping BEM system as optional enhancement

The migration maintains backward compatibility while providing a path forward to a more maintainable and performant styling system.

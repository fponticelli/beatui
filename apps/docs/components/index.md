# Components

BeatUI provides a comprehensive set of UI components built with TypeScript and modern CSS.

## Component Categories

### Form Components
- [Button](/components/button) - Interactive buttons with multiple variants
- [Input](/components/input) - Text input fields with validation
- [Checkbox](/components/checkbox) - Checkbox inputs with custom styling

### Layout Components
- [App Shell](/components/app-shell) - Application layout structure
- [Overlay](/components/overlay) - Modal and overlay components

### Data Components
- [Tag](/components/tag) - Individual tag component
- [Tags Input](/components/tags-input) - Multi-tag input field

## Usage Pattern

All BeatUI components follow a consistent usage pattern:

```typescript
import { createButton } from 'beatui';

// Create component with options
const button = createButton({
  text: 'Click me',
  variant: 'primary',
  onClick: () => console.log('Clicked!')
});

// Append to DOM
document.body.appendChild(button);
```

## Styling

Components use the BeatUI CSS architecture with layered styles:

- Base styles are applied automatically
- Variants can be specified via options
- Custom styling can be added via CSS classes
- Design tokens ensure consistency

## Accessibility

All components are built with accessibility in mind:

- Semantic HTML structure
- ARIA attributes where appropriate
- Keyboard navigation support
- Screen reader compatibility
- Focus management

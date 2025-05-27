# Tempo UI Library

A modern UI component library built with [@tempots/dom](https://tempo-ts.com).

## Features

- Built with @tempots/dom for lightweight and efficient DOM manipulation
- TypeScript for type safety and better developer experience
- Vite for fast development and optimized builds
- Vitest for unit testing
- Playwright for browser testing
- Storybook for component documentation and showcasing
- ESLint and Prettier for code quality and consistent formatting

## Installation

```bash
npm install tempo-ui-lib
```

## Usage

```typescript
import { Button, Card } from 'tempo-ui-lib';

// Create a button
const button = Button({
  text: 'Click me',
  variant: 'primary',
  onClick: () => console.log('Button clicked'),
});

// Create a card with the button
const card = Card({
  title: 'My Card',
  content: 'This is a card component from Tempo UI Library',
  children: [button],
});

// Add the card to the DOM
document.body.appendChild(card);
```

## Available Components

### Button

```typescript
import { Button } from 'tempo-ui-lib';

const button = Button({
  text: 'Click me',
  variant: 'primary', // 'primary' | 'secondary' | 'outline' | 'text'
  size: 'medium', // 'small' | 'medium' | 'large'
  disabled: false,
  onClick: (event) => console.log('Button clicked', event),
});
```

### Card

```typescript
import { Card } from 'tempo-ui-lib';

const card = Card({
  title: 'Card Title',
  content: 'Card content goes here',
  shadow: true,
  className: 'custom-class',
  children: [/* HTMLElements */],
});
```

## Development

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd tempo-ui-lib

# Install dependencies
npm install
```

### Development Commands

```bash
# Start development server
npm run dev

# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run browser tests
npm run test:e2e

# Run linting
npm run lint

# Format code
npm run format

# Start Storybook
npm run storybook

# Build the library
npm run build

# Build Storybook
npm run build-storybook
```

## License

ISC

## TODO

### Important

- [ ] Layout
  - [ ] Center
  - [ ] Container
  - [ ] Group
  - [ ] Stack
  - [ ] Table
- [ ] Feedback
  - [ ] Alert
  - [ ] Load
  - [ ] Notification
- [ ] Inputs
- [ ] Forms
- [ ] Combobox
- [ ] Navigation
  - [ ] Anchor
  - [ ] NavLink
  - [ ] Tabs
- [ ] Overlays
  - [ ] Dialog
  - [ ] Drawer
  - [ ] FloatingIndicator
  - [ ] HoverCard
  - [ ] Menu
  - [ ] Modal
  - [ ] Popover
  - [ ] Tooltip
- [ ] DataDisplay
  - [ ] Badge
  - [ ] Card
  - [ ] NumberFormatter
- [ ] Typography
  - [ ] Text
  - [ ] Title
  - [ ] Blockquote
  - [ ] Code
  - [ ] List
- [ ] Miscellaneous
  - [ ] Divider

### Secondary

- [ ] Layout
  - [ ] Space
  - [ ] Flex
  - [ ] Grid
  - [ ] Collapse
- [ ] Navigation
  - [ ] Pagination
  - [ ] Breadcrumbs
  - [ ] Tree
  - [ ] Stepper
  - [ ] Burger
- [ ] Feedback
  - [ ] Skeleton
  - [ ] Progress
  - [ ] RingProgress
  - [ ] SemiCircleProgress
- [ ] Overlays
  - [ ] Affix
  - [ ] LoadingOverlay
- [ ] DataDisplay
  - [ ] Accordion
  - [ ] Avatar
  - [ ] Indicator
  - [ ] Kbd
- [ ] Typography
  - [ ] Highlight / Mark

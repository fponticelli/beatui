export interface WidgetMeta {
  id: string
  label: string
  category: string
  route: string
}

export const categories = [
  'Foundation',
  'Navigation',
  'Data Display',
  'Feedback',
] as const

export type WidgetCategory = (typeof categories)[number]

export const widgets: WidgetMeta[] = [
  // Foundation
  { id: 'buttons', label: 'Buttons', category: 'Foundation', route: '/buttons' },
  { id: 'badges-tags', label: 'Badges & Tags', category: 'Foundation', route: '/badges-tags' },
  { id: 'inputs', label: 'Inputs', category: 'Foundation', route: '/inputs' },
  { id: 'selects', label: 'Selects', category: 'Foundation', route: '/selects' },
  { id: 'checkboxes-toggles', label: 'Checkboxes & Toggles', category: 'Foundation', route: '/checkboxes-toggles' },
  { id: 'radio-groups', label: 'Radio Groups', category: 'Foundation', route: '/radio-groups' },

  // Navigation
  { id: 'tabs', label: 'Tabs', category: 'Navigation', route: '/tabs' },
  { id: 'breadcrumbs', label: 'Breadcrumbs', category: 'Navigation', route: '/breadcrumbs' },
  { id: 'pagination', label: 'Pagination', category: 'Navigation', route: '/pagination' },

  // Data Display
  { id: 'progress-loading', label: 'Progress & Loading', category: 'Data Display', route: '/progress-loading' },
  { id: 'dividers', label: 'Dividers', category: 'Data Display', route: '/dividers' },
  { id: 'avatar', label: 'Avatar', category: 'Data Display', route: '/avatar' },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', category: 'Data Display', route: '/keyboard-shortcuts' },
  { id: 'empty-states', label: 'Empty States', category: 'Data Display', route: '/empty-states' },

  // Feedback
  { id: 'tooltips', label: 'Tooltips', category: 'Feedback', route: '/tooltips' },
]

export function getWidgetsByCategory(category: string): WidgetMeta[] {
  return widgets.filter(w => w.category === category)
}

export function getAdjacentWidgets(id: string): { prev: WidgetMeta | undefined; next: WidgetMeta | undefined } {
  const index = widgets.findIndex(w => w.id === id)
  return {
    prev: index > 0 ? widgets[index - 1] : undefined,
    next: index < widgets.length - 1 ? widgets[index + 1] : undefined,
  }
}

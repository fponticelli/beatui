// Example uses x:ui vendor extension as per roadmap; not wired in selector to avoid strict AJV errors.
export default {
  type: 'object',
  title: 'x:ui vendor extension examples',
  description:
    'Demonstrates x:ui in both string and object form (requires AJV to accept x:ui).',
  // Container-level x:ui for layout (object shape)
  'x:ui': { format: 'grid', columns: 2 },
  properties: {
    title: { type: 'string', title: 'Title' },
    // Prefer markdown widget (object shape)
    description: {
      type: 'string',
      title: 'Description',
      'x:ui': { format: 'markdown', placeholder: 'Write details...' },
    },
    // String form (canonical widget id)
    notes: { type: 'string', title: 'Notes', 'x:ui': 'textarea' },
  },
  required: ['title'],
  additionalProperties: false,
}

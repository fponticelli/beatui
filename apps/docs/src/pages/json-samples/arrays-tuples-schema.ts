export default {
  type: 'object',
  title: 'Arrays: Tuple, Contains, Constraints',
  description:
    'Shows Draft-07 style tuple arrays (items:[] + additionalItems) plus contains/minContains/uniqueItems',
  properties: {
    tupleProfile: {
      type: 'array',
      title: 'Tuple Profile',
      description:
        'First Name, Last Name, Age are positional. Extra trailing items are notes (strings).',
      items: [
        { type: 'string', title: 'First Name' },
        { type: 'string', title: 'Last Name' },
        { type: 'integer', title: 'Age', minimum: 0 },
      ],
      additionalItems: { type: 'string', title: 'Note' },
      minItems: 3,
      maxItems: 5,
    },
    numbers: {
      type: 'array',
      title: 'Numbers (must contain >= 10)',
      items: { type: 'integer' },
      contains: { type: 'integer', minimum: 10 },
      minContains: 1,
      minItems: 3,
      uniqueItems: true,
    },
  },
  additionalProperties: false,
}


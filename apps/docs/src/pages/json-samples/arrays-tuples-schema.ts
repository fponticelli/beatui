export default {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Arrays: Tuple, Contains, Constraints',
  description:
    'Shows 2020-12 tuple arrays (prefixItems + items) plus contains/minContains/uniqueItems',
  properties: {
    tupleProfile: {
      type: 'array',
      title: 'Tuple Profile',
      description:
        'First Name, Last Name, Age are positional. Extra trailing items are notes (strings).',
      prefixItems: [
        { type: 'string', title: 'First Name' },
        { type: 'string', title: 'Last Name' },
        { type: 'integer', title: 'Age', minimum: 0 },
      ],
      items: { type: 'string', title: 'Note' },
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

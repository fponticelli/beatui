export default {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: '2020-12: prefixItems + items',
  description:
    'Demonstrates tuple arrays using 2020-12 prefixItems with a homogeneous tail via items.',
  properties: {
    event: {
      type: 'array',
      title: 'Event tuple [date, level, message, ...tags]',
      prefixItems: [
        { type: 'string', format: 'date-time', title: 'Date' },
        { enum: ['info', 'warn', 'error'], title: 'Level' },
        { type: 'string', minLength: 1, title: 'Message' },
      ],
      items: { type: 'string', title: 'Tag' },
      minItems: 3,
      maxItems: 6,
      description: 'First three items are fixed; any additional are string tags.',
    },
  },
  required: ['event'],
  additionalProperties: false,
}


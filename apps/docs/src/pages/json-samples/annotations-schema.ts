export default {
  type: 'object',
  title: 'Annotations: readOnly, writeOnly, deprecated',
  description:
    'Exercises visibility/disabled logic driven by annotations. Actual runtime behavior depends on implementation.',
  properties: {
    id: {
      type: 'string',
      title: 'ID',
      readOnly: true,
      description: 'Server-assigned',
    },
    secret: {
      type: 'string',
      title: 'Secret',
      writeOnly: true,
      description: 'Never displayed back',
    },
    notes: {
      type: 'string',
      title: 'Notes',
      deprecated: true,
      description: 'Deprecated field',
    },
    name: { type: 'string', title: 'Name' },
  },
  required: ['name'],
  additionalProperties: false,
}

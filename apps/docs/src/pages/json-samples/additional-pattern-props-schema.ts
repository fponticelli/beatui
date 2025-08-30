export default {
  type: 'object',
  title: 'Additional & Pattern Properties',
  description:
    'Allows arbitrary extra keys as strings, but keys starting with x- must be non-negative integers. Key names are restricted by a pattern.',
  properties: {
    baseName: { type: 'string', title: 'Base Name', minLength: 1 },
  },
  required: ['baseName'],
  patternProperties: {
    '^x-': { type: 'integer', minimum: 0, title: 'x-* numeric' },
  },
  // Any other additional property must be a string
  additionalProperties: { type: 'string', title: 'Additional string value' },
  propertyNames: {
    type: 'string',
    // Start with letter, then letters/numbers/_/-
    pattern: '^[A-Za-z][A-Za-z0-9_-]*$',
  },
  minProperties: 1,
  maxProperties: 10,
}


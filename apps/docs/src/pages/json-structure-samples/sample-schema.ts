export default {
  $schema: 'https://json-structure.org/draft/2024-01/schema',
  $id: 'example',
  name: 'Contact Form',
  type: 'object',
  properties: {
    name: { type: 'string', name: 'Full Name' },
    email: { type: 'string', format: 'email', name: 'Email' },
    age: { type: 'uint8', name: 'Age' },
    subscribe: { type: 'boolean', name: 'Subscribe to newsletter' },
  },
  additionalProperties: false,
  required: ['name', 'email'],
}

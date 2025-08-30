export default {
  type: 'object',
  $defs: {
    address_def: {
      type: 'object',
      title: 'Address',
      properties: {
        street: { type: 'string', title: 'Street' },
        city: { type: 'string', title: 'City' },
      },
      required: ['street', 'city'],
      additionalProperties: false,
    },
  },
  properties: {
    name: {
      type: 'string',
      title: 'Name',
      description: 'Your full name',
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email',
      description: 'Your email address',
    },
    birthdate: {
      type: 'string',
      format: 'date',
      description: 'Your birthdate',
    },
    image: {
      type: 'string',
      title: 'Image',
      format: 'binary',
      description: 'Your profile image',
      contentMediaType: 'image/*',
    },
    description: {
      type: 'string',
      title: 'Description',
      'ui:widget': 'markdown',
      description: 'A brief description of yourself',
    },
    age: { type: 'integer', title: 'Age', minimum: 18 },
    isActive: { type: 'boolean', title: 'Active' },
    // Use $ref and override a sibling (title) to demonstrate sibling-override merge
    address: { $ref: '#/$defs/address_def', title: 'Home Address' },
    tags: { type: 'array', title: 'Tags', items: { type: 'string' } },
  },
  required: ['name'],
  additionalProperties: false,
}

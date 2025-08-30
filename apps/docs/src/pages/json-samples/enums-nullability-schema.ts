export default {
  type: 'object',
  title: 'Enums, Const, Nullability',
  description:
    'Demonstrates enum/const inputs and nullable handling via type: [T, "null"] pattern.',
  properties: {
    status: {
      type: 'string',
      enum: ['draft', 'published', 'archived'],
      title: 'Status',
      default: 'draft',
    },
    role: {
      const: 'admin',
      title: 'Role (const)',
      description: 'Fixed constant value to test const rendering',
    },
    nickname: {
      type: ['string', 'null'],
      title: 'Nickname (nullable string)',
      description: 'Optional and can be set to null explicitly',
    },
    tags: {
      type: 'array',
      title: 'Tags (enum items)',
      items: { enum: ['a', 'b', 'c', 'd'] },
      uniqueItems: true,
      minItems: 0,
    },
  },
  required: ['status', 'role'],
  additionalProperties: false,
}


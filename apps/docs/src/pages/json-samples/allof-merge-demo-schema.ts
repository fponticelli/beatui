export default {
  type: 'object',
  title: 'allOf Merge Strategy Demo',
  description:
    'Demonstrates how allOf branches are merged with conflict detection',

  // This allOf will demonstrate successful merging
  allOf: [
    {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          title: 'Name',
          description: 'User name',
        },
        email: {
          type: 'string',
          format: 'email',
          title: 'Email',
        },
      },
      required: ['name'],
    },
    {
      type: 'object',
      properties: {
        age: {
          type: 'number',
          minimum: 0,
          maximum: 150,
          title: 'Age',
        },
        phone: {
          type: 'string',
          title: 'Phone Number',
        },
      },
      required: ['age'],
    },
    {
      type: 'object',
      properties: {
        preferences: {
          type: 'object',
          properties: {
            theme: {
              type: 'string',
              enum: ['light', 'dark', 'auto'],
              default: 'auto',
              title: 'Theme Preference',
            },
            notifications: {
              type: 'boolean',
              default: true,
              title: 'Enable Notifications',
            },
          },
        },
      },
      required: ['email'], // This will be merged with other required arrays
    },
  ],

  // Additional properties to test merging
  additionalProperties: false,

  // Example data for testing
  examples: [
    {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      phone: '+1-555-0123',
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    },
  ],
}

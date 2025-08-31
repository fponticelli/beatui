export default {
  type: 'object',
  title: 'Not Violations Demo',
  description: 'Demonstrates not schema violations detection',
  properties: {
    username: {
      type: 'string',
      title: 'Username',
      description: 'Must not be a reserved word',
      not: {
        title: 'reserved word',
        enum: ['admin', 'root', 'system', 'user', 'guest'],
      },
    },
    email: {
      type: 'string',
      format: 'email',
      title: 'Email',
      description: 'Must not be from blocked domains',
      not: {
        title: 'blocked domain',
        pattern: '@(spam|blocked|temp)\\.com$',
      },
    },
    age: {
      type: 'number',
      title: 'Age',
      description: 'Must not be in restricted range',
      minimum: 0,
      maximum: 150,
      not: {
        title: 'restricted age range',
        minimum: 13,
        maximum: 17,
      },
    },
    profile: {
      type: 'object',
      title: 'Profile',
      properties: {
        bio: {
          type: 'string',
          title: 'Bio',
        },
        website: {
          type: 'string',
          format: 'uri',
          title: 'Website',
        },
      },
      not: {
        title: 'empty profile',
        properties: {
          bio: { maxLength: 0 },
          website: { maxLength: 0 },
        },
        additionalProperties: false,
      },
    },
  },
  required: ['username', 'email'],

  // Example data that will trigger violations
  examples: [
    {
      username: 'admin', // Violates not constraint
      email: 'user@spam.com', // Violates not constraint
      age: 15, // Violates not constraint (in restricted range)
      profile: {
        bio: '',
        website: '',
      }, // Violates not constraint (empty profile)
    },
    {
      username: 'john_doe', // Valid
      email: 'john@example.com', // Valid
      age: 25, // Valid
      profile: {
        bio: 'Software developer',
        website: 'https://johndoe.dev',
      }, // Valid
    },
  ],
}

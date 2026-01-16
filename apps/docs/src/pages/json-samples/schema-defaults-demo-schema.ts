/**
 * Schema Defaults Demo
 *
 * Demonstrates the applySchemaDefaults feature which automatically
 * populates form values from schema `default` properties (with `examples[0]`
 * as fallback).
 */
export default {
  type: 'object',
  title: 'Schema Defaults Demo',
  description:
    'This form demonstrates automatic population of default values from the schema. ' +
    'When loaded with empty data, all fields with defaults are pre-filled.',

  properties: {
    // String with default
    username: {
      type: 'string',
      title: 'Username',
      description: 'Has default: "guest_user"',
      default: 'guest_user',
      minLength: 3,
    },

    // String with examples fallback (no default)
    nickname: {
      type: 'string',
      title: 'Nickname',
      description:
        'No default, but has examples - will use first example: "CoolUser123"',
      examples: ['CoolUser123', 'AwesomePerson', 'TestNick'],
    },

    // String without default or examples
    bio: {
      type: 'string',
      title: 'Bio',
      description: 'No default or examples - will be empty',
      'x:ui': 'textarea',
    },

    // Number with default
    age: {
      type: 'integer',
      title: 'Age',
      description: 'Has default: 25',
      default: 25,
      minimum: 0,
      maximum: 150,
    },

    // Boolean with default
    subscribeNewsletter: {
      type: 'boolean',
      title: 'Subscribe to Newsletter',
      description: 'Has default: true',
      default: true,
    },

    // Enum with default
    theme: {
      type: 'string',
      title: 'Theme Preference',
      description: 'Has default: "system"',
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },

    // Nested object with defaults
    settings: {
      type: 'object',
      title: 'Settings',
      description: 'Nested object with property defaults',
      properties: {
        language: {
          type: 'string',
          title: 'Language',
          description: 'Has default: "en"',
          enum: ['en', 'es', 'fr', 'de', 'ja'],
          default: 'en',
        },
        timezone: {
          type: 'string',
          title: 'Timezone',
          description: 'Has default: "UTC"',
          default: 'UTC',
        },
        notifications: {
          type: 'object',
          title: 'Notification Settings',
          properties: {
            email: {
              type: 'boolean',
              title: 'Email Notifications',
              description: 'Has default: true',
              default: true,
            },
            push: {
              type: 'boolean',
              title: 'Push Notifications',
              description: 'Has default: false',
              default: false,
            },
            frequency: {
              type: 'string',
              title: 'Notification Frequency',
              description: 'Has default: "daily"',
              enum: ['realtime', 'hourly', 'daily', 'weekly'],
              default: 'daily',
            },
          },
        },
      },
    },

    // Array - should NOT be auto-populated (by design)
    tags: {
      type: 'array',
      title: 'Tags',
      description: 'Arrays are NOT auto-populated (users add items manually)',
      items: {
        type: 'string',
      },
    },
  },

  required: ['username'],
  additionalProperties: false,
}

/**
 * JSON Structure Defaults Demo
 *
 * Demonstrates the applySchemaDefaults feature which automatically
 * populates form values from schema `default` properties (with `examples[0]`
 * as fallback).
 */
export default {
  $schema: 'https://json-structure.org/draft/2024-01/schema',
  $id: 'defaults-demo',
  name: 'Schema Defaults Demo',
  description:
    'This form demonstrates automatic population of default values from the schema.',
  type: 'object',

  properties: {
    // String with default
    username: {
      type: 'string',
      name: 'Username',
      description: 'Has default: "guest_user"',
      default: 'guest_user',
      minLength: 3,
    },

    // String with examples fallback (no default)
    nickname: {
      type: 'string',
      name: 'Nickname',
      description: 'Uses examples[0]: "CoolUser123"',
      examples: ['CoolUser123', 'AwesomePerson'],
    },

    // String without default
    bio: {
      type: 'string',
      name: 'Bio',
      description: 'No default - will be empty',
      'x:ui': 'textarea',
    },

    // Integer with default
    age: {
      type: 'uint8',
      name: 'Age',
      description: 'Has default: 25',
      default: 25,
    },

    // Boolean with default
    subscribeNewsletter: {
      type: 'boolean',
      name: 'Subscribe to Newsletter',
      description: 'Has default: true',
      default: true,
    },

    // Enum with default
    theme: {
      type: 'string',
      name: 'Theme Preference',
      description: 'Has default: "system"',
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },

    // Nested object with defaults
    settings: {
      type: 'object',
      name: 'Settings',
      description: 'Nested object with property defaults',
      properties: {
        language: {
          type: 'string',
          name: 'Language',
          description: 'Has default: "en"',
          enum: ['en', 'es', 'fr', 'de', 'ja'],
          default: 'en',
        },
        timezone: {
          type: 'string',
          name: 'Timezone',
          description: 'Has default: "UTC"',
          default: 'UTC',
        },
        notifications: {
          type: 'object',
          name: 'Notification Settings',
          properties: {
            email: {
              type: 'boolean',
              name: 'Email Notifications',
              description: 'Has default: true',
              default: true,
            },
            push: {
              type: 'boolean',
              name: 'Push Notifications',
              description: 'Has default: false',
              default: false,
            },
          },
        },
      },
    },

    // Array - should NOT be auto-populated
    tags: {
      type: 'array',
      name: 'Tags',
      description: 'Arrays are NOT auto-populated',
      items: {
        type: 'string',
      },
    },
  },

  required: ['username'],
  additionalProperties: false,
}

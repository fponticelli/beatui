export default {
  $schema: 'https://json-structure.org/draft/2024-01/schema',
  $id: 'user-profile',
  name: 'User Profile',
  type: 'object',
  properties: {
    username: { type: 'string', name: 'Username', minLength: 3, maxLength: 20 },
    email: { type: 'string', format: 'email', name: 'Email Address' },
    age: { type: 'uint8', name: 'Age', minimum: 13, maximum: 120 },
    bio: { type: 'string', name: 'Biography', 'x:ui': 'textarea' },
    website: { type: 'string', format: 'uri', name: 'Website' },
    interests: {
      type: 'array',
      name: 'Interests',
      items: { type: 'string' },
    },
    preferences: {
      type: 'object',
      name: 'Preferences',
      properties: {
        notifications: { type: 'boolean', name: 'Enable Notifications' },
        theme: {
          type: 'string',
          name: 'Theme',
          enum: ['light', 'dark', 'auto'],
          enumNames: ['Light', 'Dark', 'Auto'],
        },
      },
      additionalProperties: false,
    },
    // Discriminated union example using choice type with selector
    paymentMethod: {
      type: 'choice',
      name: 'Payment Method',
      description: 'Choose your preferred payment method',
      selector: 'method', // discriminator field
      choices: {
        creditCard: {
          type: 'object',
          name: 'Credit Card',
          properties: {
            cardNumber: { type: 'string', name: 'Card Number', minLength: 16, maxLength: 19 },
            expiryDate: { type: 'string', name: 'Expiry Date', format: 'date' },
            cvv: { type: 'string', name: 'CVV', minLength: 3, maxLength: 4 },
          },
          additionalProperties: false,
          required: ['cardNumber', 'expiryDate', 'cvv'],
        },
        bankAccount: {
          type: 'object',
          name: 'Bank Account',
          properties: {
            accountNumber: { type: 'string', name: 'Account Number' },
            routingNumber: { type: 'string', name: 'Routing Number' },
            accountType: {
              type: 'string',
              name: 'Account Type',
              enum: ['checking', 'savings'],
              enumNames: ['Checking', 'Savings'],
            },
          },
          additionalProperties: false,
          required: ['accountNumber', 'routingNumber'],
        },
        paypal: {
          type: 'object',
          name: 'PayPal',
          properties: {
            paypalEmail: { type: 'string', name: 'PayPal Email', format: 'email' },
          },
          additionalProperties: false,
          required: ['paypalEmail'],
        },
      },
    },
  },
  additionalProperties: false,
  required: ['username', 'email'],
}

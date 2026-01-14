export default {
  $schema: 'https://json-structure.org/draft/2024-01/schema',
  $id: 'contact-form',
  name: 'Contact Form',
  type: 'object',
  properties: {
    firstName: { type: 'string', name: 'First Name', minLength: 1 },
    lastName: { type: 'string', name: 'Last Name', minLength: 1 },
    email: { type: 'string', format: 'email', name: 'Email Address' },
    phone: { type: 'string', name: 'Phone Number' },
    message: { type: 'string', name: 'Message', 'x:ui': 'textarea' },
    contactMethod: {
      type: 'string',
      name: 'Preferred Contact Method',
      enum: ['email', 'phone', 'sms'],
      enumNames: ['Email', 'Phone Call', 'Text Message'],
    },
  },
  additionalProperties: false,
  required: ['firstName', 'lastName', 'email', 'message'],
}

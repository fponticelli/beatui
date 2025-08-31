export default {
  type: 'object',
  title: 'Unions and Conditionals',
  description:
    'Demonstrates oneOf branch selection plus if/then/else and dependentRequired',
  properties: {
    paymentMethod: {
      title: 'Payment Method',
      oneOf: [
        { const: 'card', title: 'Card' },
        { const: 'paypal', title: 'PayPal' },
      ],
    },
    // Shown when paymentMethod = card
    card: {
      type: 'object',
      title: 'Card Details',
      properties: {
        cardNumber: {
          type: 'string',
          title: 'Card Number',
          pattern: '^[0-9]{13,19}$',
        },
        cvv: { type: 'string', title: 'CVV', minLength: 3, maxLength: 4 },
        holder: { type: 'string', title: 'Card Holder' },
      },
      required: ['cardNumber', 'cvv'],
      additionalProperties: false,
    },
    // Shown when paymentMethod = paypal
    paypalEmail: {
      type: 'string',
      title: 'PayPal Email',
      format: 'email',
    },

    // Dependencies example
    newsletter: { type: 'boolean', title: 'Subscribe to newsletter' },
    email: { type: 'string', title: 'Contact Email', format: 'email' },
  },
  required: ['paymentMethod'],
  additionalProperties: false,

  // If card is chosen, require `card`; otherwise require `paypalEmail`
  if: {
    properties: { paymentMethod: { const: 'card' } },
  },
  then: { required: ['card'] },
  else: { required: ['paypalEmail'] },

  // When newsletter is present and true, require email
  dependentRequired: {
    newsletter: ['email'],
  },
}

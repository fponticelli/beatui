export default {
  type: 'object',
  title: 'Composition, $ref, not, dependentSchemas',
  description:
    'Combines allOf overlays with if/then, anyOf, not, $ref, and dependentSchemas to exercise composition behaviors.',
  $defs: {
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        country: { type: 'string', minLength: 2 },
      },
      required: ['street', 'city'],
      additionalProperties: false,
    },
  },
  properties: {
    name: { type: 'string', title: 'Product Name', minLength: 1 },
    kind: { enum: ['physical', 'digital'], title: 'Kind' },
    price: { type: 'number', minimum: 0, title: 'Price' },

    // Branch-specific fields
    shippingWeight: {
      type: 'number',
      title: 'Shipping Weight (kg)',
      minimum: 0,
    },
    downloadUrl: { type: 'string', title: 'Download URL', format: 'uri' },

    // Contact: must have at least one
    supportEmail: { type: 'string', format: 'email', title: 'Support Email' },
    supportPhone: { type: 'string', title: 'Support Phone' },

    // $ref usage
    sellerAddress: { $ref: '#/$defs/address', title: 'Seller Address' },

    // Dependencies overlay
    discountCode: { type: 'string', title: 'Discount Code' },
    discountPercent: { type: 'number', title: 'Discount %' },
  },
  required: ['name', 'kind', 'price'],
  additionalProperties: false,

  // Require at least one support channel
  anyOf: [{ required: ['supportEmail'] }, { required: ['supportPhone'] }],

  // Use allOf to overlay branch-specific requirements
  allOf: [
    {
      if: { properties: { kind: { const: 'physical' } } },
      then: { required: ['shippingWeight'] },
    },
    {
      if: { properties: { kind: { const: 'digital' } } },
      then: { required: ['downloadUrl'] },
    },
    // Additional allOf branch to demonstrate merging
    {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product tags for categorization',
        },
      },
    },
  ],

  // Forbid free digital products (example of not)
  not: {
    allOf: [
      { properties: { kind: { const: 'digital' } } },
      { properties: { price: { const: 0 } }, required: ['price'] },
    ],
  },

  // When discountCode present, require discountPercent with limits
  dependentSchemas: {
    discountCode: {
      properties: { discountPercent: { minimum: 0, maximum: 50 } },
      required: ['discountPercent'],
    },
  },
}

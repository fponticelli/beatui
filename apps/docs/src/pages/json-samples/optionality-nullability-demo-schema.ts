export default {
  type: 'object',
  title: 'Optionality vs Nullability Demo',
  description:
    'Demonstrates the difference between optional properties (key absent) and nullable properties (value can be null). Note: Optional nullable primitives use nullable controls instead of presence toggles.',
  properties: {
    // Required, non-nullable string
    requiredName: {
      type: 'string',
      title: 'Required Name',
      description: 'This field is required and cannot be null',
    },

    // Optional, non-nullable string (shows presence toggle)
    optionalName: {
      type: 'string',
      title: 'Optional Name',
      description: 'This field is optional - can be absent from the object',
    },

    // Required, nullable string (shows null toggle)
    requiredNullableName: {
      type: ['string', 'null'],
      title: 'Required Nullable Name',
      description: 'This field is required but can be explicitly set to null',
    },

    // Optional, nullable string (uses nullable control instead of presence toggle)
    optionalNullableName: {
      type: ['string', 'null'],
      title: 'Optional Nullable Name',
      description:
        'This field can be absent OR explicitly null - uses nullable control for better UX',
    },

    // Required, non-nullable number
    requiredAge: {
      type: 'number',
      minimum: 0,
      maximum: 150,
      title: 'Required Age',
      description: 'This field is required and cannot be null',
    },

    // Optional, non-nullable number (shows presence toggle)
    optionalAge: {
      type: 'number',
      minimum: 0,
      maximum: 150,
      title: 'Optional Age',
      description: 'This field is optional - can be absent from the object',
    },

    // Required, nullable number (shows null toggle)
    requiredNullableAge: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 150,
      title: 'Required Nullable Age',
      description: 'This field is required but can be explicitly set to null',
    },

    // Required, non-nullable boolean
    requiredActive: {
      type: 'boolean',
      title: 'Required Active',
      description: 'This field is required and cannot be null',
    },

    // Optional, non-nullable boolean (shows presence toggle)
    optionalActive: {
      type: 'boolean',
      title: 'Optional Active',
      description: 'This field is optional - can be absent from the object',
    },

    // Required, nullable boolean (shows null toggle)
    requiredNullableActive: {
      type: ['boolean', 'null'],
      title: 'Required Nullable Active',
      description: 'This field is required but can be explicitly set to null',
    },

    // OpenAPI nullable extension
    openApiNullable: {
      type: 'string',
      nullable: true,
      title: 'OpenAPI Nullable',
      description: 'Uses OpenAPI nullable extension',
    },

    // Enum with null
    enumWithNull: {
      enum: ['option1', 'option2', null],
      title: 'Enum with Null',
      description: 'Enum that includes null as a valid value',
    },

    // Optional object (shows presence toggle with Switch)
    optionalAddress: {
      type: 'object',
      title: 'Optional Address',
      description:
        'This optional object shows a presence toggle using Switch component',
      properties: {
        street: { type: 'string', title: 'Street' },
        city: { type: 'string', title: 'City' },
        zipCode: { type: 'string', title: 'ZIP Code' },
      },
    },
  },
  required: [
    'requiredName',
    'requiredNullableName',
    'requiredAge',
    'requiredNullableAge',
    'requiredActive',
    'requiredNullableActive',
    'openApiNullable',
    'enumWithNull',
  ],

  examples: [
    {
      requiredName: 'John Doe',
      optionalName: 'Johnny',
      requiredNullableName: null,
      optionalNullableName: 'Optional value',
      requiredAge: 30,
      optionalAge: 25,
      requiredNullableAge: null,
      requiredActive: true,
      optionalActive: false,
      requiredNullableActive: null,
      openApiNullable: null,
      enumWithNull: 'option1',
    },
  ],
}

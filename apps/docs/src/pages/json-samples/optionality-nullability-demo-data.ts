// This data demonstrates the difference between optional and nullable properties
export default {
  // Required fields - always present
  requiredName: 'Alice Johnson',
  requiredNullableName: null, // Required but explicitly null
  requiredAge: 28,
  requiredNullableAge: null, // Required but explicitly null
  requiredActive: true,
  requiredNullableActive: null, // Required but explicitly null
  openApiNullable: 'Some value',
  enumWithNull: 'option2',

  // Optional fields - some present, some absent
  optionalName: 'Ali', // Present
  // optionalAge is absent (not included in object)
  optionalActive: false, // Present
  optionalNullableName: null, // Present but null
}

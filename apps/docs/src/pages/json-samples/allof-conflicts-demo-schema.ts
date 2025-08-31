export default {
  type: 'object',
  title: 'allOf Conflicts Demo',
  description: 'Demonstrates conflict detection in allOf merge strategy',
  
  // This allOf will demonstrate conflicts that are detected and reported
  allOf: [
    {
      type: 'string', // This conflicts with the next branch
      minLength: 5,
      title: 'String Branch',
    },
    {
      type: 'number', // This conflicts with the previous branch
      minimum: 0,
      title: 'Number Branch',
    },
    {
      type: 'object',
      properties: {
        conflictingProp: { 
          type: 'string',
          title: 'String Property'
        },
      },
    },
    {
      type: 'object',
      properties: {
        conflictingProp: { 
          type: 'number', // This conflicts with the string version above
          title: 'Number Property'
        },
        nonConflictingProp: {
          type: 'boolean',
          title: 'Non-conflicting Property'
        },
      },
    },
  ],
  
  // Example data - this won't validate due to the type conflicts
  examples: [
    'This is a string example',
    42,
    {
      conflictingProp: 'string value',
      nonConflictingProp: true,
    },
    {
      conflictingProp: 123,
      nonConflictingProp: false,
    },
  ],
}

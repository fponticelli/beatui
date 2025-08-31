// This data will demonstrate the conflicts in the schema
// Since the schema has type conflicts (string vs number vs object),
// we'll start with an object that shows property conflicts
export default {
  conflictingProp: 'This is a string value', // Will conflict with number type in another branch
  nonConflictingProp: true,
}

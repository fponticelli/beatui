// This data will trigger not violations to demonstrate the feature
export default {
  username: 'admin', // This will violate the "not reserved word" constraint
  email: 'test@spam.com', // This will violate the "not blocked domain" constraint
  age: 15, // This will violate the "not restricted age range" constraint
  profile: {
    bio: '',
    website: '',
  }, // This will violate the "not empty profile" constraint
}

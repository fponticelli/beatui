const en = {
  // Sign In
  signInTitle: 'Sign In',
  signInButton: 'Sign In',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  rememberMeLabel: 'Remember me',
  forgotPasswordLink: 'Forgot password?',
  noAccountLink: "Don't have an account? Sign up",

  // Sign Up
  signUpTitle: 'Sign Up',
  signUpButton: 'Sign Up',
  nameLabel: 'Name',
  confirmPasswordLabel: 'Confirm Password',
  acceptTermsLabel: 'I accept the terms and conditions',
  hasAccountLink: 'Already have an account? Sign in',

  // Reset Password
  resetPasswordTitle: 'Reset Password',
  resetPasswordButton: 'Reset Password',
  resetPasswordDescription: 'Enter your email to reset your password.',
  backToSignInLink: 'Back to sign in',

  // Social Login
  continueWithProvider: (provider: string) => `Continue with ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Weak',
  passwordStrengthFair: 'Fair',
  passwordStrengthGood: 'Good',
  passwordStrengthStrong: 'Strong',

  // Common
  orDivider: 'or',
  error: 'An error occurred',
  required: 'Required',

  // Modal
  authenticationTitle: 'Authentication',

  // Validation messages
  passwordMinLength: (min: number) =>
    `Password must be at least ${min} characters`,
  passwordRequireUppercase:
    'Password must contain at least one uppercase letter',
  passwordRequireLowercase:
    'Password must contain at least one lowercase letter',
  passwordRequireNumber: 'Password must contain at least one number',
  passwordRequireSpecialChar:
    'Password must contain at least one special character',
  emailRequired: 'Email is required',
  invalidEmail: 'Please enter a valid email address',
  passwordRequired: 'Password is required',
  nameRequired: 'Name is required',
  confirmPasswordRequired: 'Please confirm your password',
  acceptTermsRequired: 'You must accept the terms and conditions',
  passwordsDoNotMatch: "Passwords don't match",
  invalidPassword: 'Invalid password',
  invalidEmailAddress: 'Invalid email',
}

export default en

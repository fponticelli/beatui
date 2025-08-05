const en = {
  // Sign In
  signInTitle: () => 'Sign In',
  signInButton: () => 'Sign In',
  emailLabel: () => 'Email',
  passwordLabel: () => 'Password',
  rememberMeLabel: () => 'Remember me',
  forgotPasswordLink: () => 'Forgot password?',
  noAccountLink: () => "Don't have an account? Sign up",

  // Sign Up
  signUpTitle: () => 'Sign Up',
  signUpButton: () => 'Sign Up',
  nameLabel: () => 'Name',
  confirmPasswordLabel: () => 'Confirm Password',
  acceptTermsLabel: () => 'I accept the terms and conditions',
  hasAccountLink: () => 'Already have an account? Sign in',

  // Reset Password
  resetPasswordTitle: () => 'Reset Password',
  resetPasswordButton: () => 'Reset Password',
  resetPasswordDescription: () => 'Enter your email to reset your password.',
  backToSignInLink: () => 'Back to sign in',

  // Social Login
  continueWithProvider: (provider: string) => `Continue with ${provider}`,

  // Password Strength
  passwordStrengthWeak: () => 'Weak',
  passwordStrengthFair: () => 'Fair',
  passwordStrengthGood: () => 'Good',
  passwordStrengthStrong: () => 'Strong',

  // Common
  orDivider: () => 'or',
  error: () => 'An error occurred',
  required: () => 'Required',
}

export default en

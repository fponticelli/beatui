const he = {
  // Sign In
  signInTitle: () => 'התחברות',
  signInButton: () => 'התחבר',
  emailLabel: () => 'אימייל',
  passwordLabel: () => 'סיסמה',
  rememberMeLabel: () => 'זכור אותי',
  forgotPasswordLink: () => 'שכחת את הסיסמה?',
  noAccountLink: () => 'אין לך חשבון? הירשם',

  // Sign Up
  signUpTitle: () => 'הרשמה',
  signUpButton: () => 'הירשם',
  nameLabel: () => 'שם',
  confirmPasswordLabel: () => 'אישור סיסמה',
  acceptTermsLabel: () => 'אני מסכים לתנאים והתניות',
  hasAccountLink: () => 'כבר יש לך חשבון? התחבר',

  // Reset Password
  resetPasswordTitle: () => 'איפוס סיסמה',
  resetPasswordButton: () => 'אפס סיסמה',
  resetPasswordDescription: () => 'הזן את האימייל שלך כדי לאפס את הסיסמה.',
  backToSignInLink: () => 'חזור להתחברות',

  // Social Login
  continueWithProvider: (provider: string) => `המשך עם ${provider}`,

  // Password Strength
  passwordStrengthWeak: () => 'חלשה',
  passwordStrengthFair: () => 'בינונית',
  passwordStrengthGood: () => 'טובה',
  passwordStrengthStrong: () => 'חזקה',

  // Common
  orDivider: () => 'או',
  error: () => 'אירעה שגיאה',
  required: () => 'נדרש',

  // Modal
  authenticationTitle: () => 'אימות',
}

export default he

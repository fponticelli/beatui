const he = {
  // Sign In
  signInTitle: 'התחברות',
  signInButton: 'התחבר',
  emailLabel: 'אימייל',
  passwordLabel: 'סיסמה',
  rememberMeLabel: 'זכור אותי',
  forgotPasswordLink: 'שכחת את הסיסמה?',
  noAccountLink: 'אין לך חשבון? הירשם',

  // Sign Up
  signUpTitle: 'הרשמה',
  signUpButton: 'הירשם',
  nameLabel: 'שם',
  confirmPasswordLabel: 'אישור סיסמה',
  acceptTermsLabel: 'אני מסכים לתנאים והתניות',
  hasAccountLink: 'כבר יש לך חשבון? התחבר',

  // Reset Password
  resetPasswordTitle: 'איפוס סיסמה',
  resetPasswordButton: 'אפס סיסמה',
  resetPasswordDescription: 'הזן את האימייל שלך כדי לאפס את הסיסמה.',
  backToSignInLink: 'חזור להתחברות',

  // Social Login
  continueWithProvider: (provider: string) => `המשך עם ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'חלשה',
  passwordStrengthFair: 'בינונית',
  passwordStrengthGood: 'טובה',
  passwordStrengthStrong: 'חזקה',

  // Common
  orDivider: 'או',
  error: 'אירעה שגיאה',
  required: 'נדרש',

  // Modal
  authenticationTitle: 'אימות',

  // Validation messages
  passwordMinLength: (min: number) => `הסיסמה חייבת להכיל לפחות ${min} תווים`,
  passwordRequireUppercase: 'הסיסמה חייבת להכיל לפחות אות גדולה אחת',
  passwordRequireLowercase: 'הסיסמה חייבת להכיל לפחות אות קטנה אחת',
  passwordRequireNumber: 'הסיסמה חייבת להכיל לפחות ספרה אחת',
  passwordRequireSpecialChar: 'הסיסמה חייבת להכיל לפחות תו מיוחד אחד',
  emailRequired: 'אימייל נדרש',
  invalidEmail: 'נא להזין כתובת אימייל תקינה',
  passwordRequired: 'סיסמה נדרשת',
  nameRequired: 'שם נדרש',
  confirmPasswordRequired: 'נא לאשר את הסיסמה',
  acceptTermsRequired: 'עליך לאשר את התנאים וההתניות',
  passwordsDoNotMatch: 'הסיסמאות אינן תואמות',
  invalidPassword: 'סיסמה לא תקינה',
  invalidEmailAddress: 'אימייל לא תקין',
}

export default he

const de = {
  // Sign In
  signInTitle: 'Anmelden',
  signInButton: 'Anmelden',
  emailLabel: 'E-Mail',
  passwordLabel: 'Passwort',
  rememberMeLabel: 'Angemeldet bleiben',
  forgotPasswordLink: 'Passwort vergessen?',
  noAccountLink: 'Noch kein Konto? Registrieren',

  // Sign Up
  signUpTitle: 'Registrieren',
  signUpButton: 'Registrieren',
  nameLabel: 'Name',
  confirmPasswordLabel: 'Passwort bestätigen',
  acceptTermsLabel: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen',
  hasAccountLink: 'Bereits ein Konto? Anmelden',

  // Reset Password
  resetPasswordTitle: 'Passwort zurücksetzen',
  resetPasswordButton: 'Passwort zurücksetzen',
  resetPasswordDescription:
    'Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurückzusetzen.',
  backToSignInLink: 'Zurück zur Anmeldung',

  // Social Login
  continueWithProvider: (provider: string) => `Mit ${provider} fortfahren`,

  // Password Strength
  passwordStrengthWeak: 'Schwach',
  passwordStrengthFair: 'Ausreichend',
  passwordStrengthGood: 'Gut',
  passwordStrengthStrong: 'Stark',

  // Common
  orDivider: 'oder',
  error: 'Ein Fehler ist aufgetreten',
  required: 'Erforderlich',

  // Modal
  authenticationTitle: 'Authentifizierung',

  // Validation messages
  passwordMinLength: (min: number) =>
    `Das Passwort muss mindestens ${min} Zeichen lang sein`,
  passwordRequireUppercase:
    'Das Passwort muss mindestens einen Großbuchstaben enthalten',
  passwordRequireLowercase:
    'Das Passwort muss mindestens einen Kleinbuchstaben enthalten',
  passwordRequireNumber: 'Das Passwort muss mindestens eine Zahl enthalten',
  passwordRequireSpecialChar:
    'Das Passwort muss mindestens ein Sonderzeichen enthalten',
  emailRequired: 'E-Mail ist erforderlich',
  invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
  passwordRequired: 'Passwort ist erforderlich',
  nameRequired: 'Name ist erforderlich',
  confirmPasswordRequired: 'Bitte bestätigen Sie Ihr Passwort',
  acceptTermsRequired:
    'Sie müssen die Allgemeinen Geschäftsbedingungen akzeptieren',
  passwordsDoNotMatch: 'Die Passwörter stimmen nicht überein',
  invalidPassword: 'Ungültiges Passwort',
  invalidEmailAddress: 'Ungültige E-Mail-Adresse',
}

export default de

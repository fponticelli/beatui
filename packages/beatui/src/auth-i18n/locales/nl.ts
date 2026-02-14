const nl = {
  // Sign In
  signInTitle: 'Inloggen',
  signInButton: 'Inloggen',
  emailLabel: 'E-mail',
  passwordLabel: 'Wachtwoord',
  rememberMeLabel: 'Onthoud mij',
  forgotPasswordLink: 'Wachtwoord vergeten?',
  noAccountLink: 'Geen account? Registreren',

  // Sign Up
  signUpTitle: 'Registreren',
  signUpButton: 'Registreren',
  nameLabel: 'Naam',
  confirmPasswordLabel: 'Bevestig wachtwoord',
  acceptTermsLabel: 'Ik accepteer de voorwaarden',
  hasAccountLink: 'Al een account? Inloggen',

  // Reset Password
  resetPasswordTitle: 'Wachtwoord resetten',
  resetPasswordButton: 'Wachtwoord resetten',
  resetPasswordDescription:
    'Voer je e-mailadres in om je wachtwoord te resetten.',
  backToSignInLink: 'Terug naar inloggen',

  // Social Login
  continueWithProvider: (provider: string) => `Doorgaan met ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Zwak',
  passwordStrengthFair: 'Redelijk',
  passwordStrengthGood: 'Goed',
  passwordStrengthStrong: 'Sterk',

  // Common
  orDivider: 'of',
  error: 'Er is een fout opgetreden',
  required: 'Verplicht',

  // Modal
  authenticationTitle: 'Authenticatie',

  // Validation messages
  passwordMinLength: (min: number) =>
    `Wachtwoord moet minimaal ${min} tekens bevatten`,
  passwordRequireUppercase: 'Wachtwoord moet minimaal één hoofdletter bevatten',
  passwordRequireLowercase:
    'Wachtwoord moet minimaal één kleine letter bevatten',
  passwordRequireNumber: 'Wachtwoord moet minimaal één cijfer bevatten',
  passwordRequireSpecialChar:
    'Wachtwoord moet minimaal één speciaal teken bevatten',
  emailRequired: 'E-mail is verplicht',
  invalidEmail: 'Voer een geldig e-mailadres in',
  passwordRequired: 'Wachtwoord is verplicht',
  nameRequired: 'Naam is verplicht',
  confirmPasswordRequired: 'Bevestig je wachtwoord',
  acceptTermsRequired: 'Je moet de voorwaarden accepteren',
  passwordsDoNotMatch: 'Wachtwoorden komen niet overeen',
  invalidPassword: 'Ongeldig wachtwoord',
  invalidEmailAddress: 'Ongeldig e-mailadres',
}

export default nl

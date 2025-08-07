const nl = {
  // Sign In
  signInTitle: () => 'Inloggen',
  signInButton: () => 'Inloggen',
  emailLabel: () => 'E-mail',
  passwordLabel: () => 'Wachtwoord',
  rememberMeLabel: () => 'Onthoud mij',
  forgotPasswordLink: () => 'Wachtwoord vergeten?',
  noAccountLink: () => 'Geen account? Registreren',

  // Sign Up
  signUpTitle: () => 'Registreren',
  signUpButton: () => 'Registreren',
  nameLabel: () => 'Naam',
  confirmPasswordLabel: () => 'Bevestig wachtwoord',
  acceptTermsLabel: () => 'Ik accepteer de voorwaarden',
  hasAccountLink: () => 'Al een account? Inloggen',

  // Reset Password
  resetPasswordTitle: () => 'Wachtwoord resetten',
  resetPasswordButton: () => 'Wachtwoord resetten',
  resetPasswordDescription: () => 'Voer je e-mailadres in om je wachtwoord te resetten.',
  backToSignInLink: () => 'Terug naar inloggen',

  // Social Login
  continueWithProvider: (provider: string) => `Doorgaan met ${provider}`,

  // Password Strength
  passwordStrengthWeak: () => 'Zwak',
  passwordStrengthFair: () => 'Redelijk',
  passwordStrengthGood: () => 'Goed',
  passwordStrengthStrong: () => 'Sterk',

  // Common
  orDivider: () => 'of',
  error: () => 'Er is een fout opgetreden',
  required: () => 'Verplicht',

  // Modal
  authenticationTitle: () => 'Authenticatie',
}

export default nl

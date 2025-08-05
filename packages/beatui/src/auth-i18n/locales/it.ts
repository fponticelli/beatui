const it = {
  // Sign In
  signInTitle: () => 'Accedi',
  signInButton: () => 'Accedi',
  emailLabel: () => 'Email',
  passwordLabel: () => 'Password',
  rememberMeLabel: () => 'Ricordami',
  forgotPasswordLink: () => 'Password dimenticata?',
  noAccountLink: () => 'Non hai un account? Registrati',

  // Sign Up
  signUpTitle: () => 'Registrati',
  signUpButton: () => 'Registrati',
  nameLabel: () => 'Nome',
  confirmPasswordLabel: () => 'Conferma Password',
  acceptTermsLabel: () => 'Accetto i termini e le condizioni',
  hasAccountLink: () => 'Hai già un account? Accedi',

  // Reset Password
  resetPasswordTitle: () => 'Reimposta Password',
  resetPasswordButton: () => 'Reimposta Password',
  resetPasswordDescription: () =>
    'Inserisci la tua email per reimpostare la password.',
  backToSignInLink: () => 'Torna al login',

  // Social Login
  continueWithProvider: (provider: string) => `Continua con ${provider}`,

  // Password Strength
  passwordStrengthWeak: () => 'Debole',
  passwordStrengthFair: () => 'Discreta',
  passwordStrengthGood: () => 'Buona',
  passwordStrengthStrong: () => 'Forte',

  // Common
  orDivider: () => 'o',
  error: () => 'Si è verificato un errore',
  required: () => 'Obbligatorio',
}

export default it

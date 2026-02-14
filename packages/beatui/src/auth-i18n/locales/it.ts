const it = {
  // Sign In
  signInTitle: 'Accedi',
  signInButton: 'Accedi',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  rememberMeLabel: 'Ricordami',
  forgotPasswordLink: 'Password dimenticata?',
  noAccountLink: 'Non hai un account? Registrati',

  // Sign Up
  signUpTitle: 'Registrati',
  signUpButton: 'Registrati',
  nameLabel: 'Nome',
  confirmPasswordLabel: 'Conferma Password',
  acceptTermsLabel: 'Accetto i termini e le condizioni',
  hasAccountLink: 'Hai già un account? Accedi',

  // Reset Password
  resetPasswordTitle: 'Reimposta Password',
  resetPasswordButton: 'Reimposta Password',
  resetPasswordDescription:
    'Inserisci la tua email per reimpostare la password.',
  backToSignInLink: 'Torna al login',

  // Social Login
  continueWithProvider: (provider: string) => `Continua con ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Debole',
  passwordStrengthFair: 'Discreta',
  passwordStrengthGood: 'Buona',
  passwordStrengthStrong: 'Forte',

  // Common
  orDivider: 'o',
  error: 'Si è verificato un errore',
  required: 'Obbligatorio',

  // Modal
  authenticationTitle: 'Autenticazione',

  // Validation messages
  passwordMinLength: (min: number) =>
    `La password deve contenere almeno ${min} caratteri`,
  passwordRequireUppercase:
    'La password deve contenere almeno una lettera maiuscola',
  passwordRequireLowercase:
    'La password deve contenere almeno una lettera minuscola',
  passwordRequireNumber: 'La password deve contenere almeno un numero',
  passwordRequireSpecialChar:
    'La password deve contenere almeno un carattere speciale',
  emailRequired: "L'email è obbligatoria",
  invalidEmail: 'Inserisci un indirizzo email valido',
  passwordRequired: 'La password è obbligatoria',
  nameRequired: 'Il nome è obbligatorio',
  confirmPasswordRequired: 'Per favore, conferma la tua password',
  acceptTermsRequired: 'Devi accettare i termini e le condizioni',
  passwordsDoNotMatch: 'Le password non corrispondono',
  invalidPassword: 'Password non valida',
  invalidEmailAddress: 'Email non valida',
}

export default it

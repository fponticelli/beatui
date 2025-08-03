const fr = {
  // Sign In
  signInTitle: () => 'Se Connecter',
  signInButton: () => 'Se Connecter',
  emailLabel: () => 'Email',
  passwordLabel: () => 'Mot de Passe',
  rememberMeLabel: () => 'Se souvenir de moi',
  forgotPasswordLink: () => 'Mot de passe oublié ?',
  noAccountLink: () => "Vous n'avez pas de compte ? Inscrivez-vous",

  // Sign Up
  signUpTitle: () => "S'Inscrire",
  signUpButton: () => "S'Inscrire",
  nameLabel: () => 'Nom',
  confirmPasswordLabel: () => 'Confirmer le Mot de Passe',
  acceptTermsLabel: () => "J'accepte les termes et conditions",
  hasAccountLink: () => 'Vous avez déjà un compte ? Connectez-vous',

  // Reset Password
  resetPasswordTitle: () => 'Réinitialiser le Mot de Passe',
  resetPasswordButton: () => 'Réinitialiser le Mot de Passe',
  resetPasswordDescription: () =>
    'Entrez votre email pour réinitialiser votre mot de passe.',
  backToSignInLink: () => 'Retour à la connexion',

  // Social Login
  continueWithProvider: (provider: string) => `Continuer avec ${provider}`,

  // Password Strength
  passwordStrengthWeak: () => 'Faible',
  passwordStrengthFair: () => 'Correct',
  passwordStrengthGood: () => 'Bon',
  passwordStrengthStrong: () => 'Fort',

  // Common
  orDivider: () => 'ou',
  loading: () => 'Chargement...',
  error: () => 'Une erreur est survenue',
  required: () => 'Requis',
}

export default fr

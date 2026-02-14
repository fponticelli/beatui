const fr = {
  // Sign In
  signInTitle: 'Se Connecter',
  signInButton: 'Se Connecter',
  emailLabel: 'Email',
  passwordLabel: 'Mot de Passe',
  rememberMeLabel: 'Se souvenir de moi',
  forgotPasswordLink: 'Mot de passe oublié ?',
  noAccountLink: "Vous n'avez pas de compte ? Inscrivez-vous",

  // Sign Up
  signUpTitle: "S'Inscrire",
  signUpButton: "S'Inscrire",
  nameLabel: 'Nom',
  confirmPasswordLabel: 'Confirmer le Mot de Passe',
  acceptTermsLabel: "J'accepte les termes et conditions",
  hasAccountLink: 'Vous avez déjà un compte ? Connectez-vous',

  // Reset Password
  resetPasswordTitle: 'Réinitialiser le Mot de Passe',
  resetPasswordButton: 'Réinitialiser le Mot de Passe',
  resetPasswordDescription:
    'Entrez votre email pour réinitialiser votre mot de passe.',
  backToSignInLink: 'Retour à la connexion',

  // Social Login
  continueWithProvider: (provider: string) => `Continuer avec ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Faible',
  passwordStrengthFair: 'Moyen',
  passwordStrengthGood: 'Bon',
  passwordStrengthStrong: 'Fort',

  // Common
  orDivider: 'ou',
  error: 'Une erreur est survenue',
  required: 'Requis',

  // Modal
  authenticationTitle: 'Authentification',

  // Validation messages
  passwordMinLength: (min: number) =>
    `Le mot de passe doit contenir au moins ${min} caractères`,
  passwordRequireUppercase:
    'Le mot de passe doit contenir au moins une lettre majuscule',
  passwordRequireLowercase:
    'Le mot de passe doit contenir au moins une lettre minuscule',
  passwordRequireNumber: 'Le mot de passe doit contenir au moins un chiffre',
  passwordRequireSpecialChar:
    'Le mot de passe doit contenir au moins un caractère spécial',
  emailRequired: "L'email est requis",
  invalidEmail: 'Veuillez entrer une adresse email valide',
  passwordRequired: 'Le mot de passe est requis',
  nameRequired: 'Le nom est requis',
  confirmPasswordRequired: 'Veuillez confirmer votre mot de passe',
  acceptTermsRequired: 'Vous devez accepter les termes et conditions',
  passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
  invalidPassword: 'Mot de passe invalide',
  invalidEmailAddress: 'Email invalide',
}

export default fr

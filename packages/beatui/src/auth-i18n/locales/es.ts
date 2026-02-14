const es = {
  // Sign In
  signInTitle: 'Iniciar Sesión',
  signInButton: 'Iniciar Sesión',
  emailLabel: 'Correo Electrónico',
  passwordLabel: 'Contraseña',
  rememberMeLabel: 'Recordarme',
  forgotPasswordLink: '¿Olvidaste tu contraseña?',
  noAccountLink: '¿No tienes una cuenta? Regístrate',

  // Sign Up
  signUpTitle: 'Registrarse',
  signUpButton: 'Registrarse',
  nameLabel: 'Nombre',
  confirmPasswordLabel: 'Confirmar Contraseña',
  acceptTermsLabel: 'Acepto los términos y condiciones',
  hasAccountLink: '¿Ya tienes una cuenta? Inicia sesión',

  // Reset Password
  resetPasswordTitle: 'Restablecer Contraseña',
  resetPasswordButton: 'Restablecer Contraseña',
  resetPasswordDescription:
    'Ingresa tu correo electrónico para restablecer tu contraseña.',
  backToSignInLink: 'Volver a iniciar sesión',

  // Social Login
  continueWithProvider: (provider: string) => `Continuar con ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Débil',
  passwordStrengthFair: 'Regular',
  passwordStrengthGood: 'Buena',
  passwordStrengthStrong: 'Fuerte',

  // Common
  orDivider: 'o',
  error: 'Ocurrió un error',
  required: 'Requerido',

  // Modal
  authenticationTitle: 'Autenticación',

  // Validation messages
  passwordMinLength: (min: number) =>
    `La contraseña debe tener al menos ${min} caracteres`,
  passwordRequireUppercase:
    'La contraseña debe contener al menos una letra mayúscula',
  passwordRequireLowercase:
    'La contraseña debe contener al menos una letra minúscula',
  passwordRequireNumber: 'La contraseña debe contener al menos un número',
  passwordRequireSpecialChar:
    'La contraseña debe contener al menos un carácter especial',
  emailRequired: 'El correo electrónico es obligatorio',
  invalidEmail:
    'Por favor, introduce una dirección de correo electrónico válida',
  passwordRequired: 'La contraseña es obligatoria',
  nameRequired: 'El nombre es obligatorio',
  confirmPasswordRequired: 'Por favor, confirma tu contraseña',
  acceptTermsRequired: 'Debes aceptar los términos y condiciones',
  passwordsDoNotMatch: 'Las contraseñas no coinciden',
  invalidPassword: 'Contraseña inválida',
  invalidEmailAddress: 'Correo electrónico inválido',
}

export default es

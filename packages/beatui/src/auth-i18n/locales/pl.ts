const pl = {
  // Sign In
  signInTitle: 'Zaloguj się',
  signInButton: 'Zaloguj się',
  emailLabel: 'E-mail',
  passwordLabel: 'Hasło',
  rememberMeLabel: 'Zapamiętaj mnie',
  forgotPasswordLink: 'Zapomniałeś hasła?',
  noAccountLink: 'Nie masz konta? Zarejestruj się',

  // Sign Up
  signUpTitle: 'Zarejestruj się',
  signUpButton: 'Zarejestruj się',
  nameLabel: 'Imię',
  confirmPasswordLabel: 'Potwierdź hasło',
  acceptTermsLabel: 'Akceptuję regulamin',
  hasAccountLink: 'Masz już konto? Zaloguj się',

  // Reset Password
  resetPasswordTitle: 'Resetuj hasło',
  resetPasswordButton: 'Resetuj hasło',
  resetPasswordDescription: 'Wprowadź swój e-mail, aby zresetować hasło.',
  backToSignInLink: 'Powrót do logowania',

  // Social Login
  continueWithProvider: (provider: string) => `Kontynuuj z ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Słabe',
  passwordStrengthFair: 'Średnie',
  passwordStrengthGood: 'Dobre',
  passwordStrengthStrong: 'Silne',

  // Common
  orDivider: 'lub',
  error: 'Wystąpił błąd',
  required: 'Wymagane',

  // Modal
  authenticationTitle: 'Uwierzytelnienie',

  // Validation messages
  passwordMinLength: (min: number) =>
    `Hasło musi mieć co najmniej ${min} znaków`,
  passwordRequireUppercase:
    'Hasło musi zawierać co najmniej jedną wielką literę',
  passwordRequireLowercase: 'Hasło musi zawierać co najmniej jedną małą literę',
  passwordRequireNumber: 'Hasło musi zawierać co najmniej jedną cyfrę',
  passwordRequireSpecialChar:
    'Hasło musi zawierać co najmniej jeden znak specjalny',
  emailRequired: 'E-mail jest wymagany',
  invalidEmail: 'Wprowadź prawidłowy adres e-mail',
  passwordRequired: 'Hasło jest wymagane',
  nameRequired: 'Imię jest wymagane',
  confirmPasswordRequired: 'Potwierdź swoje hasło',
  acceptTermsRequired: 'Musisz zaakceptować regulamin',
  passwordsDoNotMatch: 'Hasła nie są zgodne',
  invalidPassword: 'Nieprawidłowe hasło',
  invalidEmailAddress: 'Nieprawidłowy e-mail',
}

export default pl

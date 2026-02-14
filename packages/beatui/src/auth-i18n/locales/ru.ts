const ru = {
  // Sign In
  signInTitle: 'Войти',
  signInButton: 'Войти',
  emailLabel: 'Email',
  passwordLabel: 'Пароль',
  rememberMeLabel: 'Запомнить меня',
  forgotPasswordLink: 'Забыли пароль?',
  noAccountLink: 'Нет аккаунта? Зарегистрироваться',

  // Sign Up
  signUpTitle: 'Регистрация',
  signUpButton: 'Зарегистрироваться',
  nameLabel: 'Имя',
  confirmPasswordLabel: 'Подтвердить пароль',
  acceptTermsLabel: 'Я принимаю условия использования',
  hasAccountLink: 'Уже есть аккаунт? Войти',

  // Reset Password
  resetPasswordTitle: 'Сброс пароля',
  resetPasswordButton: 'Сбросить пароль',
  resetPasswordDescription: 'Введите ваш email для сброса пароля.',
  backToSignInLink: 'Вернуться к входу',

  // Social Login
  continueWithProvider: (provider: string) => `Продолжить с ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Слабый',
  passwordStrengthFair: 'Средний',
  passwordStrengthGood: 'Хороший',
  passwordStrengthStrong: 'Сильный',

  // Common
  orDivider: 'или',
  error: 'Произошла ошибка',
  required: 'Обязательно',

  // Modal
  authenticationTitle: 'Аутентификация',

  // Validation messages
  passwordMinLength: (min: number) =>
    `Пароль должен содержать не менее ${min} символов`,
  passwordRequireUppercase:
    'Пароль должен содержать хотя бы одну заглавную букву',
  passwordRequireLowercase:
    'Пароль должен содержать хотя бы одну строчную букву',
  passwordRequireNumber: 'Пароль должен содержать хотя бы одну цифру',
  passwordRequireSpecialChar:
    'Пароль должен содержать хотя бы один специальный символ',
  emailRequired: 'Email обязателен для заполнения',
  invalidEmail: 'Пожалуйста, введите корректный email',
  passwordRequired: 'Пароль обязателен для заполнения',
  nameRequired: 'Имя обязательно для заполнения',
  confirmPasswordRequired: 'Пожалуйста, подтвердите пароль',
  acceptTermsRequired: 'Необходимо принять условия использования',
  passwordsDoNotMatch: 'Пароли не совпадают',
  invalidPassword: 'Неверный пароль',
  invalidEmailAddress: 'Неверный email',
}

export default ru

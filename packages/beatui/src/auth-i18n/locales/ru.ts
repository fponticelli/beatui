const ru = {
  // Sign In
  signInTitle: () => 'Войти',
  signInButton: () => 'Войти',
  emailLabel: () => 'Email',
  passwordLabel: () => 'Пароль',
  rememberMeLabel: () => 'Запомнить меня',
  forgotPasswordLink: () => 'Забыли пароль?',
  noAccountLink: () => 'Нет аккаунта? Зарегистрироваться',

  // Sign Up
  signUpTitle: () => 'Регистрация',
  signUpButton: () => 'Зарегистрироваться',
  nameLabel: () => 'Имя',
  confirmPasswordLabel: () => 'Подтвердить пароль',
  acceptTermsLabel: () => 'Я принимаю условия использования',
  hasAccountLink: () => 'Уже есть аккаунт? Войти',

  // Reset Password
  resetPasswordTitle: () => 'Сброс пароля',
  resetPasswordButton: () => 'Сбросить пароль',
  resetPasswordDescription: () => 'Введите ваш email для сброса пароля.',
  backToSignInLink: () => 'Вернуться к входу',

  // Social Login
  continueWithProvider: (provider: string) => `Продолжить с ${provider}`,

  // Password Strength
  passwordStrengthWeak: () => 'Слабый',
  passwordStrengthFair: () => 'Средний',
  passwordStrengthGood: () => 'Хороший',
  passwordStrengthStrong: () => 'Сильный',

  // Common
  orDivider: () => 'или',
  error: () => 'Произошла ошибка',
  required: () => 'Обязательно',

  // Modal
  authenticationTitle: () => 'Аутентификация',
}

export default ru

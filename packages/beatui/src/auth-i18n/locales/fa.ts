const fa = {
  // Sign In
  signInTitle: () => 'ورود',
  signInButton: () => 'ورود',
  emailLabel: () => 'ایمیل',
  passwordLabel: () => 'رمز عبور',
  rememberMeLabel: () => 'مرا به خاطر بسپار',
  forgotPasswordLink: () => 'رمز عبور را فراموش کرده‌اید؟',
  noAccountLink: () => 'حساب کاربری ندارید؟ ثبت نام کنید',

  // Sign Up
  signUpTitle: () => 'ثبت نام',
  signUpButton: () => 'ثبت نام',
  nameLabel: () => 'نام',
  confirmPasswordLabel: () => 'تأیید رمز عبور',
  acceptTermsLabel: () => 'شرایط و قوانین را می‌پذیرم',
  hasAccountLink: () => 'قبلاً حساب کاربری دارید؟ وارد شوید',

  // Reset Password
  resetPasswordTitle: () => 'بازنشانی رمز عبور',
  resetPasswordButton: () => 'بازنشانی رمز عبور',
  resetPasswordDescription: () => 'ایمیل خود را برای بازنشانی رمز عبور وارد کنید.',
  backToSignInLink: () => 'بازگشت به ورود',

  // Social Login
  continueWithProvider: (provider: string) => `ادامه با ${provider}`,

  // Password Strength
  passwordStrengthWeak: () => 'ضعیف',
  passwordStrengthFair: () => 'متوسط',
  passwordStrengthGood: () => 'خوب',
  passwordStrengthStrong: () => 'قوی',

  // Common
  orDivider: () => 'یا',
  error: () => 'خطایی رخ داد',
  required: () => 'الزامی',

  // Modal
  authenticationTitle: () => 'احراز هویت',
}

export default fa

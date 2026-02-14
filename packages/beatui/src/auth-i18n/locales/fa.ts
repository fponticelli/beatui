const fa = {
  // Sign In
  signInTitle: 'ورود',
  signInButton: 'ورود',
  emailLabel: 'ایمیل',
  passwordLabel: 'رمز عبور',
  rememberMeLabel: 'مرا به خاطر بسپار',
  forgotPasswordLink: 'رمز عبور را فراموش کرده‌اید؟',
  noAccountLink: 'حساب کاربری ندارید؟ ثبت نام کنید',

  // Sign Up
  signUpTitle: 'ثبت نام',
  signUpButton: 'ثبت نام',
  nameLabel: 'نام',
  confirmPasswordLabel: 'تأیید رمز عبور',
  acceptTermsLabel: 'شرایط و قوانین را می‌پذیرم',
  hasAccountLink: 'قبلاً حساب کاربری دارید؟ وارد شوید',

  // Reset Password
  resetPasswordTitle: 'بازنشانی رمز عبور',
  resetPasswordButton: 'بازنشانی رمز عبور',
  resetPasswordDescription: 'ایمیل خود را برای بازنشانی رمز عبور وارد کنید.',
  backToSignInLink: 'بازگشت به ورود',

  // Social Login
  continueWithProvider: (provider: string) => `ادامه با ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'ضعیف',
  passwordStrengthFair: 'متوسط',
  passwordStrengthGood: 'خوب',
  passwordStrengthStrong: 'قوی',

  // Common
  orDivider: 'یا',
  error: 'خطایی رخ داد',
  required: 'الزامی',

  // Modal
  authenticationTitle: 'احراز هویت',

  // Validation messages
  passwordMinLength: (min: number) => `رمز عبور باید حداقل ${min} کاراکتر باشد`,
  passwordRequireUppercase: 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد',
  passwordRequireLowercase: 'رمز عبور باید حداقل یک حرف کوچک داشته باشد',
  passwordRequireNumber: 'رمز عبور باید حداقل یک عدد داشته باشد',
  passwordRequireSpecialChar: 'رمز عبور باید حداقل یک کاراکتر خاص داشته باشد',
  emailRequired: 'ایمیل الزامی است',
  invalidEmail: 'لطفاً یک آدرس ایمیل معتبر وارد کنید',
  passwordRequired: 'رمز عبور الزامی است',
  nameRequired: 'نام الزامی است',
  confirmPasswordRequired: 'لطفاً رمز عبور را تأیید کنید',
  acceptTermsRequired: 'باید شرایط و قوانین را بپذیرید',
  passwordsDoNotMatch: 'رمزهای عبور مطابقت ندارند',
  invalidPassword: 'رمز عبور نامعتبر',
  invalidEmailAddress: 'ایمیل نامعتبر',
}

export default fa

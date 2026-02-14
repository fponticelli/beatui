const ur = {
  // Sign In
  signInTitle: 'سائن ان',
  signInButton: 'سائن ان',
  emailLabel: 'ای میل',
  passwordLabel: 'پاس ورڈ',
  rememberMeLabel: 'مجھے یاد رکھیں',
  forgotPasswordLink: 'پاس ورڈ بھول گئے؟',
  noAccountLink: 'اکاؤنٹ نہیں ہے؟ سائن اپ کریں',

  // Sign Up
  signUpTitle: 'سائن اپ',
  signUpButton: 'سائن اپ',
  nameLabel: 'نام',
  confirmPasswordLabel: 'پاس ورڈ کی تصدیق کریں',
  acceptTermsLabel: 'میں شرائط و ضوابط کو قبول کرتا ہوں',
  hasAccountLink: 'پہلے سے اکاؤنٹ ہے؟ سائن ان کریں',

  // Reset Password
  resetPasswordTitle: 'پاس ورڈ ری سیٹ کریں',
  resetPasswordButton: 'پاس ورڈ ری سیٹ کریں',
  resetPasswordDescription:
    'اپنا پاس ورڈ ری سیٹ کرنے کے لیے اپنا ای میل درج کریں۔',
  backToSignInLink: 'سائن ان پر واپس جائیں',

  // Social Login
  continueWithProvider: (provider: string) => `${provider} کے ساتھ جاری رکھیں`,

  // Password Strength
  passwordStrengthWeak: 'کمزور',
  passwordStrengthFair: 'ٹھیک',
  passwordStrengthGood: 'اچھا',
  passwordStrengthStrong: 'مضبوط',

  // Common
  orDivider: 'یا',
  error: 'ایک خرابی ہوئی',
  required: 'ضروری',

  // Modal
  authenticationTitle: 'تصدیق',

  // Validation messages
  passwordMinLength: (min: number) =>
    `پاس ورڈ کم از کم ${min} حروف کا ہونا چاہیے`,
  passwordRequireUppercase: 'پاس ورڈ میں کم از کم ایک بڑا حرف ہونا چاہیے',
  passwordRequireLowercase: 'پاس ورڈ میں کم از کم ایک چھوٹا حرف ہونا چاہیے',
  passwordRequireNumber: 'پاس ورڈ میں کم از کم ایک نمبر ہونا چاہیے',
  passwordRequireSpecialChar: 'پاس ورڈ میں کم از کم ایک خاص حرف ہونا چاہیے',
  emailRequired: 'ای میل ضروری ہے',
  invalidEmail: 'براہ کرم ایک درست ای میل پتہ درج کریں',
  passwordRequired: 'پاس ورڈ ضروری ہے',
  nameRequired: 'نام ضروری ہے',
  confirmPasswordRequired: 'براہ کرم پاس ورڈ کی تصدیق کریں',
  acceptTermsRequired: 'آپ کو شرائط و ضوابط قبول کرنا ضروری ہے',
  passwordsDoNotMatch: 'پاس ورڈ مماثل نہیں ہیں',
  invalidPassword: 'غلط پاس ورڈ',
  invalidEmailAddress: 'غلط ای میل',
}

export default ur

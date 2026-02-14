const ar = {
  // Sign In
  signInTitle: 'تسجيل الدخول',
  signInButton: 'تسجيل الدخول',
  emailLabel: 'البريد الإلكتروني',
  passwordLabel: 'كلمة المرور',
  rememberMeLabel: 'تذكرني',
  forgotPasswordLink: 'نسيت كلمة المرور؟',
  noAccountLink: 'ليس لديك حساب؟ سجل الآن',

  // Sign Up
  signUpTitle: 'إنشاء حساب',
  signUpButton: 'إنشاء حساب',
  nameLabel: 'الاسم',
  confirmPasswordLabel: 'تأكيد كلمة المرور',
  acceptTermsLabel: 'أوافق على الشروط والأحكام',
  hasAccountLink: 'لديك حساب بالفعل؟ سجل الدخول',

  // Reset Password
  resetPasswordTitle: 'إعادة تعيين كلمة المرور',
  resetPasswordButton: 'إعادة تعيين كلمة المرور',
  resetPasswordDescription: 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور.',
  backToSignInLink: 'العودة إلى تسجيل الدخول',

  // Social Login
  continueWithProvider: (provider: string) => `المتابعة مع ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'ضعيفة',
  passwordStrengthFair: 'مقبولة',
  passwordStrengthGood: 'جيدة',
  passwordStrengthStrong: 'قوية',

  // Common
  orDivider: 'أو',
  error: 'حدث خطأ',
  required: 'مطلوب',

  // Modal
  authenticationTitle: 'المصادقة',

  // Validation messages
  passwordMinLength: (min: number) =>
    `يجب أن تتكون كلمة المرور من ${min} أحرف على الأقل`,
  passwordRequireUppercase:
    'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل',
  passwordRequireLowercase:
    'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل',
  passwordRequireNumber: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل',
  passwordRequireSpecialChar:
    'يجب أن تحتوي كلمة المرور على حرف خاص واحد على الأقل',
  emailRequired: 'البريد الإلكتروني مطلوب',
  invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صالح',
  passwordRequired: 'كلمة المرور مطلوبة',
  nameRequired: 'الاسم مطلوب',
  confirmPasswordRequired: 'يرجى تأكيد كلمة المرور',
  acceptTermsRequired: 'يجب الموافقة على الشروط والأحكام',
  passwordsDoNotMatch: 'كلمتا المرور غير متطابقتين',
  invalidPassword: 'كلمة مرور غير صالحة',
  invalidEmailAddress: 'بريد إلكتروني غير صالح',
}

export default ar

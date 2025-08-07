const ar = {
  // Sign In
  signInTitle: () => 'تسجيل الدخول',
  signInButton: () => 'تسجيل الدخول',
  emailLabel: () => 'البريد الإلكتروني',
  passwordLabel: () => 'كلمة المرور',
  rememberMeLabel: () => 'تذكرني',
  forgotPasswordLink: () => 'نسيت كلمة المرور؟',
  noAccountLink: () => 'ليس لديك حساب؟ سجل الآن',

  // Sign Up
  signUpTitle: () => 'إنشاء حساب',
  signUpButton: () => 'إنشاء حساب',
  nameLabel: () => 'الاسم',
  confirmPasswordLabel: () => 'تأكيد كلمة المرور',
  acceptTermsLabel: () => 'أوافق على الشروط والأحكام',
  hasAccountLink: () => 'لديك حساب بالفعل؟ سجل الدخول',

  // Reset Password
  resetPasswordTitle: () => 'إعادة تعيين كلمة المرور',
  resetPasswordButton: () => 'إعادة تعيين كلمة المرور',
  resetPasswordDescription: () => 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور.',
  backToSignInLink: () => 'العودة إلى تسجيل الدخول',

  // Social Login
  continueWithProvider: (provider: string) => `المتابعة مع ${provider}`,

  // Password Strength
  passwordStrengthWeak: () => 'ضعيفة',
  passwordStrengthFair: () => 'مقبولة',
  passwordStrengthGood: () => 'جيدة',
  passwordStrengthStrong: () => 'قوية',

  // Common
  orDivider: () => 'أو',
  error: () => 'حدث خطأ',
  required: () => 'مطلوب',

  // Modal
  authenticationTitle: () => 'المصادقة',
}

export default ar

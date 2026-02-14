const tr = {
  // Sign In
  signInTitle: 'Giriş Yap',
  signInButton: 'Giriş Yap',
  emailLabel: 'E-posta',
  passwordLabel: 'Şifre',
  rememberMeLabel: 'Beni hatırla',
  forgotPasswordLink: 'Şifreni mi unuttun?',
  noAccountLink: 'Hesabın yok mu? Kayıt ol',

  // Sign Up
  signUpTitle: 'Kayıt Ol',
  signUpButton: 'Kayıt Ol',
  nameLabel: 'İsim',
  confirmPasswordLabel: 'Şifreyi Onayla',
  acceptTermsLabel: 'Şartları ve koşulları kabul ediyorum',
  hasAccountLink: 'Zaten hesabın var mı? Giriş yap',

  // Reset Password
  resetPasswordTitle: 'Şifreyi Sıfırla',
  resetPasswordButton: 'Şifreyi Sıfırla',
  resetPasswordDescription: 'Şifreni sıfırlamak için e-posta adresini gir.',
  backToSignInLink: 'Giriş sayfasına dön',

  // Social Login
  continueWithProvider: (provider: string) => `${provider} ile devam et`,

  // Password Strength
  passwordStrengthWeak: 'Zayıf',
  passwordStrengthFair: 'Orta',
  passwordStrengthGood: 'İyi',
  passwordStrengthStrong: 'Güçlü',

  // Common
  orDivider: 'veya',
  error: 'Bir hata oluştu',
  required: 'Gerekli',

  // Modal
  authenticationTitle: 'Kimlik Doğrulama',

  // Validation messages
  passwordMinLength: (min: number) => `Şifre en az ${min} karakter olmalıdır`,
  passwordRequireUppercase: 'Şifre en az bir büyük harf içermelidir',
  passwordRequireLowercase: 'Şifre en az bir küçük harf içermelidir',
  passwordRequireNumber: 'Şifre en az bir rakam içermelidir',
  passwordRequireSpecialChar: 'Şifre en az bir özel karakter içermelidir',
  emailRequired: 'E-posta gereklidir',
  invalidEmail: 'Lütfen geçerli bir e-posta adresi girin',
  passwordRequired: 'Şifre gereklidir',
  nameRequired: 'İsim gereklidir',
  confirmPasswordRequired: 'Lütfen şifrenizi onaylayın',
  acceptTermsRequired: 'Şartları ve koşulları kabul etmelisiniz',
  passwordsDoNotMatch: 'Şifreler eşleşmiyor',
  invalidPassword: 'Geçersiz şifre',
  invalidEmailAddress: 'Geçersiz e-posta',
}

export default tr

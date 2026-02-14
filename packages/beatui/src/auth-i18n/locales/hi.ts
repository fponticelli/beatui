const hi = {
  // Sign In
  signInTitle: 'साइन इन',
  signInButton: 'साइन इन',
  emailLabel: 'ईमेल',
  passwordLabel: 'पासवर्ड',
  rememberMeLabel: 'मुझे याद रखें',
  forgotPasswordLink: 'पासवर्ड भूल गए?',
  noAccountLink: 'खाता नहीं है? साइन अप करें',

  // Sign Up
  signUpTitle: 'साइन अप',
  signUpButton: 'साइन अप',
  nameLabel: 'नाम',
  confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
  acceptTermsLabel: 'मैं नियम और शर्तों को स्वीकार करता हूं',
  hasAccountLink: 'पहले से खाता है? साइन इन करें',

  // Reset Password
  resetPasswordTitle: 'पासवर्ड रीसेट करें',
  resetPasswordButton: 'पासवर्ड रीसेट करें',
  resetPasswordDescription:
    'अपना पासवर्ड रीसेट करने के लिए अपना ईमेल दर्ज करें।',
  backToSignInLink: 'साइन इन पर वापस जाएं',

  // Social Login
  continueWithProvider: (provider: string) => `${provider} के साथ जारी रखें`,

  // Password Strength
  passwordStrengthWeak: 'कमजोर',
  passwordStrengthFair: 'ठीक',
  passwordStrengthGood: 'अच्छा',
  passwordStrengthStrong: 'मजबूत',

  // Common
  orDivider: 'या',
  error: 'एक त्रुटि हुई',
  required: 'आवश्यक',

  // Modal
  authenticationTitle: 'प्रमाणीकरण',

  // Validation messages
  passwordMinLength: (min: number) =>
    `पासवर्ड कम से कम ${min} अक्षरों का होना चाहिए`,
  passwordRequireUppercase: 'पासवर्ड में कम से कम एक बड़ा अक्षर होना चाहिए',
  passwordRequireLowercase: 'पासवर्ड में कम से कम एक छोटा अक्षर होना चाहिए',
  passwordRequireNumber: 'पासवर्ड में कम से कम एक अंक होना चाहिए',
  passwordRequireSpecialChar: 'पासवर्ड में कम से कम एक विशेष वर्ण होना चाहिए',
  emailRequired: 'ईमेल आवश्यक है',
  invalidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें',
  passwordRequired: 'पासवर्ड आवश्यक है',
  nameRequired: 'नाम आवश्यक है',
  confirmPasswordRequired: 'कृपया अपने पासवर्ड की पुष्टि करें',
  acceptTermsRequired: 'आपको नियम और शर्तों को स्वीकार करना होगा',
  passwordsDoNotMatch: 'पासवर्ड मेल नहीं खाते',
  invalidPassword: 'अमान्य पासवर्ड',
  invalidEmailAddress: 'अमान्य ईमेल',
}

export default hi

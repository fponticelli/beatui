const zh = {
  // Sign In
  signInTitle: '登录',
  signInButton: '登录',
  emailLabel: '邮箱',
  passwordLabel: '密码',
  rememberMeLabel: '记住我',
  forgotPasswordLink: '忘记密码？',
  noAccountLink: '没有账户？注册',

  // Sign Up
  signUpTitle: '注册',
  signUpButton: '注册',
  nameLabel: '姓名',
  confirmPasswordLabel: '确认密码',
  acceptTermsLabel: '我接受条款和条件',
  hasAccountLink: '已有账户？登录',

  // Reset Password
  resetPasswordTitle: '重置密码',
  resetPasswordButton: '重置密码',
  resetPasswordDescription: '输入您的邮箱地址以重置密码。',
  backToSignInLink: '返回登录',

  // Social Login
  continueWithProvider: (provider: string) => `使用${provider}继续`,

  // Password Strength
  passwordStrengthWeak: '弱',
  passwordStrengthFair: '一般',
  passwordStrengthGood: '良好',
  passwordStrengthStrong: '强',

  // Common
  orDivider: '或',
  error: '发生错误',
  required: '必填',

  // Modal
  authenticationTitle: '认证',

  // Validation messages
  passwordMinLength: (min: number) => `密码至少需要${min}个字符`,
  passwordRequireUppercase: '密码必须包含至少一个大写字母',
  passwordRequireLowercase: '密码必须包含至少一个小写字母',
  passwordRequireNumber: '密码必须包含至少一个数字',
  passwordRequireSpecialChar: '密码必须包含至少一个特殊字符',
  emailRequired: '邮箱为必填项',
  invalidEmail: '请输入有效的邮箱地址',
  passwordRequired: '密码为必填项',
  nameRequired: '姓名为必填项',
  confirmPasswordRequired: '请确认您的密码',
  acceptTermsRequired: '您必须接受条款和条件',
  passwordsDoNotMatch: '两次输入的密码不一致',
  invalidPassword: '密码无效',
  invalidEmailAddress: '邮箱无效',
}

export default zh

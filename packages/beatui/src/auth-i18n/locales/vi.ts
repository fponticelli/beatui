const vi = {
  // Sign In
  signInTitle: 'Đăng nhập',
  signInButton: 'Đăng nhập',
  emailLabel: 'Email',
  passwordLabel: 'Mật khẩu',
  rememberMeLabel: 'Ghi nhớ tôi',
  forgotPasswordLink: 'Quên mật khẩu?',
  noAccountLink: 'Chưa có tài khoản? Đăng ký',

  // Sign Up
  signUpTitle: 'Đăng ký',
  signUpButton: 'Đăng ký',
  nameLabel: 'Tên',
  confirmPasswordLabel: 'Xác nhận mật khẩu',
  acceptTermsLabel: 'Tôi chấp nhận các điều khoản và điều kiện',
  hasAccountLink: 'Đã có tài khoản? Đăng nhập',

  // Reset Password
  resetPasswordTitle: 'Đặt lại mật khẩu',
  resetPasswordButton: 'Đặt lại mật khẩu',
  resetPasswordDescription: 'Nhập email của bạn để đặt lại mật khẩu.',
  backToSignInLink: 'Quay lại đăng nhập',

  // Social Login
  continueWithProvider: (provider: string) => `Tiếp tục với ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Yếu',
  passwordStrengthFair: 'Khá',
  passwordStrengthGood: 'Tốt',
  passwordStrengthStrong: 'Mạnh',

  // Common
  orDivider: 'hoặc',
  error: 'Đã xảy ra lỗi',
  required: 'Bắt buộc',

  // Modal
  authenticationTitle: 'Xác thực',

  // Validation messages
  passwordMinLength: (min: number) => `Mật khẩu phải có ít nhất ${min} ký tự`,
  passwordRequireUppercase: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa',
  passwordRequireLowercase:
    'Mật khẩu phải chứa ít nhất một chữ cái viết thường',
  passwordRequireNumber: 'Mật khẩu phải chứa ít nhất một chữ số',
  passwordRequireSpecialChar: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt',
  emailRequired: 'Email là bắt buộc',
  invalidEmail: 'Vui lòng nhập địa chỉ email hợp lệ',
  passwordRequired: 'Mật khẩu là bắt buộc',
  nameRequired: 'Tên là bắt buộc',
  confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu của bạn',
  acceptTermsRequired: 'Bạn phải chấp nhận các điều khoản và điều kiện',
  passwordsDoNotMatch: 'Mật khẩu không khớp',
  invalidPassword: 'Mật khẩu không hợp lệ',
  invalidEmailAddress: 'Email không hợp lệ',
}

export default vi

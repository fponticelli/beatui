const ko = {
  // Sign In
  signInTitle: '로그인',
  signInButton: '로그인',
  emailLabel: '이메일',
  passwordLabel: '비밀번호',
  rememberMeLabel: '로그인 상태 유지',
  forgotPasswordLink: '비밀번호를 잊으셨나요?',
  noAccountLink: '계정이 없으신가요? 회원가입',

  // Sign Up
  signUpTitle: '회원가입',
  signUpButton: '회원가입',
  nameLabel: '이름',
  confirmPasswordLabel: '비밀번호 확인',
  acceptTermsLabel: '이용약관에 동의합니다',
  hasAccountLink: '이미 계정이 있으신가요? 로그인',

  // Reset Password
  resetPasswordTitle: '비밀번호 재설정',
  resetPasswordButton: '비밀번호 재설정',
  resetPasswordDescription: '비밀번호를 재설정하려면 이메일을 입력하세요.',
  backToSignInLink: '로그인으로 돌아가기',

  // Social Login
  continueWithProvider: (provider: string) => `${provider}로 계속`,

  // Password Strength
  passwordStrengthWeak: '약함',
  passwordStrengthFair: '보통',
  passwordStrengthGood: '좋음',
  passwordStrengthStrong: '강함',

  // Common
  orDivider: '또는',
  error: '오류가 발생했습니다',
  required: '필수',

  // Modal
  authenticationTitle: '인증',

  // Validation messages
  passwordMinLength: (min: number) =>
    `비밀번호는 최소 ${min}자 이상이어야 합니다`,
  passwordRequireUppercase: '비밀번호에 대문자가 최소 1개 포함되어야 합니다',
  passwordRequireLowercase: '비밀번호에 소문자가 최소 1개 포함되어야 합니다',
  passwordRequireNumber: '비밀번호에 숫자가 최소 1개 포함되어야 합니다',
  passwordRequireSpecialChar:
    '비밀번호에 특수문자가 최소 1개 포함되어야 합니다',
  emailRequired: '이메일은 필수 항목입니다',
  invalidEmail: '유효한 이메일 주소를 입력해 주세요',
  passwordRequired: '비밀번호는 필수 항목입니다',
  nameRequired: '이름은 필수 항목입니다',
  confirmPasswordRequired: '비밀번호를 확인해 주세요',
  acceptTermsRequired: '이용약관에 동의해야 합니다',
  passwordsDoNotMatch: '비밀번호가 일치하지 않습니다',
  invalidPassword: '유효하지 않은 비밀번호입니다',
  invalidEmailAddress: '유효하지 않은 이메일입니다',
}

export default ko

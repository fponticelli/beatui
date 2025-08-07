const ko = {
  // Sign In
  signInTitle: () => '로그인',
  signInButton: () => '로그인',
  emailLabel: () => '이메일',
  passwordLabel: () => '비밀번호',
  rememberMeLabel: () => '로그인 상태 유지',
  forgotPasswordLink: () => '비밀번호를 잊으셨나요?',
  noAccountLink: () => '계정이 없으신가요? 회원가입',

  // Sign Up
  signUpTitle: () => '회원가입',
  signUpButton: () => '회원가입',
  nameLabel: () => '이름',
  confirmPasswordLabel: () => '비밀번호 확인',
  acceptTermsLabel: () => '이용약관에 동의합니다',
  hasAccountLink: () => '이미 계정이 있으신가요? 로그인',

  // Reset Password
  resetPasswordTitle: () => '비밀번호 재설정',
  resetPasswordButton: () => '비밀번호 재설정',
  resetPasswordDescription: () => '비밀번호를 재설정하려면 이메일을 입력하세요.',
  backToSignInLink: () => '로그인으로 돌아가기',

  // Social Login
  continueWithProvider: (provider: string) => `${provider}로 계속하기`,

  // Password Strength
  passwordStrengthWeak: () => '약함',
  passwordStrengthFair: () => '보통',
  passwordStrengthGood: () => '좋음',
  passwordStrengthStrong: () => '강함',

  // Common
  orDivider: () => '또는',
  error: () => '오류가 발생했습니다',
  required: () => '필수',

  // Modal
  authenticationTitle: () => '인증',
}

export default ko

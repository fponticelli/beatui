const ja = {
  // Sign In
  signInTitle: () => 'ログイン',
  signInButton: () => 'ログイン',
  emailLabel: () => 'メールアドレス',
  passwordLabel: () => 'パスワード',
  rememberMeLabel: () => 'ログイン状態を保持',
  forgotPasswordLink: () => 'パスワードをお忘れですか？',
  noAccountLink: () => 'アカウントをお持ちでない方はこちら',

  // Sign Up
  signUpTitle: () => '新規登録',
  signUpButton: () => '新規登録',
  nameLabel: () => '名前',
  confirmPasswordLabel: () => 'パスワード確認',
  acceptTermsLabel: () => '利用規約に同意します',
  hasAccountLink: () => 'すでにアカウントをお持ちの方はこちら',

  // Reset Password
  resetPasswordTitle: () => 'パスワードリセット',
  resetPasswordButton: () => 'パスワードリセット',
  resetPasswordDescription: () =>
    'パスワードをリセットするためにメールアドレスを入力してください。',
  backToSignInLink: () => 'ログインに戻る',

  // Social Login
  continueWithProvider: (provider: string) => `${provider}で続行`,

  // Password Strength
  passwordStrengthWeak: () => '弱い',
  passwordStrengthFair: () => '普通',
  passwordStrengthGood: () => '良い',
  passwordStrengthStrong: () => '強い',

  // Common
  orDivider: () => 'または',
  error: () => 'エラーが発生しました',
  required: () => '必須',
}

export default ja

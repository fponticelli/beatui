const ja = {
  // Sign In
  signInTitle: 'ログイン',
  signInButton: 'ログイン',
  emailLabel: 'メールアドレス',
  passwordLabel: 'パスワード',
  rememberMeLabel: 'ログイン状態を保持',
  forgotPasswordLink: 'パスワードをお忘れですか？',
  noAccountLink: 'アカウント登録はこちら',

  // Sign Up
  signUpTitle: '新規登録',
  signUpButton: '新規登録',
  nameLabel: '名前',
  confirmPasswordLabel: 'パスワード確認',
  acceptTermsLabel: '利用規約に同意します',
  hasAccountLink: 'ログインはこちら',

  // Reset Password
  resetPasswordTitle: 'パスワードリセット',
  resetPasswordButton: 'パスワードリセット',
  resetPasswordDescription: 'メールアドレスを入力してパスワードをリセット',
  backToSignInLink: 'ログインに戻る',

  // Social Login
  continueWithProvider: (provider: string) => `${provider}で続行`,

  // Password Strength
  passwordStrengthWeak: '弱い',
  passwordStrengthFair: '普通',
  passwordStrengthGood: '良い',
  passwordStrengthStrong: '強い',

  // Common
  orDivider: 'または',
  error: 'エラーが発生しました',
  required: '必須',

  // Modal
  authenticationTitle: '認証',

  // Validation messages
  passwordMinLength: (min: number) =>
    `パスワードは${min}文字以上で入力してください`,
  passwordRequireUppercase: 'パスワードには大文字を1文字以上含めてください',
  passwordRequireLowercase: 'パスワードには小文字を1文字以上含めてください',
  passwordRequireNumber: 'パスワードには数字を1文字以上含めてください',
  passwordRequireSpecialChar: 'パスワードには特殊文字を1文字以上含めてください',
  emailRequired: 'メールアドレスは必須です',
  invalidEmail: '有効なメールアドレスを入力してください',
  passwordRequired: 'パスワードは必須です',
  nameRequired: '名前は必須です',
  confirmPasswordRequired: 'パスワードの確認を入力してください',
  acceptTermsRequired: '利用規約に同意する必要があります',
  passwordsDoNotMatch: 'パスワードが一致しません',
  invalidPassword: '無効なパスワードです',
  invalidEmailAddress: '無効なメールアドレスです',
}

export default ja

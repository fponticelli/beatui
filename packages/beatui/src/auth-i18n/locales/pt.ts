const pt = {
  // Sign In
  signInTitle: 'Entrar',
  signInButton: 'Entrar',
  emailLabel: 'Email',
  passwordLabel: 'Senha',
  rememberMeLabel: 'Lembrar-me',
  forgotPasswordLink: 'Esqueceu a senha?',
  noAccountLink: 'Não tem uma conta? Cadastre-se',

  // Sign Up
  signUpTitle: 'Cadastrar',
  signUpButton: 'Cadastrar',
  nameLabel: 'Nome',
  confirmPasswordLabel: 'Confirmar Senha',
  acceptTermsLabel: 'Aceito os termos e condições',
  hasAccountLink: 'Já tem uma conta? Entre',

  // Reset Password
  resetPasswordTitle: 'Redefinir Senha',
  resetPasswordButton: 'Redefinir Senha',
  resetPasswordDescription: 'Digite seu email para redefinir sua senha.',
  backToSignInLink: 'Voltar ao login',

  // Social Login
  continueWithProvider: (provider: string) => `Continuar com ${provider}`,

  // Password Strength
  passwordStrengthWeak: 'Fraca',
  passwordStrengthFair: 'Regular',
  passwordStrengthGood: 'Boa',
  passwordStrengthStrong: 'Forte',

  // Common
  orDivider: 'ou',
  error: 'Ocorreu um erro',
  required: 'Obrigatório',

  // Modal
  authenticationTitle: 'Autenticação',

  // Validation messages
  passwordMinLength: (min: number) =>
    `A senha deve ter pelo menos ${min} caracteres`,
  passwordRequireUppercase:
    'A senha deve conter pelo menos uma letra maiúscula',
  passwordRequireLowercase:
    'A senha deve conter pelo menos uma letra minúscula',
  passwordRequireNumber: 'A senha deve conter pelo menos um número',
  passwordRequireSpecialChar:
    'A senha deve conter pelo menos um caractere especial',
  emailRequired: 'O email é obrigatório',
  invalidEmail: 'Por favor, insira um endereço de email válido',
  passwordRequired: 'A senha é obrigatória',
  nameRequired: 'O nome é obrigatório',
  confirmPasswordRequired: 'Por favor, confirme sua senha',
  acceptTermsRequired: 'Você deve aceitar os termos e condições',
  passwordsDoNotMatch: 'As senhas não coincidem',
  invalidPassword: 'Senha inválida',
  invalidEmailAddress: 'Email inválido',
}

export default pt

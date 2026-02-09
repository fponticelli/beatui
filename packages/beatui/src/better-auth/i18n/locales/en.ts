const en = {
  // Two-Factor Authentication
  twoFactorSetupDescription:
    'Enter your password to enable two-factor authentication.',
  twoFactorEnableButton: 'Enable 2FA',
  twoFactorVerifyButton: 'Verify',
  twoFactorScanDescription:
    'Scan the code below with your authenticator app, then enter the verification code.',
  twoFactorBackupCodesDescription:
    'Save these backup codes in a safe place. You can use them to sign in if you lose access to your authenticator.',
  twoFactorCodePlaceholder: 'Enter 6-digit code',
  twoFactorBackupCodePlaceholder: 'Enter backup code',
  twoFactorEnabled: 'Two-factor authentication has been enabled.',
  twoFactorTotpDescription: 'Enter the code from your authenticator app.',
  twoFactorOtpDescription: 'Enter the one-time code sent to you.',
  twoFactorBackupDescription: 'Enter one of your backup codes.',
  twoFactorSendOtpButton: 'Send Code',
  twoFactorMethodLabel: (method: string) => {
    switch (method) {
      case 'totp':
        return 'Authenticator'
      case 'otp':
        return 'Email/SMS'
      case 'backup':
        return 'Backup Code'
      default:
        return method
    }
  },
  passwordPlaceholder: 'Enter your password',

  // Magic Link
  magicLinkDescription: 'Enter your email to receive a sign-in link.',
  magicLinkSendButton: 'Send Magic Link',
  magicLinkSent: 'A sign-in link has been sent to your email.',

  // Passkey
  passkeySignInButton: 'Sign in with Passkey',
  passkeyAddButton: 'Add Passkey',
  passkeyDeleteButton: 'Delete',
  passkeyRenameButton: 'Rename',
  passkeySaveButton: 'Save',
  passkeyCancelButton: 'Cancel',
  passkeyNamePlaceholder: 'Passkey name (optional)',
  passkeyUnnamed: 'Unnamed passkey',
}

export default en

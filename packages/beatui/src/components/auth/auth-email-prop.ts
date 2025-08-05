import { localStorageProp } from '@tempots/dom'

export const useAuthEmailProp = () =>
  localStorageProp<string | null>({
    key: 'bui_auth_email',
    defaultValue: null,
  })

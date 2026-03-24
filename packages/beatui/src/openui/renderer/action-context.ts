import { makeProviderMark, prop, type Prop, type Provider } from '@tempots/dom'

export interface ButtonAction {
  kind: 'button'
  type: string
  params: Record<string, unknown>
  humanFriendlyMessage: string
}

export interface FormSubmitAction {
  kind: 'form'
  type: string
  formName: string
  formState: Record<string, unknown>
  humanFriendlyMessage: string
}

export type ActionEvent = ButtonAction | FormSubmitAction

export interface ActionContext {
  onAction?: (event: ActionEvent) => void
  actions: Prop<ActionEvent[]>
}

interface ActionContextOptions {
  onAction?: (event: ActionEvent) => void
}

export const ActionContextProvider: Provider<ActionContext, ActionContextOptions> = {
  mark: makeProviderMark<ActionContext>('OpenUI:ActionContext'),
  create: (options: ActionContextOptions = {}) => {
    const actions = prop<ActionEvent[]>([])
    const ctx: ActionContext = {
      onAction: options.onAction,
      actions,
    }
    return {
      value: ctx,
      dispose: () => actions.dispose(),
    }
  },
}

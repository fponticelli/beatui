import { GroupController } from './value-controller'

export class FormController<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  In extends Record<string, any>,
> extends GroupController<In> {
  override dispose() {
    super.dispose()
    this.parent.disabled.dispose()
    this.value.dispose()
    this.status.dispose()
  }
}

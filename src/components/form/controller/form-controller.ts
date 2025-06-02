import { GroupController } from './group-controller'

export class FormController<In> extends GroupController<In> {
  override dispose() {
    super.dispose()
    this.parent.disabled.dispose()
    this.value.dispose()
    this.status.dispose()
  }
}

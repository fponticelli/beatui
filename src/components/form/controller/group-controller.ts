import { makeMapValidationResult } from './validation-result'
import { ValueController } from './value-controller'

export class GroupController<In> extends ValueController<In> {
  readonly field = <K extends keyof In & string>(field: K) => {
    const onChange = async (value: In[K]) => {
      this.change({
        ...this.value.value,
        [field]: value,
      })
    }
    return new ValueController<In[K]>(
      [...this.path, field],
      onChange,
      this.value.map((v: In) => v[field] as In[K]),
      this.status.map(makeMapValidationResult(field)),
      { disabled: this.disabled }
    )
  }
}

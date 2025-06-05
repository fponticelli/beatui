import { Toggle } from "@tempots/beatui";
import { Prop } from "@tempots/dom";

export function DisabledSelector({ disabled }: { disabled: Prop<boolean> }) {
  return Toggle({
    label: "Disabled",
    value: disabled,
    onChange: disabled.set
  });
}

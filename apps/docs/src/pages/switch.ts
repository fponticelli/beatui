import {
  ControlSize,
  Switch,
  TextInput,
  Label,
  Stack
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";
import { DisabledSelector } from "../elements/disabled-selector";
import { ControlsHeader } from "../elements/controls-header";

const allSizes: ControlSize[] = ["xs", "sm", "md", "lg", "xl"];

export const SwitchPage = () => {
  const label = prop("Switch me");
  const onLabel = prop("ON");
  const offLabel = prop("OFF");
  const disabled = prop(false);
  const value = prop(false);

  return Stack(
    attr.class("bu-h-full bu-overflow-hidden"),
    ControlsHeader(
      Stack(
        Switch({
          size: "sm",
          label: "On/Off",
          value,
          onChange: value.set
        })
      ),
      html.div(
        Label("Label"),
        TextInput({
          value: label,
          onInput: (value: string) => label.set(value)
        })
      ),
      Stack(
        Label("On Label"),
        TextInput({
          value: onLabel,
          onInput: (value: string) => onLabel.set(value)
        })
      ),
      Stack(
        Label("Off Label"),
        TextInput({
          value: offLabel,
          onInput: (value: string) => offLabel.set(value)
        })
      ),
      Stack(DisabledSelector({ disabled }))
    ),
    Stack(
      attr.class("bu-items-start bu-gap-2 bu-p-2 bu-h-full bu-overflow-auto"),
      html.table(
        html.thead(
          html.tr(
            html.th("size / status"),
            ...["on", "off"].map(status => html.th(status))
          )
        ),
        html.tbody(
          ...allSizes.map(size => {
            return html.tr(
              html.th(size),
              ...[true, false].map(status => {
                const localValue = value.map(v => v === status).deriveProp();
                const onChange = () => localValue.update(v => !v);
                return html.td(
                  Switch({
                    value: localValue,
                    onChange,
                    size,
                    disabled,
                    label,
                    onLabel,
                    offLabel
                  })
                );
              })
            );
          })
        )
      )
    )
  );
};

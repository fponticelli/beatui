import {
  Button,
  ControlSize,
  ButtonVariant,
  RadiusName,
  ThemeColorName,
  SegmentedControl,
  Toggle,
  TextInput,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";

const allSizes: ControlSize[] = ["xs", "sm", "md", "lg", "xl"];

export const TogglesPage = () => {
  const size = prop<ControlSize>("md");
  const label = prop("Toggle me");
  const onLabel = prop("ON");
  const offLabel = prop("OFF");
  const disabled = prop(false);
  const value = prop(false);

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("On/Off"),
      html.div(
        Toggle({
          value,
          onChange: value.set
        })
      ),
      Label("Label"),
      html.div(
        TextInput({
          value: label,
          onInput: (value: string) => label.set(value)
        })
      ),
      Label("On Label"),
      html.div(
        TextInput({
          value: onLabel,
          onInput: (value: string) => onLabel.set(value)
        })
      ),
      Label("Off Label"),
      html.div(
        TextInput({
          value: offLabel,
          onInput: (value: string) => offLabel.set(value)
        })
      ),
      Label("Disabled"),
      html.div(
        Toggle({
          value: disabled,
          onChange: (value: boolean) => disabled.set(value)
        })
      ),
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto"),
      html.table(
        html.thead(
          html.tr(
            html.th("size / status"),
            ...['on', 'off'].map(status => html.th(status))
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
                  Toggle({
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
            )
          })
        )
      )
    )
  );
};

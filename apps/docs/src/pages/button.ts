import {
  Button,
  ControlSize,
  ButtonVariant,
  RadiusName,
  ThemeColorName,
  SegmentedControl,
  TextInput,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";
import { ControlSizeSelector } from "../elements/control-size-selector";
import { DisabledSelector } from "../elements/disabled-selector";

const allVariants: ButtonVariant[] = [
  "filled",
  "light",
  "outline",
  "default",
  "text"
];

const allColors: ThemeColorName[] = [
  "base",
  "primary",
  "secondary",
  "success",
  "warning",
  "error",
  "info",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "cyan",
  "teal",
  "green",
  "emerald"
];

export const ButtonPage = () => {
  const roundedness = prop<RadiusName>("md");
  const size = prop<ControlSize>("md");
  const text = prop("Click Me!");
  const disabled = prop(false);

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("Roundedness"),
      html.div(
        SegmentedControl({
          options: {
            none: "NONE",
            xs: "XS",
            sm: "SM",
            md: "MD",
            lg: "LG",
            xl: "XL",
            full: "FULL"
          },
          value: roundedness,
          onChange: roundedness.set
        })
      ),
      Label("Size"),
      html.div(ControlSizeSelector({ size, onChange: size.set })),
      html.div(DisabledSelector({ disabled })),
      Label("Text"),
      html.div(
        TextInput({
          value: text,
          onInput: (value: string) => text.set(value)
        })
      )
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto"),
      html.table(
        html.thead(
          html.tr(
            html.th("color / variant"),
            ...allVariants.map(variant => html.th(variant))
          )
        ),
        html.tbody(
          ...allColors.map(color =>
            html.tr(
              html.th(color),
              ...allVariants.map(variant =>
                html.td(
                  Button(
                    {
                      disabled,
                      size,
                      roundedness,
                      variant,
                      color
                    },
                    text
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};

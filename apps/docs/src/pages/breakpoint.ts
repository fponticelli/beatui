import {
  ControlSize,
  Toggle,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";
import { ControlSizeSelector } from "../elements/control-size-selector";

export const BreakpointPage = () => {
  const size = prop<ControlSize>("md");
  const disabled = prop(false);

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("Size"),
      html.div(
        ControlSizeSelector({ size })
      ),
      html.div(
        Toggle({
          label: "Disabled",
          value: disabled,
          onChange: (value: boolean) => disabled.set(value)
        })
      )
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto"),
      html.table(
        html.thead(html.tr(html.th("color / variant"), html.th("TODO"))),
        html.tbody(html.tr(html.th("TODO"), html.td("TODO")))
      )
    )
  );
};

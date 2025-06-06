import {
  Icon,
  IconSize,
  SegmentedControl,
  Stack,
  Label,
  Group,
  ThemeColorName
} from "@tempots/beatui";
import { html, attr, prop, Value } from "@tempots/dom";
import { ColorSelector } from "../elements/color-selector";
import { ControlSizeSelector } from "../elements/control-size-selector";

function DisplayIcon({
  value,
  size,
  color
}: {
  value: Value<string>;
  size: Value<IconSize>;
  color: Value<ThemeColorName>;
}) {
  return html.div(
    attr.class(
      "bu-flex-col bu-items-center bu-p-2 bu-border bu-rounded bu-hover:bg-gray-50"
    ),
    html.div(
      attr.class("bu-mb-2"),
      Icon({
        icon: value,
        size,
        color,
        title: value
      })
    ),
    html.div(
      attr.class("bu-text-xs bu-text-gray-600 bu-text-center bu-break-all"),
      value
    )
  );
}

const icons = [
  "line-md:home",
  "line-md:account",
  "line-md:cog",
  "line-md:heart",
  "line-md:alert",
  "line-md:close",
  "line-md:arrow-left",
  "line-md:arrow-right",
  "line-md:plus",
  "line-md:minus",
  "line-md:edit",
  "line-md:trash",
  "line-md:search",
  "line-md:menu",
  "line-md:star",
  "tabler:home",
  "tabler:user",
  "tabler:settings",
  "tabler:heart",
  "tabler:alert-circle",
  "tabler:x",
  "tabler:check",
  "tabler:arrow-left",
  "tabler:arrow-right",
  "tabler:plus",
  "tabler:minus",
  "tabler:edit",
  "tabler:trash",
  "tabler:search",
  "tabler:menu-2",
  "tabler:star"
];

export const IconPage = () => {
  const size = prop<IconSize>("md");
  const color = prop<ThemeColorName>("base");

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("Size"),
      html.div(ControlSizeSelector({ size, onChange: size.set })),
      Label("Color"),
      html.div(
        ColorSelector({
          color,
          onChange: color.set
        })
      )
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto bu-space-y-lg"),
      Group(
        attr.class("bu-gap-4 bu-flex-wrap bu-flex bu-justify-center"),
        ...icons.map(icon => DisplayIcon({ value: icon, size, color }))
      )
    )
  );
};

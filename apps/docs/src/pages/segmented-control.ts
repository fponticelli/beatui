import {
  ControlSize,
  SegmentedControl,
  Stack,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";
import { DisabledSelector } from "../elements/disabled-selector";

const allSizes: ControlSize[] = ["xs", "sm", "md", "lg", "xl"];

export const SegmentedControlPage = () => {
  const disabled = prop(false);
  const options = {
    first: "First",
    second: "Second",
    third: "Third"
  }
  const value = prop<keyof typeof options>('second');

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      html.div(DisabledSelector({ disabled })),
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto bu-space-y-lg"),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Size Variations"),
        html.table(
          attr.class("bu-w-full bu-border-collapse"),
          html.thead(
            html.tr(
              html.th(attr.class("bu-border bu-p-2 bu-text-left"), "Size"),
              html.th(attr.class("bu-border bu-p-2 bu-text-left"), "Example")
            )
          ),
          html.tbody(
            ...allSizes.map(currentSize =>
              html.tr(
                html.th(attr.class("bu-border bu-p-2"), currentSize),
                html.td(
                  attr.class("bu-border bu-p-2"),
                  SegmentedControl({
                    options,
                    size: currentSize,
                    disabled,
                    value,
                    onChange: value.set
                  })
                )
              )
            )
          )
        )
      ),
    )
  );
};

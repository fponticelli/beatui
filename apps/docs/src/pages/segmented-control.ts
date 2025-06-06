import {
  ControlSize,
  SegmentedControl,
  Toggle,
  TextInput,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";
import { ControlSizeSelector } from "../elements/control-size-selector";
import { DisabledSelector } from "../elements/disabled-selector";

const allSizes: ControlSize[] = ["xs", "sm", "md", "lg", "xl"];

export const SegmentedControlPage = () => {
  const size = prop<ControlSize>("md");
  const disabled = prop(false);
  const segmentCount = prop(3);
  const activeSegment = prop<number | null>(0);

  const generateSegments = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      label: `Option ${i + 1}`,
      onSelect: () => activeSegment.set(i)
    }));
  };

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("Size"),
      html.div(ControlSizeSelector({ size })),
      html.div(DisabledSelector({ disabled })),
      Label("Segment Count"),
      html.div(
        TextInput({
          value: segmentCount.map(v => v.toString()),
          onInput: (value: string) => {
            const num = parseInt(value);
            if (!isNaN(num) && num >= 2 && num <= 8) {
              segmentCount.set(num);
              activeSegment.set(0);
            }
          }
        })
      )
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto bu-space-y-lg"),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Interactive Example"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded"),
          SegmentedControl({
            options: {
              option1: "Option 1",
              option2: "Option 2",
              option3: "Option 3"
            },
            value: activeSegment,
            onChange: activeSegment.set,
            // segments: segmentCount.map(generateSegments),
            // activeSegment,
            size,
            // onSegmentChange: (index) => activeSegment.set(index ?? null)
          }),
          html.div(
            attr.class("bu-mt-4 bu-text-sm bu-text-gray-600"),
            "Selected: ",
            activeSegment.map(i => i !== null ? `Option ${i + 1}` : "None")
          )
        )
      ),
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
                    options: {
                      first: "First",
                      second: "Second",
                      third: "Third"
                    },
                    size: currentSize,
                    value: prop("second"),
                    onChange: () => {}
                    // segments: [
                    //   { label: "First" },
                    //   { label: "Second" },
                    //   { label: "Third" }
                    // ],
                    // activeSegment: prop(1),
                    // size: prop(currentSize)
                  })
                )
              )
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Common Use Cases"),
        html.div(
          attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-gap-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "View Toggle"),
            SegmentedControl({
              options: {
                list: "📋 List",
                grid: "🔲 Grid",
                chart: "📊 Chart"
              },
              value: prop("list"),
              onChange: () => {}
              // segments: [
              //   { label: "📋 List" },
              //   { label: "🔲 Grid" },
              //   { label: "📊 Chart" }
              // ],
              // activeSegment: prop(0)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Time Period"),
            SegmentedControl({
              options: {
                "1D": "1D",
                "1W": "1W",
                "1M": "1M",
                "3M": "3M",
                "1Y": "1Y"
              },
              value: prop("1M"),
              onChange: () => {}
              // segments: [
              //   { label: "1D" },
              //   { label: "1W" },
              //   { label: "1M" },
              //   { label: "3M" },
              //   { label: "1Y" }
              // ],
              // activeSegment: prop(2)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Text Alignment"),
            SegmentedControl({
              options: {
                left: "⬅️",
                center: "⬆️",
                right: "➡️"
              },
              value: prop("center"),
              onChange: () => {}
              // segments: [
              //   { label: "⬅️" },
              //   { label: "⬆️" },
              //   { label: "➡️" }
              // ],
              // activeSegment: prop(1)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Status Filter"),
            SegmentedControl({
              options: {
                all: "All",
                active: "Active",
                inactive: "Inactive",
                pending: "Pending"
              },
              value: prop("all"),
              onChange: () => {}
              // segments: [
              //   { label: "All" },
              //   { label: "Active" },
              //   { label: "Inactive" },
              //   { label: "Pending" }
              // ],
              // activeSegment: prop(0)
            })
          )
        )
      )
    )
  );
};

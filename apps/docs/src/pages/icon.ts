import {
  Icon,
  IconSize,
  SegmentedControl,
  TextInput,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";

const allSizes: IconSize[] = ["xs", "sm", "md", "lg", "xl"];

const iconSets = [
  {
    name: "Line MD Icons",
    icons: [
      "line-md:home",
      "line-md:account",
      "line-md:cog",
      "line-md:heart",
      "line-md:alert",
      "line-md:check",
      "line-md:close",
      "line-md:arrow-left",
      "line-md:arrow-right",
      "line-md:plus",
      "line-md:minus",
      "line-md:edit",
      "line-md:trash",
      "line-md:search",
      "line-md:menu",
      "line-md:star"
    ]
  },
  {
    name: "Tabler Icons",
    icons: [
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
    ]
  }
];

const colors = [
  { name: "Default", value: undefined },
  { name: "Red", value: "red" },
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Purple", value: "purple" },
  { name: "Orange", value: "orange" }
];

export const IconPage = () => {
  const size = prop<IconSize>("md");
  const color = prop<string | undefined>(undefined);
  const customIcon = prop("line-md:home");
  const title = prop("Home icon");

  const sizeIndex = size.map(s => allSizes.indexOf(s)).deriveProp();
  const colorIndex = color.map(c => colors.findIndex(col => col.value === c)).deriveProp();

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("Size"),
      html.div(
        SegmentedControl({
          segments: allSizes.map((s, i) => ({
            label: s.toUpperCase(),
            onSelect: () => size.set(s)
          })),
          activeSegment: sizeIndex
        })
      ),
      Label("Color"),
      html.div(
        SegmentedControl({
          segments: colors.map((c, i) => ({
            label: c.name,
            onSelect: () => color.set(c.value)
          })),
          activeSegment: colorIndex
        })
      ),
      Label("Custom Icon"),
      html.div(
        TextInput({
          value: customIcon,
          onInput: (value: string) => customIcon.set(value)
        })
      ),
      Label("Title (Accessibility)"),
      html.div(
        TextInput({
          value: title,
          onInput: (value: string) => title.set(value)
        })
      )
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto bu-space-y-lg"),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Interactive Example"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded bu-text-center"),
          Icon({
            icon: customIcon,
            size,
            color,
            title
          }),
          html.div(
            attr.class("bu-mt-4 bu-text-sm bu-text-gray-600"),
            "Icon: ",
            customIcon,
            " | Size: ",
            size,
            " | Color: ",
            color.map(c => c || "default")
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Size Variations"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded"),
          html.div(
            attr.class("bu-flex bu-items-center bu-justify-center bu-gap-8"),
            ...allSizes.map(currentSize =>
              html.div(
                attr.class("bu-text-center"),
                html.div(
                  attr.class("bu-mb-2"),
                  Icon({
                    icon: prop("line-md:home"),
                    size: prop(currentSize)
                  })
                ),
                html.div(
                  attr.class("bu-text-sm bu-text-gray-600"),
                  currentSize
                )
              )
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Color Variations"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded"),
          html.div(
            attr.class("bu-flex bu-items-center bu-justify-center bu-gap-8 bu-flex-wrap"),
            ...colors.map(colorOption =>
              html.div(
                attr.class("bu-text-center"),
                html.div(
                  attr.class("bu-mb-2"),
                  Icon({
                    icon: prop("line-md:heart"),
                    size: prop("lg"),
                    color: prop(colorOption.value)
                  })
                ),
                html.div(
                  attr.class("bu-text-sm bu-text-gray-600"),
                  colorOption.name
                )
              )
            )
          )
        )
      ),
      ...iconSets.map(iconSet =>
        html.div(
          attr.class("bu-space-y-md"),
          html.h3(attr.class("bu-text-lg bu-font-semibold"), iconSet.name),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.div(
              attr.class("bu-grid bu-grid-cols-4 bu-md:grid-cols-6 bu-lg:grid-cols-8 bu-gap-4"),
              ...iconSet.icons.map(iconName =>
                html.div(
                  attr.class("bu-flex bu-flex-col bu-items-center bu-p-2 bu-border bu-rounded bu-hover:bg-gray-50"),
                  html.div(
                    attr.class("bu-mb-2"),
                    Icon({
                      icon: prop(iconName),
                      size: prop("md")
                    })
                  ),
                  html.div(
                    attr.class("bu-text-xs bu-text-gray-600 bu-text-center bu-break-all"),
                    iconName.split(":")[1] || iconName
                  )
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
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Navigation"),
            html.div(
              attr.class("bu-flex bu-items-center bu-gap-4"),
              Icon({ icon: prop("line-md:home"), size: prop("md") }),
              html.span("Home"),
              Icon({ icon: prop("line-md:account"), size: prop("md") }),
              html.span("Profile"),
              Icon({ icon: prop("line-md:cog"), size: prop("md") }),
              html.span("Settings")
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Actions"),
            html.div(
              attr.class("bu-flex bu-items-center bu-gap-4"),
              Icon({ icon: prop("line-md:edit"), size: prop("md") }),
              html.span("Edit"),
              Icon({ icon: prop("line-md:trash"), size: prop("md") }),
              html.span("Delete"),
              Icon({ icon: prop("line-md:plus"), size: prop("md") }),
              html.span("Add")
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Status"),
            html.div(
              attr.class("bu-flex bu-items-center bu-gap-4"),
              Icon({ icon: prop("line-md:check"), size: prop("md"), color: prop("green") }),
              html.span("Success"),
              Icon({ icon: prop("line-md:alert"), size: prop("md"), color: prop("orange") }),
              html.span("Warning"),
              Icon({ icon: prop("line-md:close"), size: prop("md"), color: prop("red") }),
              html.span("Error")
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Interactive"),
            html.div(
              attr.class("bu-flex bu-items-center bu-gap-4"),
              Icon({ icon: prop("line-md:heart"), size: prop("md"), color: prop("red") }),
              html.span("Like"),
              Icon({ icon: prop("line-md:star"), size: prop("md"), color: prop("orange") }),
              html.span("Favorite"),
              Icon({ icon: prop("line-md:search"), size: prop("md") }),
              html.span("Search")
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Technical Details"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded bu-bg-gray-50"),
          html.div(
            attr.class("bu-space-y-2 bu-text-sm"),
            html.div(attr.class("bu-font-medium"), "Icon System Features:"),
            html.div("✅ Pure CSS solution with dynamic loading"),
            html.div("✅ Iconify integration with 100,000+ icons"),
            html.div("✅ Local caching with IndexedDB"),
            html.div("✅ Lazy loading with viewport detection"),
            html.div("✅ Accessibility support with titles"),
            html.div("✅ Customizable sizes and colors"),
            html.br(),
            html.div(attr.class("bu-font-medium"), "Usage:"),
            html.div(attr.class("bu-font-mono bu-bg-white bu-p-2 bu-rounded"), 'Icon({ icon: "line-md:home", size: "md", color: "blue" })')
          )
        )
      )
    )
  );
};

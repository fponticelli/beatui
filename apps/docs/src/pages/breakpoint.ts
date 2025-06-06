import {
  Button,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";

const breakpoints = [
  { name: "sm", value: "40rem", pixels: "640px", description: "Small devices (phones)" },
  { name: "md", value: "48rem", pixels: "768px", description: "Medium devices (tablets)" },
  { name: "lg", value: "64rem", pixels: "1024px", description: "Large devices (laptops)" },
  { name: "xl", value: "80rem", pixels: "1280px", description: "Extra large devices (desktops)" },
  { name: "2xl", value: "96rem", pixels: "1536px", description: "2X large devices (large desktops)" }
];

export const BreakpointPage = () => {
  const currentWidth = prop("Unknown");

  // Update current width on resize
  if (typeof window !== "undefined") {
    const updateWidth = () => {
      const width = window.innerWidth;
      currentWidth.set(`${width}px`);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
  }

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("Current Viewport"),
      html.div(
        attr.class("bu-p-2 bu-border bu-rounded bu-bg-gray-50"),
        html.span(attr.class("bu-font-mono"), currentWidth)
      ),
      Label("Resize Window"),
      html.div(
        attr.class("bu-text-sm bu-text-gray-600"),
        "Resize your browser window to see responsive behavior"
      )
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto bu-space-y-lg"),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "BeatUI Breakpoint System"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded"),
          html.p(attr.class("bu-mb-4 bu-text-gray-700"),
            "BeatUI uses a mobile-first responsive design system with the following breakpoints:"
          ),
          html.table(
            attr.class("bu-w-full bu-border-collapse"),
            html.thead(
              html.tr(
                html.th(attr.class("bu-border bu-p-3 bu-text-left bu-bg-gray-50"), "Name"),
                html.th(attr.class("bu-border bu-p-3 bu-text-left bu-bg-gray-50"), "Value"),
                html.th(attr.class("bu-border bu-p-3 bu-text-left bu-bg-gray-50"), "Pixels"),
                html.th(attr.class("bu-border bu-p-3 bu-text-left bu-bg-gray-50"), "Description")
              )
            ),
            html.tbody(
              ...breakpoints.map(bp =>
                html.tr(
                  html.td(attr.class("bu-border bu-p-3 bu-font-mono bu-font-semibold"), bp.name),
                  html.td(attr.class("bu-border bu-p-3 bu-font-mono"), bp.value),
                  html.td(attr.class("bu-border bu-p-3 bu-font-mono"), bp.pixels),
                  html.td(attr.class("bu-border bu-p-3"), bp.description)
                )
              )
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Responsive Grid Examples"),
        html.div(
          attr.class("bu-space-y-6"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "1 Column → 2 Columns → 4 Columns"),
            html.div(
              attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-xl:grid-cols-4 bu-gap-4"),
              ...Array.from({ length: 8 }, (_, i) =>
                html.div(
                  attr.class("bu-p-4 bu-bg-blue-100 bu-border bu-rounded bu-text-center"),
                  `Item ${i + 1}`
                )
              )
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Responsive Card Layout"),
            html.div(
              attr.class("bu-grid bu-grid-cols-1 bu-sm:grid-cols-2 bu-lg:grid-cols-3 bu-gap-6"),
              ...Array.from({ length: 6 }, (_, i) =>
                html.div(
                  attr.class("bu-p-6 bu-bg-white bu-border bu-rounded bu-shadow"),
                  html.h5(attr.class("bu-font-semibold bu-mb-2"), `Card ${i + 1}`),
                  html.p(attr.class("bu-text-gray-600 bu-text-sm"),
                    "This card adapts to different screen sizes using responsive grid classes."
                  )
                )
              )
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Responsive Utilities"),
        html.div(
          attr.class("bu-space-y-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Responsive Text Sizes"),
            html.div(
              attr.class("bu-space-y-2"),
              html.div(
                attr.class("bu-text-sm bu-md:text-base bu-lg:text-lg bu-xl:text-xl"),
                "This text grows larger on bigger screens"
              ),
              html.div(
                attr.class("bu-text-xs bu-sm:text-sm bu-md:text-base"),
                "This text also scales responsively"
              )
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Responsive Spacing"),
            html.div(
              attr.class("bu-space-y-2 bu-md:space-y-4 bu-lg:space-y-6"),
              html.div(attr.class("bu-p-2 bu-md:p-4 bu-lg:p-6 bu-bg-green-100 bu-rounded"), "Responsive padding"),
              html.div(attr.class("bu-p-2 bu-md:p-4 bu-lg:p-6 bu-bg-green-100 bu-rounded"), "Responsive padding"),
              html.div(attr.class("bu-p-2 bu-md:p-4 bu-lg:p-6 bu-bg-green-100 bu-rounded"), "Responsive padding")
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Responsive Visibility"),
            html.div(
              attr.class("bu-space-y-2"),
              html.div(
                attr.class("bu-p-3 bu-bg-red-100 bu-rounded bu-block bu-md:hidden"),
                "Visible only on small screens"
              ),
              html.div(
                attr.class("bu-p-3 bu-bg-blue-100 bu-rounded bu-hidden bu-md:block bu-lg:hidden"),
                "Visible only on medium screens"
              ),
              html.div(
                attr.class("bu-p-3 bu-bg-green-100 bu-rounded bu-hidden bu-lg:block"),
                "Visible only on large screens and up"
              )
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Responsive Components"),
        html.div(
          attr.class("bu-space-y-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Responsive Button Layout"),
            html.div(
              attr.class("bu-flex bu-flex-col bu-sm:flex-row bu-gap-2 bu-sm:gap-4"),
              Button({ variant: prop("filled"), color: prop("primary") }, "Primary"),
              Button({ variant: prop("outline"), color: prop("secondary") }, "Secondary"),
              Button({ variant: prop("text"), color: prop("base") }, "Text")
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Responsive Navigation"),
            html.div(
              attr.class("bu-flex bu-flex-col bu-md:flex-row bu-gap-1 bu-md:gap-4"),
              html.a(attr.class("bu-p-2 bu-hover:bg-gray-100 bu-rounded"), "Home"),
              html.a(attr.class("bu-p-2 bu-hover:bg-gray-100 bu-rounded"), "About"),
              html.a(attr.class("bu-p-2 bu-hover:bg-gray-100 bu-rounded"), "Services"),
              html.a(attr.class("bu-p-2 bu-hover:bg-gray-100 bu-rounded"), "Contact")
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "CSS Classes Reference"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded bu-bg-gray-50"),
          html.div(
            attr.class("bu-space-y-2 bu-text-sm"),
            html.div(attr.class("bu-font-medium"), "Responsive Prefixes:"),
            html.div("• No prefix: Applies to all screen sizes"),
            html.div("• bu-sm: Applies from 640px and up"),
            html.div("• bu-md: Applies from 768px and up"),
            html.div("• bu-lg: Applies from 1024px and up"),
            html.div("• bu-xl: Applies from 1280px and up"),
            html.div("• bu-2xl: Applies from 1536px and up"),
            html.br(),
            html.div(attr.class("bu-font-medium"), "Common Responsive Patterns:"),
            html.div("• bu-grid-cols-1 bu-md:grid-cols-2 bu-lg:grid-cols-3"),
            html.div("• bu-text-sm bu-md:text-base bu-lg:text-lg"),
            html.div("• bu-p-2 bu-md:p-4 bu-lg:p-6"),
            html.div("• bu-flex-col bu-md:flex-row"),
            html.div("• bu-hidden bu-md:block"),
            html.br(),
            html.div(attr.class("bu-font-medium"), "Mobile-First Approach:"),
            html.div("BeatUI follows a mobile-first approach where styles are applied to mobile devices first, then enhanced for larger screens using min-width media queries.")
          )
        )
      )
    )
  );
};

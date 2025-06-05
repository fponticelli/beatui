import { html, attr } from "@tempots/dom";
import { Anchor } from "@tempots/ui";

export function Menu() {
  return html.div(
    attr.class("bu-flex-col"),
    Anchor({ href: "/button", withViewTransition: true }, "Button"),
    Anchor({ href: "/toggle", withViewTransition: true }, "Toggle"),
    Anchor({ href: "/collapse", withViewTransition: true }, "Collapse"),
    Anchor({ href: "/icon", withViewTransition: true }, "Icon"),
    Anchor(
      { href: "/segmented-control", withViewTransition: true },
      "Segmented Control"
    ),
    Anchor({ href: "/tags", withViewTransition: true }, "Tags"),
    Anchor({ href: "/form", withViewTransition: true }, "Form"),
    Anchor(
      { href: "/editable-text", withViewTransition: true },
      "Editable Text"
    ),
    Anchor({ href: "/breakpoint", withViewTransition: true }, "Breakpoint")
  );
}

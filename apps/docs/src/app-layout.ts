import { html, attr, TNode } from "@tempots/dom";
import { AppShell, Group } from "@tempots/beatui";
import { Anchor } from "@tempots/ui";

export function AppLayout({ children }: { children: TNode }) {
  return AppShell({
    menu: {
      content: html.div(
        attr.class("bu-flex-col"),
        Anchor({ href: "/buttons", withViewTransition: true }, "Button"),
        Anchor({ href: "/toggles", withViewTransition: true }, "Toggle"),
        Anchor({ href: "/about", withViewTransition: true }, "About")
      )
    },
    header: {
      content: Group(
        attr.class("bu-h-full bu-justify-between"),
        Anchor(
          { href: "/", withViewTransition: true },
          attr.class("bu-h-full bu-p-2"),
          html.img(attr.class("bu-h-full"), attr.src("/beatui-logo.png"))
        ),
        html.h2("Header"),
        html.p("This is the header")
      )
    },
    main: {
      content: html.div(attr.class("bu-h-full bu-overflow-hidden"), children)
    }
  });
}

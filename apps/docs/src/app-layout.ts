import { html, attr, TNode } from "@tempots/dom";
import { AppShell, Group } from "@tempots/beatui";
import { Anchor } from "@tempots/ui";
import { Menu } from "./views/menu";

export function AppLayout({ children }: { children: TNode }) {
  return AppShell({
    menu: {
      content: Menu()
    },
    header: {
      content: Group(
        attr.class("bu-h-full bu-justify-between"),
        Anchor(
          { href: "/", withViewTransition: true },
          attr.class("bu-h-full bu-p-2"),
          html.img(attr.class("bu-h-full"), attr.src("/beatui-logo.png"))
        ),
        html.p("THEME TOGGLE")
      )
    },
    main: {
      content: html.div(attr.class("bu-h-full bu-overflow-hidden"), children)
    }
  });
}

import { SidebarLink, CollapsibleSidebarGroup } from "@tempots/beatui";
import { html, attr, style } from "@tempots/dom";

export const SidebarPage = () => {
  return html.div(
    attr.class("bu-flex bu-h-screen bu-w-full bu-overflow-auto bu-p-4"),
    style.width("320px"),
    CollapsibleSidebarGroup(
      {
        icon: "lucide:home",
        header: "Home",
        rail: true,
        startOpen: true
      },
      SidebarLink({ href: "/sidebar", content: "Active Link" }),
      SidebarLink({ href: "/button", content: "Inactive Link" }),
      SidebarLink({
        onClick: () => {
          console.log("Button clicked");
        },
        content: "Clickable Link"
      }),
      SidebarLink({
        href: "/sidebar",
        icon: "lucide:home",
        content: "Active Link"
      }),
      SidebarLink({
        href: "/button",
        icon: "lucide:cog",
        content: "Inactive Link"
      }),
      SidebarLink({
        icon: "lucide:bell",
        onClick: () => {
          console.log("Button clicked");
        },
        content: "Clickable Link"
      }),
      SidebarLink({
        href: "/sidebar",
        icon: "lucide:home",
        content: "Active Link",
        action: {
          icon: "lucide:more-horizontal",
          onClick: () => {
            console.log("Action clicked");
          }
        }
      }),
      SidebarLink({
        href: "/button",
        icon: "lucide:cog",
        content: "Inactive Link",
        action: {
          icon: "lucide:more-horizontal",
          onClick: () => {
            console.log("Action clicked");
          }
        }
      }),
      SidebarLink({
        icon: "lucide:bell",
        onClick: () => {
          console.log("Button clicked");
        },
        content: "Clickable Link",
        action: {
          icon: "lucide:more-horizontal",
          onClick: () => {
            console.log("Action clicked");
          }
        }
      }),
      CollapsibleSidebarGroup(
        {
          icon: "lucide:home",
          header: "Home",
          rail: true,
          startOpen: true
        },
        SidebarLink({ href: "/sidebar", content: "Active Link" }),
        SidebarLink({ href: "/button", content: "Inactive Link" }),
        SidebarLink({
          onClick: () => {
            console.log("Button clicked");
          },
          content: "Clickable Link"
        }),
        SidebarLink({
          href: "/sidebar",
          icon: "lucide:home",
          content: "Active Link"
        }),
        SidebarLink({
          href: "/button",
          icon: "lucide:cog",
          content: "Inactive Link"
        }),
        SidebarLink({
          icon: "lucide:bell",
          onClick: () => {
            console.log("Button clicked");
          },
          content: "Clickable Link"
        }),
        SidebarLink({
          href: "/sidebar",
          icon: "lucide:home",
          content: "Active Link",
          action: {
            icon: "lucide:more-horizontal",
            onClick: () => {
              console.log("Action clicked");
            }
          }
        }),
        SidebarLink({
          href: "/button",
          icon: "lucide:cog",
          content: "Inactive Link",
          action: {
            icon: "lucide:more-horizontal",
            onClick: () => {
              console.log("Action clicked");
            }
          }
        }),
        SidebarLink({
          icon: "lucide:bell",
          onClick: () => {
            console.log("Button clicked");
          },
          content: "Clickable Link",
          action: {
            icon: "lucide:more-horizontal",
            onClick: () => {
              console.log("Action clicked");
            }
          }
        })
      )
    )
  );
};

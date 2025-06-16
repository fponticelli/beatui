import { Fragment, html, Provide } from "@tempots/dom";
import { Location, Router } from "@tempots/ui";
import { Theme, ThemeAppearance } from "@tempots/beatui";
import { HomePage } from "./pages/home";
import { AppLayout } from "./app-layout";
import { ButtonPage } from "./pages/button";
import { TogglePage } from "./pages/toggle";
import { IconPage } from "./pages/icon";
import { SegmentedControlPage } from "./pages/segmented-control";
import { TagsPage } from "./pages/tags";
import { FormPage } from "./pages/form";
import { EditableTextPage } from "./pages/editable-text";
import { BreakpointPage } from "./pages/breakpoint";
import { CollapsePage } from "./pages/collapse";

export const App = () => {
  return Provide(Theme, {}, () =>
    Provide(Location, {}, () =>
      Fragment(
        ThemeAppearance(),
        AppLayout({
          children: Router({
            "/": HomePage,
            "/button": ButtonPage,
            "/toggle": TogglePage,
            "/collapse": CollapsePage,
            "/icon": IconPage,
            "/segmented-control": SegmentedControlPage,
            "/tags": TagsPage,
            "/form": FormPage,
            "/editable-text": EditableTextPage,
            "/breakpoint": BreakpointPage,
            "/*": () => html.div("Not Found"),
          })
        })
      )
    )
  );
};

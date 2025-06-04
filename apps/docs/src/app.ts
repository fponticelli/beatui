import { Fragment, html, Provide } from "@tempots/dom";
import { Location, Router } from "@tempots/ui";
import { Theme, ThemeAppeareance } from "@tempots/beatui";
import { HomePage } from "./pages/home";
import { AppLayout } from "./app-layout";
import { ButtonsPage } from "./pages/buttons";
import { TogglesPage } from "./pages/toggles";

export const App = () => {
  return Provide(Theme, {}, () =>
    Provide(Location, {}, () =>
      Fragment(
        ThemeAppeareance(),
        AppLayout({
          children: Router({
            "/": HomePage,
            "/buttons": ButtonsPage,
            "/toggles": TogglesPage,
          })
        })
      )
    )
  );
};

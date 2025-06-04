import { html, attr } from "@tempots/dom";
import { Button } from "@tempots/beatui";

export const HomePage = () => {
  return html.div(
    Button(
      {
        variant: "filled",
        onClick: () => alert("Hello from BeatUI!")
      },
      "Click me!"
    )
  );
};

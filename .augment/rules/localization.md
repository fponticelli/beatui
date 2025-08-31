---
type: 'agent_requested'
description: 'Example description'
---

Whenever there is a need for a localized message that is user visable (either rendered in the dom or as an "aria label"), use the `Use(BeatUI18n, t => ...)` component to retrieve the localized messages. Make sure that any new localized message is correctly added to each locale file like `en.ts` and `it.ts`.
Note that authentication related messages will use `Use(Auth18n, t => ...)` and a different set of locale files to avoid bundling too many things together.

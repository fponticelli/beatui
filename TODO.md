# TODO

## JSON Schema Form

- [ ] address nullability and optionality correctly
- [ ] tags input
- [ ] const
- [ ] enum input
- [ ] union
- [ ] nullable inputs
- [ ] date input
- [ ] datetime input
- [ ] markdown input
- [ ] grid view
- [ ] basic layout
- [ ] add visual hints for component that cannot be rendered
- [ ] color (infer from name, pattern or format)

- [ ] format:
  - [ ] date: full-date according to RFC3339 (opens new window).
  - [ ] time: time (time-zone is mandatory).
  - [ ] date-time: date-time (time-zone is mandatory).
  - [ ] iso-time: time with optional time-zone.
  - [ ] iso-date-time: date-time with optional time-zone.
  - [ ] duration: duration from RFC3339(opens new window)
  - [ ] uri: full URI.
  - [ ] uri-reference: URI reference, including full and relative URIs.
  - [ ] uri-template: URI template according to RFC6570(opens new window)
  - [ ] url (deprecated): URL record (opens new window).
  - [x] email: email address.
  - [ ] hostname: host name according to RFC1034 (opens new window).
  - [ ] ipv4: IP address v4.
  - [ ] ipv6: IP address v6.
  - [ ] regex: tests whether a string is a valid regular expression by passing it to RegExp constructor.
  - [ ] uuid: Universally Unique IDentifier according to RFC4122 (opens new window).
  - [ ] json-pointer: JSON-pointer according to RFC6901 (opens new window).
  - [ ] relative-json-pointer: relative JSON-pointer according to this draft (opens new window).
  - [ ] byte: base64 encoded data according to the openApi 3.0.0 specification(opens new window)
  - [ ] int32: signed 32 bits integer according to the openApi 3.0.0 specification(opens new window)
  - [ ] int64: signed 64 bits according to the openApi 3.0.0 specification(opens new window)
  - [ ] float: float according to the openApi 3.0.0 specification(opens new window)
  - [ ] double: double according to the openApi 3.0.0 specification(opens new window)
  - [x] password: password string according to the openApi 3.0.0 specification(opens new window)
  - [ ] binary: binary string according to the openApi 3.0.0 specification

## useForm

- [ ] submitting
- [ ] validation strategy
  - [ ] validate on submit
  - [ ] continuous validation
  - [ ] validate touched and on submit
- [ ] dirty
- [ ] touched

## Miscellaneous

- [ ] Dark Logo
- [ ] Draggable List Items
- [ ] Divider (horizontal/vertical)
- [ ] Spacer
- [ ] On iPhone/iPad the height of the Main panel of the AppShell should be limited to 100dhv minus header height or whatever
- [ ] Styling of NativeSelect in Safari displays the default shaded style instead of the BeatUI skin.
- [ ] Styling of ColorInput in Safari displays the default shaded style instead of the BeatUI skin.

## Modal/Overlay

- [ ] When Modal is on the smaller Media breakpoint, it should take the entire screen
- [ ] When the drawer width (left or right open) or height (top or bottom open) is bigger than the available space it should take at most the available space
- [ ] Modal should use ScrollablePanel to show the header/body/footer.

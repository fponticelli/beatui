import {
  Button,
  TextInput,
  TextArea,
  NumberInput,
  DateInput,
  CheckboxInput,
  TagsInput,
  Toggle,
  SegmentedControl,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";
import { DisabledSelector } from "../elements/disabled-selector";

export const FormPage = () => {
  const disabled = prop(false);
  const hasError = prop(false);

  // Form field values
  const firstName = prop("John");
  const lastName = prop("Doe");
  const email = prop("john.doe@example.com");
  const age = prop(25);
  const birthDate = prop(new Date("1998-01-01"));
  const bio = prop("Software developer with a passion for creating amazing user experiences.");
  const newsletter = prop(true);
  const notifications = prop(false);
  const skills = prop(["JavaScript", "TypeScript", "React"]);
  const experience = prop(1); // 0: Beginner, 1: Intermediate, 2: Advanced
  const theme = prop(0); // 0: Light, 1: Dark, 2: Auto

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      html.div(DisabledSelector({ disabled })),
      html.div(
        Toggle({
          label: "Has Error",
          value: hasError,
          onChange: (value: boolean) => hasError.set(value)
        })
      )
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto bu-space-y-lg"),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Complete Form Example"),
        html.form(
          attr.class("bu-p-6 bu-border bu-rounded bu-space-y-4 bu-bg-white"),
          html.h4(attr.class("bu-text-md bu-font-medium bu-mb-4"), "User Profile"),

          // Personal Information Section
          html.div(
            attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-gap-4"),
            html.div(
              attr.class("bu-space-y-2"),
              Label("First Name"),
              TextInput({
                value: firstName,
                placeholder: prop("Enter your first name"),
                disabled,
                hasError,
                onInput: (value: string) => firstName.set(value)
              })
            ),
            html.div(
              attr.class("bu-space-y-2"),
              Label("Last Name"),
              TextInput({
                value: lastName,
                placeholder: prop("Enter your last name"),
                disabled,
                hasError,
                onInput: (value: string) => lastName.set(value)
              })
            )
          ),

          html.div(
            attr.class("bu-space-y-2"),
            Label("Email Address"),
            TextInput({
              value: email,
              placeholder: prop("Enter your email"),
              disabled,
              hasError,
              onInput: (value: string) => email.set(value)
            })
          ),

          html.div(
            attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-gap-4"),
            html.div(
              attr.class("bu-space-y-2"),
              Label("Age"),
              NumberInput({
                value: age,
                min: prop(18),
                max: prop(100),
                disabled,
                hasError,
                onChange: (value: number) => age.set(value)
              })
            ),
            html.div(
              attr.class("bu-space-y-2"),
              Label("Birth Date"),
              DateInput({
                value: birthDate,
                disabled,
                hasError,
                onChange: (value: Date) => birthDate.set(value)
              })
            )
          ),

          html.div(
            attr.class("bu-space-y-2"),
            Label("Bio"),
            TextArea({
              value: bio,
              placeholder: prop("Tell us about yourself"),
              rows: prop(4),
              disabled,
              hasError,
              onInput: (value: string) => bio.set(value)
            })
          ),

          html.div(
            attr.class("bu-space-y-2"),
            Label("Skills"),
            TagsInput({
              value: skills,
              placeholder: prop("Add your skills"),
              disabled,
              hasError,
              onChange: (value: string[]) => skills.set(value)
            })
          ),

          html.div(
            attr.class("bu-space-y-2"),
            Label("Experience Level"),
            SegmentedControl({
              segments: [
                { label: "Beginner", onSelect: () => experience.set(0) },
                { label: "Intermediate", onSelect: () => experience.set(1) },
                { label: "Advanced", onSelect: () => experience.set(2) }
              ],
              activeSegment: experience
            })
          ),

          html.div(
            attr.class("bu-space-y-2"),
            Label("Theme Preference"),
            SegmentedControl({
              segments: [
                { label: "Light", onSelect: () => theme.set(0) },
                { label: "Dark", onSelect: () => theme.set(1) },
                { label: "Auto", onSelect: () => theme.set(2) }
              ],
              activeSegment: theme
            })
          ),

          html.div(
            attr.class("bu-space-y-3"),
            html.div(
              CheckboxInput({
                value: newsletter,
                placeholder: prop("Subscribe to newsletter"),
                disabled,
                onChange: (value: boolean) => newsletter.set(value)
              })
            ),
            html.div(
              CheckboxInput({
                value: notifications,
                placeholder: prop("Enable push notifications"),
                disabled,
                onChange: (value: boolean) => notifications.set(value)
              })
            )
          ),

          html.div(
            attr.class("bu-flex bu-gap-4 bu-pt-4"),
            Button(
              {
                variant: prop("filled"),
                color: prop("primary"),
                disabled,
                onClick: () => {
                  console.log("Form submitted:", {
                    firstName: firstName.value,
                    lastName: lastName.value,
                    email: email.value,
                    age: age.value,
                    birthDate: birthDate.value,
                    bio: bio.value,
                    skills: skills.value,
                    experience: experience.value,
                    theme: theme.value,
                    newsletter: newsletter.value,
                    notifications: notifications.value
                  });
                }
              },
              "Save Profile"
            ),
            Button(
              {
                variant: prop("outline"),
                disabled,
                onClick: () => {
                  firstName.set("John");
                  lastName.set("Doe");
                  email.set("john.doe@example.com");
                  age.set(25);
                  birthDate.set(new Date("1998-01-01"));
                  bio.set("Software developer with a passion for creating amazing user experiences.");
                  skills.set(["JavaScript", "TypeScript", "React"]);
                  experience.set(1);
                  theme.set(0);
                  newsletter.set(true);
                  notifications.set(false);
                }
              },
              "Reset"
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Individual Form Components"),
        html.div(
          attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-gap-6"),

          // TextInput Examples
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Text Input"),
            html.div(
              attr.class("bu-space-y-3"),
              html.div(
                attr.class("bu-space-y-1"),
                html.label(attr.class("bu-text-sm bu-font-medium"), "Basic"),
                TextInput({
                  value: prop("Sample text"),
                  placeholder: prop("Enter text"),
                  disabled,
                  hasError,
                  onInput: (value: string) => console.log("Text input:", value)
                })
              ),
              html.div(
                attr.class("bu-space-y-1"),
                html.label(attr.class("bu-text-sm bu-font-medium"), "With Placeholder"),
                TextInput({
                  value: prop(""),
                  placeholder: prop("Type something here..."),
                  disabled,
                  hasError,
                  onInput: (value: string) => console.log("Text input:", value)
                })
              )
            )
          ),

          // NumberInput Examples
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Number Input"),
            html.div(
              attr.class("bu-space-y-3"),
              html.div(
                attr.class("bu-space-y-1"),
                html.label(attr.class("bu-text-sm bu-font-medium"), "Basic"),
                NumberInput({
                  value: prop(42),
                  disabled,
                  hasError,
                  onChange: (value: number) => console.log("Number:", value)
                })
              ),
              html.div(
                attr.class("bu-space-y-1"),
                html.label(attr.class("bu-text-sm bu-font-medium"), "With Min/Max/Step"),
                NumberInput({
                  value: prop(50),
                  min: prop(0),
                  max: prop(100),
                  step: prop(5),
                  disabled,
                  hasError,
                  onChange: (value: number) => console.log("Number:", value)
                })
              )
            )
          ),

          // DateInput Examples
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Date Input"),
            html.div(
              attr.class("bu-space-y-3"),
              html.div(
                attr.class("bu-space-y-1"),
                html.label(attr.class("bu-text-sm bu-font-medium"), "Birth Date"),
                DateInput({
                  value: prop(new Date("1990-01-01")),
                  disabled,
                  hasError,
                  onChange: (value: Date) => console.log("Date:", value)
                })
              ),
              html.div(
                attr.class("bu-space-y-1"),
                html.label(attr.class("bu-text-sm bu-font-medium"), "Event Date"),
                DateInput({
                  value: prop(new Date()),
                  disabled,
                  hasError,
                  onChange: (value: Date) => console.log("Date:", value)
                })
              )
            )
          ),

          // CheckboxInput Examples
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Checkbox Input"),
            html.div(
              attr.class("bu-space-y-3"),
              CheckboxInput({
                value: prop(true),
                placeholder: prop("I agree to the terms"),
                disabled,
                onChange: (value: boolean) => console.log("Checkbox:", value)
              }),
              CheckboxInput({
                value: prop(false),
                placeholder: prop("Send me updates"),
                disabled,
                onChange: (value: boolean) => console.log("Checkbox:", value)
              }),
              CheckboxInput({
                value: prop(true),
                placeholder: prop("Remember my preferences"),
                disabled,
                onChange: (value: boolean) => console.log("Checkbox:", value)
              })
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "TextArea Component"),
        html.div(
          attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-gap-6"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Small TextArea"),
            TextArea({
              value: prop("This is a small text area for short descriptions."),
              placeholder: prop("Enter a short description"),
              rows: prop(3),
              disabled,
              hasError,
              onInput: (value: string) => console.log("TextArea:", value)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Large TextArea"),
            TextArea({
              value: prop("This is a larger text area suitable for longer content like comments, feedback, or detailed descriptions. It provides more space for users to express their thoughts."),
              placeholder: prop("Enter detailed information"),
              rows: prop(6),
              disabled,
              hasError,
              onInput: (value: string) => console.log("TextArea:", value)
            })
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Form States & Validation"),
        html.div(
          attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-3 bu-gap-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Normal State"),
            html.div(
              attr.class("bu-space-y-3"),
              TextInput({
                value: prop("Normal input"),
                placeholder: prop("Enter text"),
                onInput: (value: string) => console.log("Normal:", value)
              }),
              NumberInput({
                value: prop(123),
                onChange: (value: number) => console.log("Normal number:", value)
              }),
              CheckboxInput({
                value: prop(true),
                placeholder: prop("Normal checkbox"),
                onChange: (value: boolean) => console.log("Normal checkbox:", value)
              })
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Disabled State"),
            html.div(
              attr.class("bu-space-y-3"),
              TextInput({
                value: prop("Disabled input"),
                placeholder: prop("Cannot edit"),
                disabled: prop(true),
                onInput: (value: string) => console.log("Disabled:", value)
              }),
              NumberInput({
                value: prop(456),
                disabled: prop(true),
                onChange: (value: number) => console.log("Disabled number:", value)
              }),
              CheckboxInput({
                value: prop(false),
                placeholder: prop("Disabled checkbox"),
                disabled: prop(true),
                onChange: (value: boolean) => console.log("Disabled checkbox:", value)
              })
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-3"), "Error State"),
            html.div(
              attr.class("bu-space-y-3"),
              TextInput({
                value: prop("Invalid input"),
                placeholder: prop("Has error"),
                hasError: prop(true),
                onInput: (value: string) => console.log("Error:", value)
              }),
              NumberInput({
                value: prop(-1),
                hasError: prop(true),
                onChange: (value: number) => console.log("Error number:", value)
              }),
              CheckboxInput({
                value: prop(false),
                placeholder: prop("Required checkbox"),
                hasError: prop(true),
                onChange: (value: boolean) => console.log("Error checkbox:", value)
              })
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Form Best Practices"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded bu-bg-gray-50"),
          html.div(
            attr.class("bu-space-y-2 bu-text-sm"),
            html.div(attr.class("bu-font-medium"), "Form Component Features:"),
            html.div("✅ Consistent styling across all input types"),
            html.div("✅ Built-in validation state support"),
            html.div("✅ Accessibility features (ARIA labels, keyboard navigation)"),
            html.div("✅ Responsive design with proper spacing"),
            html.div("✅ Error state handling"),
            html.div("✅ Disabled state support"),
            html.br(),
            html.div(attr.class("bu-font-medium"), "Available Components:"),
            html.div("• TextInput - Single-line text input"),
            html.div("• TextArea - Multi-line text input"),
            html.div("• NumberInput - Numeric input with min/max/step"),
            html.div("• DateInput - Date picker input"),
            html.div("• CheckboxInput - Checkbox with label"),
            html.div("• TagsInput - Multi-tag input field"),
            html.div("• Toggle - Switch/toggle component"),
            html.div("• SegmentedControl - Multi-option selector"),
            html.br(),
            html.div(attr.class("bu-font-medium"), "Usage Tips:"),
            html.div("• Always provide meaningful placeholders"),
            html.div("• Use proper labels for accessibility"),
            html.div("• Handle validation states appropriately"),
            html.div("• Group related fields logically"),
            html.div("• Provide clear feedback for user actions")
          )
        )
      )
    )
  );
};

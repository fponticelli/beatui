import {
  EditableText,
  Toggle,
  TextInput,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";

export const EditableTextPage = () => {
  const startEditing = prop(false);
  const placeholder = prop("Click to edit");
  const value1 = prop("Editable text example");
  const value2 = prop("Another example");
  const value3 = prop("");
  const value4 = prop("Long text that can be edited inline");

  return Stack(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("Start Editing"),
      html.div(
        Toggle({
          label: "Start in edit mode",
          value: startEditing,
          onChange: (value: boolean) => startEditing.set(value)
        })
      ),
      Label("Placeholder"),
      html.div(
        TextInput({
          value: placeholder,
          onInput: (value: string) => placeholder.set(value)
        })
      )
    ),
    html.div(
      attr.class("bu-h-full bu-overflow-auto bu-space-y-lg"),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Interactive Examples"),
        html.div(
          attr.class("bu-space-y-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Basic Editable Text"),
            EditableText({
              value: value1,
              onChange: (newValue: string) => {
                console.log('Value changed:', newValue);
                value1.set(newValue);
              },
              placeholder,
              startEditing
            }),
            html.div(
              attr.class("bu-mt-2 bu-text-sm bu-text-gray-600"),
              "Current value: ",
              value1
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "With Custom Placeholder"),
            EditableText({
              value: value2,
              onChange: (newValue: string) => {
                console.log('Value2 changed:', newValue);
                value2.set(newValue);
              },
              placeholder: prop("Enter your text here"),
              startEditing: prop(false)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Empty State"),
            EditableText({
              value: value3,
              onChange: (newValue: string) => {
                console.log('Value3 changed:', newValue);
                value3.set(newValue);
              },
              placeholder: prop("This field is empty - click to add content"),
              startEditing: prop(false)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Long Text Example"),
            EditableText({
              value: value4,
              onChange: (newValue: string) => {
                console.log('Value4 changed:', newValue);
                value4.set(newValue);
              },
              placeholder: prop("Enter a longer description"),
              startEditing: prop(false)
            })
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Common Use Cases"),
        html.div(
          attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-gap-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Page Title"),
            html.div(attr.class("bu-text-2xl bu-font-bold"),
              EditableText({
                value: prop("My Document Title"),
                onChange: (newValue: string) => console.log('Title changed:', newValue),
                placeholder: prop("Enter document title")
              })
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "User Name"),
            html.div(
              attr.class("bu-flex bu-items-center bu-gap-2"),
              html.span("Hello, "),
              EditableText({
                value: prop("John Doe"),
                onChange: (newValue: string) => console.log('Name changed:', newValue),
                placeholder: prop("Enter your name")
              }),
              html.span("!")
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Description"),
            EditableText({
              value: prop("This is a sample description that can be edited inline."),
              onChange: (newValue: string) => console.log('Description changed:', newValue),
              placeholder: prop("Add a description")
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Task Name"),
            html.div(
              attr.class("bu-flex bu-items-center bu-gap-2"),
              html.input(attr.type("checkbox")),
              EditableText({
                value: prop("Complete project documentation"),
                onChange: (newValue: string) => console.log('Task changed:', newValue),
                placeholder: prop("Enter task name")
              })
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Form Integration"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded"),
          html.form(
            attr.class("bu-space-y-4"),
            html.div(
              attr.class("bu-space-y-2"),
              html.label(attr.class("bu-block bu-font-medium"), "Project Name:"),
              EditableText({
                value: prop("My Awesome Project"),
                onChange: (newValue: string) => console.log('Project name:', newValue),
                placeholder: prop("Enter project name")
              })
            ),
            html.div(
              attr.class("bu-space-y-2"),
              html.label(attr.class("bu-block bu-font-medium"), "Description:"),
              EditableText({
                value: prop("A brief description of the project goals and objectives."),
                onChange: (newValue: string) => console.log('Project description:', newValue),
                placeholder: prop("Enter project description")
              })
            ),
            html.div(
              attr.class("bu-space-y-2"),
              html.label(attr.class("bu-block bu-font-medium"), "Owner:"),
              EditableText({
                value: prop(""),
                onChange: (newValue: string) => console.log('Project owner:', newValue),
                placeholder: prop("Assign project owner")
              })
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Features & Behavior"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded bu-bg-gray-50"),
          html.div(
            attr.class("bu-space-y-2 bu-text-sm"),
            html.div(attr.class("bu-font-medium"), "EditableText Features:"),
            html.div("✅ Click to edit inline"),
            html.div("✅ Auto-focus and text selection"),
            html.div("✅ Save on Enter or blur"),
            html.div("✅ Cancel on Escape"),
            html.div("✅ Placeholder support for empty values"),
            html.div("✅ Accessibility with proper ARIA labels"),
            html.br(),
            html.div(attr.class("bu-font-medium"), "Keyboard Controls:"),
            html.div("• Enter: Save changes"),
            html.div("• Escape: Cancel changes"),
            html.div("• Click outside: Save changes"),
            html.br(),
            html.div(attr.class("bu-font-medium"), "Usage:"),
            html.div(attr.class("bu-font-mono bu-bg-white bu-p-2 bu-rounded"), 'EditableText({ value, onChange, placeholder })')
          )
        )
      )
    )
  );
};

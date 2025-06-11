import {
  ControlSize,
  Tag,
  TagsInput,
  ThemeColorName,
  Switch,
  TextInput,
  Stack,
  Label,
  Group
} from "@tempots/beatui";
import { html, attr, prop } from "@tempots/dom";
import { ControlSizeSelector } from "../elements/control-size-selector";
import { DisabledSelector } from "../elements/disabled-selector";

const allColors: ThemeColorName[] = [
  "base",
  "primary",
  "secondary",
  "success",
  "warning",
  "error",
  "info"
];

export const TagsPage = () => {
  const size = prop<ControlSize>("md");
  const disabled = prop(false);
  const placeholder = prop("Add tag");
  const tagsValue = prop(["JavaScript", "TypeScript", "React"]);
  const sampleTags = prop(["Frontend", "Backend", "DevOps"]);

  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack(
      Label("Size"),
      html.div(ControlSizeSelector({ size })),
      html.div(DisabledSelector({ disabled })),
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
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "TagsInput - Interactive Example"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded"),
          TagsInput({
            value: tagsValue,
            disabled,
            placeholder,
            onChange: (newTags: string[]) => {
              console.log('Tags changed:', newTags);
              tagsValue.set(newTags);
            },
            onBlur: (tags: string[]) => console.log('Tags blur:', tags)
          }),
          html.div(
            attr.class("bu-mt-4 bu-text-sm bu-text-gray-600"),
            "Current tags: ",
            tagsValue.map(tags => tags.join(", ") || "None")
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "TagsInput - Common Use Cases"),
        html.div(
          attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-gap-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Skills"),
            TagsInput({
              value: prop(["JavaScript", "Python", "Go", "Rust"]),
              placeholder: "Add programming language",
              onChange: (tags: string[]) => console.log('Skills changed:', tags)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Categories"),
            TagsInput({
              value: sampleTags,
              placeholder: "Add category",
              onChange: (tags: string[]) => {
                console.log('Categories changed:', tags);
                sampleTags.set(tags);
              }
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Keywords"),
            TagsInput({
              value: prop(["web", "development", "ui", "ux"]),
              placeholder: "Add keyword",
              onChange: (tags: string[]) => console.log('Keywords changed:', tags)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Team Members"),
            TagsInput({
              value: prop(["alice", "bob", "charlie"]),
              placeholder: "Add team member",
              onChange: (tags: string[]) => console.log('Team members changed:', tags)
            })
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "TagsInput - States"),
        html.div(
          attr.class("bu-space-y-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "With Tags"),
            TagsInput({
              value: prop(["JavaScript", "TypeScript", "React"]),
              placeholder: "Add technology",
              onChange: (tags: string[]) => console.log('With tags changed:', tags)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Empty"),
            TagsInput({
              value: prop([]),
              placeholder: "Add tags",
              onChange: (tags: string[]) => console.log('Empty changed:', tags)
            })
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Disabled"),
            TagsInput({
              value: prop(["Read-only", "Disabled"]),
              disabled: prop(true),
              placeholder: "Cannot edit",
              onChange: (tags: string[]) => console.log('Disabled changed:', tags)
            })
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Tag Component - Color Variations"),
        html.div(
          attr.class("bu-p-4 bu-border bu-rounded"),
          html.div(
            attr.class("bu-flex bu-flex-wrap bu-gap-2"),
            ...allColors.map(color =>
              Tag({
                value: prop(color),
                color: prop(color),
                onClose: (value: string) => console.log(`Closed tag: ${value}`)
              })
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Tag Component - States"),
        html.div(
          attr.class("bu-space-y-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "With Close Button"),
            html.div(
              attr.class("bu-flex bu-flex-wrap bu-gap-2"),
              Tag({
                value: prop("Closeable"),
                color: prop("primary"),
                onClose: (value: string) => console.log(`Closed: ${value}`)
              }),
              Tag({
                value: prop("Another Tag"),
                color: prop("success"),
                onClose: (value: string) => console.log(`Closed: ${value}`)
              })
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Without Close Button"),
            html.div(
              attr.class("bu-flex bu-flex-wrap bu-gap-2"),
              Tag({
                value: prop("Read-only"),
                color: prop("info")
              }),
              Tag({
                value: prop("Static Tag"),
                color: prop("warning")
              })
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Disabled"),
            html.div(
              attr.class("bu-flex bu-flex-wrap bu-gap-2"),
              Tag({
                value: prop("Disabled"),
                color: prop("base"),
                disabled: prop(true),
                onClose: (value: string) => console.log(`Closed: ${value}`)
              }),
              Tag({
                value: prop("Also Disabled"),
                color: prop("primary"),
                disabled: prop(true)
              })
            )
          )
        )
      ),
      html.div(
        attr.class("bu-space-y-md"),
        html.h3(attr.class("bu-text-lg bu-font-semibold"), "Tag Component - Use Cases"),
        html.div(
          attr.class("bu-grid bu-grid-cols-1 bu-md:grid-cols-2 bu-gap-4"),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Status Tags"),
            html.div(
              attr.class("bu-flex bu-flex-wrap bu-gap-2"),
              Tag({ value: prop("Active"), color: prop("success") }),
              Tag({ value: prop("Pending"), color: prop("warning") }),
              Tag({ value: prop("Inactive"), color: prop("error") }),
              Tag({ value: prop("Draft"), color: prop("base") })
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Priority Tags"),
            html.div(
              attr.class("bu-flex bu-flex-wrap bu-gap-2"),
              Tag({ value: prop("High"), color: prop("error") }),
              Tag({ value: prop("Medium"), color: prop("warning") }),
              Tag({ value: prop("Low"), color: prop("success") }),
              Tag({ value: prop("Critical"), color: prop("error") })
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Category Tags"),
            html.div(
              attr.class("bu-flex bu-flex-wrap bu-gap-2"),
              Tag({ value: prop("Frontend"), color: prop("primary") }),
              Tag({ value: prop("Backend"), color: prop("secondary") }),
              Tag({ value: prop("Design"), color: prop("info") }),
              Tag({ value: prop("Testing"), color: prop("warning") })
            )
          ),
          html.div(
            attr.class("bu-p-4 bu-border bu-rounded"),
            html.h4(attr.class("bu-font-medium bu-mb-2"), "Removable Tags"),
            html.div(
              attr.class("bu-flex bu-flex-wrap bu-gap-2"),
              Tag({
                value: prop("JavaScript"),
                color: prop("primary"),
                onClose: (value: string) => console.log(`Removed: ${value}`)
              }),
              Tag({
                value: prop("TypeScript"),
                color: prop("info"),
                onClose: (value: string) => console.log(`Removed: ${value}`)
              }),
              Tag({
                value: prop("React"),
                color: prop("success"),
                onClose: (value: string) => console.log(`Removed: ${value}`)
              })
            )
          )
        )
      )
    )
  );
};

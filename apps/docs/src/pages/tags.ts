import { attr } from "@tempots/dom";
import { Group, Stack } from "@tempots/beatui";

export const TagsPage = () => {
  return Group(
    attr.class("bu-items-start bu-gap-2 bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack()
  );
};

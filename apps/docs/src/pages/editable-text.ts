import {
  Stack,
  Group
} from "@tempots/beatui";
import { attr, prop } from "@tempots/dom";

export const EditableTextPage = () => {
  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack()
  );
};

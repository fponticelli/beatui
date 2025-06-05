import {
  Stack,
  Group
} from "@tempots/beatui";
import { attr } from "@tempots/dom";

export const BreakpointPage = () => {
  return Group(
    attr.class("bu-items-start bu-gap-md bu-p-2 bu-h-full bu-overflow-hidden"),
    Stack()
  );
};

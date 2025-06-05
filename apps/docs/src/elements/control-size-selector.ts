import { ControlSize, SegmentedControl } from "@tempots/beatui";
import { Prop } from "@tempots/dom";

const allSizes: ControlSize[] = ["xs", "sm", "md", "lg", "xl"];

export function ControlSizeSelector({ size }: { size: Prop<ControlSize> }) {
  const activeSegment = size.map(size => allSizes.indexOf(size)).deriveProp();
  return SegmentedControl({
    segments: [
      { label: "XS", onSelect: () => size.set("xs") },
      { label: "SM", onSelect: () => size.set("sm") },
      { label: "MD", onSelect: () => size.set("md") },
      { label: "LG", onSelect: () => size.set("lg") },
      { label: "XL", onSelect: () => size.set("xl") }
    ],
    activeSegment
  });
}

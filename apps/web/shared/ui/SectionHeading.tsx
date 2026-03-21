import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Props = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
};

export function SectionHeading({ as = "h2", className, ...props }: Props) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        "font-display tracking-[0.2em] uppercase",
        as === "h1"
          ? "text-3xl md:text-4xl"
          : as === "h2"
            ? "text-2xl"
            : "text-xl",
        "neon-text-cyan",
        className,
      )}
      {...props}
    />
  );
}

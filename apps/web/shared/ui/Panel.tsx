import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: "cyan" | "pink" | "neutral";
};

const variantClass = {
  cyan: "aug-panel aug-panel--cyan",
  pink: "aug-panel aug-panel--pink",
  neutral: "aug-panel aug-panel--neutral",
};

export function Panel({ className, variant = "neutral", ...props }: Props) {
  return (
    <div
      className={cn(
        "cyber-card archetype-panel",
        variantClass[variant],
        "rounded-lg p-6 relative overflow-visible",
        className,
      )}
      
      {...props}
    />
  );
}




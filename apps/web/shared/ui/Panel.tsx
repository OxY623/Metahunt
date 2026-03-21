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
        "augmented-ui cyber-card",
        variantClass[variant],
        "rounded-lg p-6 relative overflow-hidden",
        className,
      )}
      data-augmented-ui="tl-clip tr-clip bl-clip br-clip inlay"
      {...props}
    />
  );
}
